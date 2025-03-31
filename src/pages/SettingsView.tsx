import * as SQLite from 'expo-sqlite';
import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import NewSemesterForm from "../components/settings/NewSemesterForm";
import Semester from '../types/Semester';
import ManageSemestersModal from '../components/settings/ManageSemestersModal';

interface SettingsViewProps {
    db: SQLite.SQLiteDatabase;
    semesters: Semester[];
    semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>;
    selectedSemester: Semester;
    selectedSemesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>;
  }

const SettingsView: React.FC<SettingsViewProps> = ({ db, semesters, semestersStateSetter, selectedSemester, selectedSemesterStateSetter }) => {
  const [newSemesterModalVisible, setNewSemesterModalVisible] = useState(false);
  const [manageSemesterModalVisible, setManageSemesterModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text>{`Selected Semester: ${selectedSemester.title}`}</Text>
      <Button title="Create New Semester" onPress={() => setNewSemesterModalVisible(true)} />
      <NewSemesterForm
        visible={newSemesterModalVisible}
        onClose={() => setNewSemesterModalVisible(false)}
        db={db}
        semestersStateSetter={semestersStateSetter}
        selectedSemesterStateSetter={selectedSemesterStateSetter}
      />
      {semesters.map((semester: Semester) => (
        <View key={semester.id} style={{ margin: 10 }}>
          <Text style={{ fontSize: 18 }}>{semester.title}</Text>
          <Text>{`ID: ${semester.id}`}</Text>
          <Text>{`Start Date: ${semester.start_date}`}</Text>
          <Text>{`End Date: ${semester.end_date}`}</Text>
        </View>
        ))}

      <Button title="Manage Semesters" onPress={() => setManageSemesterModalVisible(true)} />
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
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default SettingsView;
