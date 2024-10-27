import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import TaskScreen from '../screens/TaskScreen';

export type RootStackParamList = {
  HomeScreen: undefined;
  Task: { folderName: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="HomeScreen">
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'TO-DO APP' }} />
    <Stack.Screen
      name="Task"
      component={TaskScreen}
      options={({ route }) => ({ title: route.params.folderName })}
    />
  </Stack.Navigator>
);

export default AppNavigator;
