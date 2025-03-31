import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import CalendarView from '../components/CalendarView';
import AddTask from '../components/AddTask';
import SettingsView from '../components/SettingsView';
import { useEffect } from 'react';
import { initializeDB } from '../database/db';

const Tab = createBottomTabNavigator();

export default function App() {

  useEffect(() => {
    const initializeApp = async () => {
      await initializeDB();
    };
    initializeApp();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>PlanIt! Study Planner</Text>
      </View>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Calendar"
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
          }}
        >
          <Tab.Screen 
            name="Tasks" 
            component={AddTask} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list" size={size} color={color} />
              ),
            }} 
          />
          <Tab.Screen 
            name="Calendar" 
            component={CalendarView} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar" size={size} color={color} />
              ),
            }} 
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsView} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" size={size} color={color} />
              ),
            }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS == "android" ? StatusBar.currentHeight : 0, // Adjust for Android status bar height
  },
  header: {
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabBar: {
    position: 'absolute',
    height: 50,
    borderTopWidth: 1,
  },
});
