import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Semester } from '../types/Semester';
import { Task } from '../types/Task';
import ManageSemestersModal from '../components/settings/ManageSemestersModal';
import { getShowCompletedOnCalendar, resetDB, setShowCompletedOnCalendar } from '../database/db';

interface SettingsViewProps {
    db: SQLite.SQLiteDatabase;
    semesters: Semester[];
    semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>;
    selectedSemester: Semester;
    selectedSemesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>;
    tasks: Task[];
    showCompletedOnCalendar: boolean;
    showCompletedOnCalendarStateSetter: React.Dispatch<React.SetStateAction<boolean>>;
  }

const SettingsView: React.FC<SettingsViewProps> = ({
  db,
  semesters,
  semestersStateSetter,
  selectedSemester,
  selectedSemesterStateSetter,
  tasks,
  showCompletedOnCalendar,
  showCompletedOnCalendarStateSetter,
}) => {
  const [manageSemesterModalVisible, setManageSemesterModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingsItem}>
        <View style={styles.selectedSemesterContainer}>
          <Text style={styles.settingsTitle}>Semester</Text>
          <Text>Active Semester: {selectedSemester.title}</Text>
          <Text>Start Date: {selectedSemester.start_date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</Text>
          <Text>End Date: {selectedSemester.end_date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</Text>
          <Text>Number of Tasks: {tasks.length}</Text>
        </View>
        <TouchableOpacity
          style={styles.manageSemestersButton}
          onPress={() => setManageSemesterModalVisible(true)}
          >
          <Text style={styles.buttonText}>Manage Semesters</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsItem}>
        <Text style={styles.settingsTitle}>Calendar</Text>
        <Text>{showCompletedOnCalendar ? "Completed tasks are currently visible on the calendar." : "Completed tasks are currently hidden on the calendar."}</Text>
        <TouchableOpacity
          style={showCompletedOnCalendar ? styles.redButton : styles.greenButton}
          onPress={() => {
            setShowCompletedOnCalendar(!showCompletedOnCalendar);
            getShowCompletedOnCalendar(showCompletedOnCalendarStateSetter);
          }}
          >
          <Text style={styles.buttonText}>{showCompletedOnCalendar ? "Hide Completed" : "Show Completed"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsItem}>
        <Text style={styles.settingsTitle}>Reset</Text>
        <Text>Use this to reset the app. This will erase all data and cannot be undone!</Text>
        <TouchableOpacity
          style={styles.redButton}
          onPress={() =>  {
            Alert.alert(
              "Confirm Reset",
              "Are you sure you want to reset the app? This will erase all data and cannot be undone!",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    await resetDB;
                    await AsyncStorage.clear();
                    selectedSemesterStateSetter({id:0, title:"", start_date:new Date(), end_date:new Date()});
                    showCompletedOnCalendarStateSetter(true);
                  },
                },
              ]
            );
          }}
          >
          <Text style={styles.buttonText}>Reset App</Text>
        </TouchableOpacity>
      </View>

      <ManageSemestersModal 
        visible={manageSemesterModalVisible}
        onClose={() => setManageSemesterModalVisible(false)}
        db={db}
        semesters={semesters}
        semestersStateSetter={semestersStateSetter}
        selectedSemester={selectedSemester}
        selectedSemesterStateSetter={selectedSemesterStateSetter}      
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: 'center',
  },
  selectedSemesterContainer: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    paddingBottom: 20,
  },
  manageSemestersButton: {
    backgroundColor: "#1A65EB",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 6,
    alignItems: "center",
    },
  greenButton: {
    backgroundColor: "#28A745",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 8,
    marginTop: 20,
  },
  redButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SettingsView;
