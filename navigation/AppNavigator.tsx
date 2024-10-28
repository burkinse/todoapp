import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import TaskScreen from '../screens/TaskScreen';
import { StyleSheet } from 'react-native';

export type RootStackParamList = {
  HomeScreen: undefined;
  Task: { folderName: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="HomeScreen">
    <Stack.Screen 
      name="HomeScreen" 
      component={HomeScreen} 
      options={{ 
        title: 'TO-DO APP',
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTintColor: '#FFFFFF', // Beyaz metin rengi
      }} 
    />
    <Stack.Screen
      name="Task"
      component={TaskScreen}
      options={({ route }) => ({ 
        title: route.params.folderName,
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
        headerTintColor: '#FFFFFF', // Beyaz metin rengi
      })}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#FF6347', // Domates rengi arka plan
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  headerTitleStyle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // Beyaz
    textAlign: 'center',
    textShadowColor: '#FF4500', // Canlı kırmızı gölge
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});

export default AppNavigator;
