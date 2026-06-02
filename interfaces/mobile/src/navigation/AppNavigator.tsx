import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import {
  Activity,
  Award,
  Brain,
  Database,
  Leaf,
  Map as MapIcon,
  Shield,
} from "../components/Icons";
import AgriScreen from "../screens/AgriScreen";
import AlgoScreen from "../screens/AlgoScreen";
import DashboardScreen from "../screens/DashboardScreen";
import DiplomaScreen from "../screens/DiplomaScreen";
import FinanceScreen from "../screens/FinanceScreen";
import LandScreen from "../screens/LandScreen";
import LoginScreen from "../screens/LoginScreen";
import MinerScreen from "../screens/MinerScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { palette } from "../theme/palette";

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
          fontSize: 10,
          fontWeight: "600",
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
      {user.role === "MINEUR" && (
        <Tab.Screen
          name="Mineur"
          component={MinerScreen}
          initialParams={{ user }}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Shield color={color} size={size} />
            ),
          }}
        />
      )}
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
        name="Finance"
        component={FinanceScreen}
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Database color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Agri"
        component={AgriScreen}
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ color, size }) => <Leaf color={color} size={size} />,
        }}
      />

      <Tab.Screen
        name="Diplôme"
        component={DiplomaScreen}
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ color, size }) => <Award color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Algo"
        component={AlgoScreen}
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ color, size }) => <Brain color={color} size={size} />,
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
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
