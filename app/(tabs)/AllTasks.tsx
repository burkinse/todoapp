import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';

const fileUri = FileSystem.documentDirectory + 'folders.json';

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

interface TaskCategory {
  title: string;
  tasks: Task[];
}

export default function AllTasks() {
  const [categories, setCategories] = useState<TaskCategory[]>([]);

  const loadTasksByCategory = async () => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const storedData = JSON.parse(fileContent);

      const categorizedTasks: TaskCategory[] = storedData.map((folder: any) => ({
        title: folder.name,
        tasks: Array.isArray(folder.tasks) ? folder.tasks : [],
      }));

      setCategories(categorizedTasks);
    } catch (error) {
      console.log('File read error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasksByCategory(); // Reload tasks when AllTasks screen gains focus
    }, [])
  );

  const toggleTaskCompletion = (categoryIndex: number, taskId: string) => {
    const updatedCategories = [...categories];
    const taskList = updatedCategories[categoryIndex].tasks;
    const updatedTasks = taskList.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    updatedCategories[categoryIndex].tasks = updatedTasks;
    setCategories(updatedCategories);
  };

  const deleteTask = (categoryIndex: number, taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedCategories = [...categories];
          const updatedTasks = updatedCategories[categoryIndex].tasks.filter(task => task.id !== taskId);
          updatedCategories[categoryIndex].tasks = updatedTasks;
          setCategories(updatedCategories);
          await saveCategories(updatedCategories); // Save changes to disk
        },
      },
    ]);
  };

  const deleteAllCompletedTasks = () => {
    const updatedCategories = categories.map(category => ({
      ...category,
      tasks: category.tasks.filter(task => !task.completed),
    }));
    setCategories(updatedCategories);
  };

  const saveCategories = async (categoriesToSave: TaskCategory[]) => {
    const dataToSave = categoriesToSave.map(category => ({
      name: category.title,
      tasks: category.tasks,
    }));
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(dataToSave));
  };

  return (
    <ThemedView style={styles.container}>
      {categories.length === 0 ? (
        <ThemedText style={styles.noTasksText}>No categories or tasks found</ThemedText>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.title}
          renderItem={({ item, index }) => (
            <View style={styles.categoryContainer}>
              <ThemedText style={styles.categoryTitle}>{item.title}</ThemedText>
              {item.tasks.length === 0 ? (
                <ThemedText style={styles.noTasksText}>No tasks in this category</ThemedText>
              ) : (
                item.tasks.map(task => (
                  <View key={task.id} style={styles.taskContainer}>
                    <TouchableOpacity onPress={() => toggleTaskCompletion(index, task.id)} style={styles.checkbox}>
                      {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
                    </TouchableOpacity>
                    <ThemedText style={[styles.taskText, task.completed && styles.completedTaskText]}>
                      {task.name}
                    </ThemedText>
                    <View style={styles.taskActions}>
                      <TouchableOpacity onPress={() => toggleTaskCompletion(index, task.id)} style={styles.iconButton}>
                        <Ionicons name="pencil" size={20} color="#4CAF50" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteTask(index, task.id)} style={styles.iconButton}>
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
          ListFooterComponent={() => (
            <TouchableOpacity style={styles.clearButton} onPress={deleteAllCompletedTasks}>
              <ThemedText style={styles.clearButtonText}>Clear Completed Tasks</ThemedText>
            </TouchableOpacity>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 2, height: 4 },
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#4CAF50',
  },
  taskText: {
    fontSize: 18,
    flex: 1,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  taskActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  noTasksText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    padding: 10,
  },
  clearButton: {
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
