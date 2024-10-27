import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

const fileUri = FileSystem.documentDirectory + 'folders.json';

type TaskScreenRouteProp = RouteProp<RootStackParamList, 'Task'>;

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

interface TaskScreenProps {
  route: TaskScreenRouteProp;
}

const TaskScreen: React.FC<TaskScreenProps> = ({ route }) => {
  const { folderName } = route.params;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState<string>('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const storedData = JSON.parse(fileContent);
        const folderTasks = storedData.find((folder: { name: string }) => folder.name === folderName)?.tasks || [];
        setTasks(folderTasks);
      } catch (error) {
        console.log('File read error:', error);
      }
    };
    loadTasks();
  }, [folderName]);

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const storedData = JSON.parse(fileContent);
      const folderIndex = storedData.findIndex((folder: { name: string }) => folder.name === folderName);
      if (folderIndex !== -1) {
        storedData[folderIndex].tasks = updatedTasks;
      }
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(storedData));
    } catch (error) {
      console.log('File write error:', error);
    }
  };

  const addTask = () => {
    if (newTaskName.trim() === '') {
      Alert.alert('Please enter a task name');
      return;
    }
    const newTask: Task = { id: Date.now().toString(), name: newTaskName, completed: false };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setNewTaskName('');
    saveTasks(updatedTasks);
  };

  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{folderName} Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={styles.checkbox}>
              {item.completed && <Ionicons name="checkmark" size={16} color="white" />}
            </TouchableOpacity>
            <Text style={[styles.taskText, item.completed && styles.completedTaskText]}>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconButton}>
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.addTaskContainer}>
        <TextInput
          placeholder="Enter task name"
          value={newTaskName}
          onChangeText={setNewTaskName}
          style={styles.input}
        />
        <TouchableOpacity onPress={addTask} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  addTaskContainer: { flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: 20, left: 20, right: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, marginRight: 10, borderRadius: 8 },
  addButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  taskContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, marginVertical: 6, borderRadius: 8, backgroundColor: '#fff' },
  checkbox: { marginRight: 12, backgroundColor: '#4CAF50', borderRadius: 12 },
  taskText: { fontSize: 18, flex: 1 },
  completedTaskText: { textDecorationLine: 'line-through', color: 'gray' },
  iconButton: { padding: 8 },
});

export default TaskScreen;
