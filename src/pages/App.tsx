import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import * as SQLite from 'expo-sqlite';
import { getSelectedSemester, getSemesters, initializeDB, saveSelectedSemester } from '../database/db';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Button, Platform, View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import CalendarView from './CalendarView';
import TasksView from './TasksView';
import SettingsView from './SettingsView';
import { useEffect, useState } from 'react';
import NewSemesterForm from '../components/settings/NewSemesterModal';
import Semester from '../types/Semester';

// Reset database on app load (for testing) - will crash if db does not exist.
//SQLite.deleteDatabaseSync('planit.db')
console.log("Opening DB...");

const db = SQLite.openDatabaseSync('planit.db'); // Open DB
const Tab = createBottomTabNavigator(); // Create bottom nav bar

export default function App() {
  // For DB debug (haven't used / figured this out yet)
  useDrizzleStudio(db);

  // For app startup DB initialization
  useEffect( () => {
    initializeDB(db);
    getSemesters(db, setSemesters);
    getSelectedSemester(setSelectedSemester);
  }, []);

  const [semesters, setSemesters] = useState<Semester[]>([]); // List of all semesters
  const [selectedSemester, setSelectedSemester] = useState<Semester>({id:0, title:"", start_date:"", end_date:""}) // Selected semester for tasks
  const [newSemesterModalVisible, setNewSemesterModalVisible] = useState(false); // For welcome screen when no semesters exist

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>PlanIt! Study Planner</Text>
      </View>


      {semesters.length === 0 ? (
        // Show welcome screen if no semesters exist
        <View>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Button title="Create New Semester to Start" onPress={() => setNewSemesterModalVisible(true)} />
          <NewSemesterForm
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
  welcomeText: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
});
