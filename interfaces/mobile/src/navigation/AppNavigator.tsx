import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LandScreen from '../screens/LandScreen';
import AlgoScreen from '../screens/AlgoScreen';
import AgriScreen from '../screens/AgriScreen';
import DiplomaScreen from '../screens/DiplomaScreen';
import { Activity, Map as MapIcon, Brain, Leaf, Award } from '../components/Icons';
import { palette } from '../theme/palette';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }: any) {
  const user = route.params?.user || {};
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.gray,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Tableau" 
        component={DashboardScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Activity color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Foncier" 
        component={LandScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MapIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Agri" 
        component={AgriScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Leaf color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Algo" 
        component={AlgoScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Brain color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Diplôme" 
        component={DiplomaScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Award color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
