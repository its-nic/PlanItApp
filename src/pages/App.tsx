import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { getTasks, getSelectedSemester, getSemesters, initializeDB } from '../database/db';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, View, Text, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import CalendarView from './CalendarView';
import TasksView from './TasksView';
import SettingsView from './SettingsView';
import { useEffect, useState } from 'react';
import { Semester } from '../types/Semester';
import NewSemesterModal from '../components/settings/NewSemesterModal';
import {Task} from '../types/Task';


// Reset database (for testing) - will crash if db does not exist.
//SQLite.deleteDatabaseSync('planit.db')

// Reset async storage (for testing). Use this to get back to welcome screen.
//AsyncStorage.clear();

const db = SQLite.openDatabaseSync('planit.db'); // Open DB
const Tab = createBottomTabNavigator(); // Create bottom nav bar

export default function App() {
  // For DB debug (haven't used / figured this out yet)
  useDrizzleStudio(db);

  const [loading, setLoading] = useState(true); // Loading state for app start
  const [semesters, setSemesters] = useState<Semester[]>([]); // List of all semesters
  const [selectedSemester, setSelectedSemester] = useState<Semester>({id:0, title:"", start_date:new Date(), end_date:new Date()}) // Selected semester for tasks
  const [newSemesterModalVisible, setNewSemesterModalVisible] = useState(false); // For welcome screen when no semesters exist
  const [tasks, setTasks] = useState<Task[]>([]); // List of all tasks

  // For app startup DB initialization
  useEffect( () => {
    const initializeApp = async () => {
      await initializeDB(db); // Initialize DB tables
      await getSelectedSemester(setSelectedSemester); // Get selected semester from DB
      setLoading(false);
    }
    initializeApp(); // Run the initialization function
  }, []);

  useEffect( () => {
    getSemesters(db, setSemesters); // Get all semesters from DB
    getTasks(db, selectedSemester, setTasks); // Get tasks from DB
  }, [selectedSemester])

  if (loading) {
    return (
      <SafeAreaView style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    )
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>PlanIt! Study Planner</Text>
      </View>

      {selectedSemester.id === 0 ? (
        // Show welcome screen if no semesters exist
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.welcomeSubtext}>Create A New Semester to Start:</Text>
          <TouchableOpacity 
            style={styles.newSemesterButton}
            onPress={() => setNewSemesterModalVisible(true)}
          >
            <Text style={styles.buttonText}>Create New Semester</Text>
          </TouchableOpacity>
          
          <NewSemesterModal
            visible={newSemesterModalVisible}
            onClose={() => setNewSemesterModalVisible(false)}
            db = {db}
            semestersStateSetter={setSemesters}
            selectedSemesterStateSetter={setSelectedSemester}
          />
        </View>

      ) : (
        // Show app if semesters exist
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
              children={() => <TasksView
                db={db}
                selectedSemester={selectedSemester}
                tasks={tasks}
                tasksStateSetter={setTasks}
                />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="list" size={size} color={color} />
                ),
              }} 
            />
            <Tab.Screen 
              name="Calendar" 
              children={() => <CalendarView
                db={db}
                selectedSemester={selectedSemester}
                tasks={tasks}
                tasksStateSetter={setTasks}
              />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="calendar" size={size} color={color} />
                ),
              }} 
            />
            <Tab.Screen 
              name="Settings" 
              children={() => <SettingsView
                db={db}
                semesters={semesters}
                semestersStateSetter={setSemesters}
                selectedSemester={selectedSemester}
                selectedSemesterStateSetter={setSelectedSemester}
                tasks={tasks}
              />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="settings" size={size} color={color} />
                ),
              }} 
            />
          </Tab.Navigator>
        </NavigationContainer>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    marginTop: Platform.OS == "android" ? StatusBar.currentHeight : 0, // Adjust for Android status bar height
  },
  spinnerContainer: {
    backgroundColor: 'white',
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
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
  navigationContainer: {
    marginTop: 20,
  },
  tabBar: {
    height: 50,
    borderTopWidth: 1,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
  welcomeSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  newSemesterButton: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
