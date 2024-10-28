import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
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
  folderId: string;
}

export default function AllTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = async () => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const storedData = JSON.parse(fileContent);

      const allTasks = storedData.reduce((acc: Task[], folder: any) => {
        const folderTasks = (folder.tasks || []).map((task: any) => ({
          ...task,
          folderId: folder.id,
        }));
        return acc.concat(folderTasks);
      }, []);

      setTasks(allTasks);
    } catch (error) {
      console.log('File read error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const toggleTaskCompletion = async (taskId: string, folderId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    // Dosyada görevin tamamlanma durumunu güncelle
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const storedData = JSON.parse(fileContent);
      const folderIndex = storedData.findIndex((folder: any) => folder.id === folderId);

      if (folderIndex !== -1) {
        const folderTasks = storedData[folderIndex].tasks.map((task: any) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        storedData[folderIndex].tasks = folderTasks;
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(storedData));
      }
    } catch (error) {
      console.log('Error updating task completion:', error);
    }
  };

  const deleteTask = (taskId: string, folderId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedTasks = tasks.filter(task => task.id !== taskId);
          setTasks(updatedTasks);

          // Dosyada görevi klasör bazında sil
          try {
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const storedData = JSON.parse(fileContent);
            const folderIndex = storedData.findIndex((folder: any) => folder.id === folderId);
            if (folderIndex !== -1) {
              const folderTasks = storedData[folderIndex].tasks.filter((task: any) => task.id !== taskId);
              storedData[folderIndex].tasks = folderTasks;
              await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(storedData));
            }
          } catch (error) {
            console.log('Error deleting task:', error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.header}>All Tasks</ThemedText>

        {tasks.length === 0 ? (
          <ThemedText style={styles.noTasksText}>No tasks found</ThemedText>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.taskContainer}>
                <TouchableOpacity onPress={() => toggleTaskCompletion(item.id, item.folderId)} style={[styles.checkbox, item.completed && styles.completedCheckbox]}>
                  {item.completed && <Ionicons name="checkmark" size={28} color="white" />}
                </TouchableOpacity>
                <ThemedText style={[styles.taskText, item.completed && styles.completedTaskText]}>
                  {item.name}
                </ThemedText>
                <TouchableOpacity onPress={() => deleteTask(item.id, item.folderId)} style={styles.iconButton}>
                  <Ionicons name="trash" size={28} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginVertical: 20,
    color: '#000',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginRight: 12,
  },
  completedCheckbox: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  taskText: {
    fontSize: 18,
    flex: 1,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  iconButton: {
    padding: 8,
  },
  noTasksText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    padding: 10,
  },
});
