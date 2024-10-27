import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Folder {
  id: string;
  name: string;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

type RootStackParamList = {
  Task: { folderName: string };
  Home: undefined;
};

const fileUri = FileSystem.documentDirectory + 'folders.json';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState<string>('');

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const savedFolders = JSON.parse(fileContent) as Folder[];
        setFolders(savedFolders);
      } catch (error) {
        console.log('File read error or file does not exist:', error);
      }
    };
    loadFolders();
  }, []);

  const saveFolders = async (foldersToSave: Folder[]) => {
    try {
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(foldersToSave));
    } catch (error) {
      console.log('File write error:', error);
    }
  };

  const addFolder = () => {
    if (newFolderName.trim() === '') {
      Alert.alert('Please enter a folder name');
      return;
    }
    const newFolder: Folder = { id: Date.now().toString(), name: newFolderName, tasks: [] };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    setNewFolderName('');
    saveFolders(updatedFolders);
  };

  const deleteFolder = (folderId: string) => {
    Alert.alert('Delete Folder', 'Are you sure you want to delete this folder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedFolders = folders.filter(folder => folder.id !== folderId);
          setFolders(updatedFolders);
          saveFolders(updatedFolders);
        },
      },
    ]);
  };

  const openFolder = (folderName: string) => {
    navigation.navigate("Task", { folderName });
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter folder name"
        value={newFolderName}
        onChangeText={setNewFolderName}
        style={styles.input}
      />
      <TouchableOpacity onPress={addFolder} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Folder</Text>
      </TouchableOpacity>

      <FlatList
  data={folders}
  keyExtractor={(item) => item.id}  // Ensure each folder has a unique id as the key
  renderItem={({ item, index }) => (
    <TouchableOpacity
      key={item.id}  // Use item.id as the key for each folder
      onPress={() => openFolder(item.name)}
      onLongPress={() => deleteFolder(item.id)}
      style={[styles.folderContainer, { backgroundColor: getStableColor(index) }]}
    >
      <Ionicons name="folder" size={24} color="white" />
      <Text style={styles.folderText}>{item.name}</Text>
    </TouchableOpacity>
  )}
/>
    </View>
  );
};

const getStableColor = (index: number) => {
  const colors = ['#FFD700', '#FF6347', '#4682B4', '#32CD32', '#FF69B4', '#9370DB'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 8 },
  addButton: { backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  folderContainer: { padding: 15, borderRadius: 10, marginVertical: 8, flexDirection: 'row', alignItems: 'center' },
  folderText: { fontSize: 18, color: 'white', marginLeft: 10, fontWeight: 'bold' },
});

export default HomeScreen;
