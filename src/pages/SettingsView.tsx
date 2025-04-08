import * as SQLite from 'expo-sqlite';
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Semester } from '../types/Semester';
import { Task } from '../types/Task';
import ManageSemestersModal from '../components/settings/ManageSemestersModal';

interface SettingsViewProps {
    db: SQLite.SQLiteDatabase;
    semesters: Semester[];
    semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>;
    selectedSemester: Semester;
    selectedSemesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>;
    tasks: Task[];
  }

const SettingsView: React.FC<SettingsViewProps> = ({
  db,
  semesters,
  semestersStateSetter,
  selectedSemester,
  selectedSemesterStateSetter,
  tasks,
}) => {
  const [manageSemesterModalVisible, setManageSemesterModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingsItem}>
        <View style={styles.selectedSemesterContainer}>
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
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SettingsView;
