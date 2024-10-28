import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Alert, StyleSheet, TouchableOpacity, Text, Modal, Dimensions } from 'react-native';
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
  const [folderNameInput, setFolderNameInput] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState<boolean>(false); // Add Task Modal durumu
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [newTaskName, setNewTaskName] = useState<string>('');

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

  const addOrEditFolder = () => {
    if (folderNameInput.trim() === '') {
      Alert.alert('Please enter a folder name');
      return;
    }

    if (selectedFolder) {
      const updatedFolders = folders.map(folder =>
        folder.id === selectedFolder.id ? { ...folder, name: folderNameInput } : folder
      );
      setFolders(updatedFolders);
      saveFolders(updatedFolders);
    } else {
      const newFolder: Folder = { id: Date.now().toString(), name: folderNameInput, tasks: [] };
      const updatedFolders = [...folders, newFolder];
      setFolders(updatedFolders);
      saveFolders(updatedFolders);
    }

    setFolderNameInput('');
    setSelectedFolder(null);
    setIsModalVisible(false);
  };

  const deleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  const openFolder = (folderName: string) => {
    navigation.navigate("Task", { folderName });
  };

  const openEditModal = (folder: Folder) => {
    setSelectedFolder(folder);
    setFolderNameInput(folder.name);
    setIsModalVisible(true);
  };

  const addTaskToSelectedFolder = () => {
    if (!selectedFolder || newTaskName.trim() === '') {
      Alert.alert('Please enter a task name');
      return;
    }
    const newTask: Task = { id: Date.now().toString(), name: newTaskName, completed: false };
    const updatedFolders = folders.map(folder =>
      folder.id === selectedFolder.id ? { ...folder, tasks: [...folder.tasks, newTask] } : folder
    );
    setFolders(updatedFolders);
    saveFolders(updatedFolders);
    setNewTaskName('');
    setSelectedFolder(null);
    setIsTaskModalVisible(false);
  };

  return (
    <View style={{ flex: 1, padding: 20 , backgroundColor: "white"}}>
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item, index }) => (
          <View style={[styles.folderContainer, { backgroundColor: getStableColor(index) }]}>
            {/* Folder adına tıklandığında Task ekranına geçiş */}
            <TouchableOpacity onPress={() => openFolder(item.name)} style={{ flex: 1 }}>
              <Text style={styles.folderText}>{item.name}</Text>
            </TouchableOpacity>

            {/* Sağ üst köşedeki üç nokta düzenleme butonu */}
            <TouchableOpacity
              style={styles.dotsButton}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="white" />
            </TouchableOpacity>

            {/* Add Task Butonu */}
            <TouchableOpacity
              style={[styles.iconButton, styles.plusButton]}
              onPress={() => {
                setSelectedFolder(item); // Hangi klasör için görev ekleneceğini seçiyoruz
                setIsTaskModalVisible(true); // Modal'ı açıyoruz
              }}
            >
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, styles.deleteButton]}
              onPress={() => deleteFolder(item.id)}
            >
              <Ionicons name="trash" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <View style={styles.newFolderContainer}>
        <TouchableOpacity onPress={() => { setIsModalVisible(true); setSelectedFolder(null); }} style={styles.addButton}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.newFolderText}>New Folder</Text>
      </View>

      {/* Add Task Modal */}
      <Modal
        visible={isTaskModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTaskModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Task to {selectedFolder?.name}</Text>
            <TextInput
              placeholder="Task name"
              value={newTaskName}
              onChangeText={setNewTaskName}
              style={styles.input}
            />
            <TouchableOpacity onPress={addTaskToSelectedFolder} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsTaskModalVisible(false);
                setNewTaskName('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Folder Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {selectedFolder ? "Change Folder Name" : "Enter Folder Name"}
            </Text>
            <TextInput
              placeholder="Folder name"
              value={folderNameInput}
              onChangeText={setFolderNameInput}
              style={styles.input}
            />
            <TouchableOpacity onPress={addOrEditFolder} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>
                {selectedFolder ? "Save Changes" : "Add Folder"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStableColor = (index: number) => {
  const colors = [
    '#FFD700',    
    '#E41515', 
    '#000000',
    "#0B45A7",
    '#04560E',
    '#FF4500', 
    '#4B0082', 
    '#DC143C',
    '#4682B4',
  ];
  return colors[index % colors.length];
};

const windowWidth = Dimensions.get('window').width;
const folderSize = (windowWidth - 80) / 2;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
  },
  newFolderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButton: {
    backgroundColor: '#000',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  newFolderText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  folderContainer: {
    width: folderSize,
    height: folderSize * 1.2,
    padding: 15,
    borderRadius: 20,
    margin: 10,
    alignItems: 'flex-start',
    position: 'relative',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: '#000',
  },
  folderText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dotsButton: {
    position: 'absolute',
    top: 6,
    right: 10,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    bottom: 10,
    left: 10,
  },
  deleteButton: {
    bottom: 10,
    right: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default HomeScreen;
