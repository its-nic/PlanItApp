import * as SQLite from "expo-sqlite";
import {
  deleteSemester,
  getSemesters,
  saveSelectedSemester,
} from "../../database/db";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import NewSemesterModal from "./NewSemesterModal";
import Semester from "../../types/Semester";

interface ManageSemestersModalProps {
  visible: boolean;
  onClose: () => void;
  db: SQLite.SQLiteDatabase;
  semesters: Semester[];
  semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>;
  selectedSemester: Semester;
  selectedSemesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>;
}

const ManageSemestersModal: React.FC<ManageSemestersModalProps> = ({
  visible,
  onClose,
  db,
  semesters,
  semestersStateSetter,
  selectedSemester,
  selectedSemesterStateSetter,
}) => {
  const [newSemesterModalVisible, setNewSemesterModalVisible] = useState(false);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Manage Semesters</Text>
          <Text style={styles.modalSubtitle}>Active Semester: {selectedSemester.title}</Text>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {semesters.map((semester: Semester) => {
              const isSelected = selectedSemester.id === semester.id;

              return (
                <View key={semester.id} style={styles.semesterItem}>
                  <Text style={styles.semesterText}>{semester.title}</Text>
                  <Text style={styles.semesterDate}>{`Start: ${semester.start_date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}`}</Text>
                  <Text style={styles.semesterDate}>{`End: ${semester.end_date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}`}</Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        isSelected && styles.disabledButton,
                      ]}
                      disabled={isSelected}
                      onPress={() => {
                        selectedSemesterStateSetter(semester);
                        saveSelectedSemester(semester);
                      }}
                    >
                      <Text style={styles.buttonText}>
                        {isSelected ? "Active" : "Set Active"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                      isSelected && styles.disabledButton,
                      ]}
                      disabled={isSelected}
                      onPress={() => {
                        Alert.alert(
                          "Confirm Delete",
                          "Are you sure you want to delete this semester? This will also delete all tasks associated with it.",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => {
                                deleteSemester(db, semester.id);
                                getSemesters(db, semestersStateSetter);
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })}
          </ScrollView>

          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.newSemesterButton}
              onPress={() => setNewSemesterModalVisible(true)}
            >
              <Text style={styles.buttonText}>Create New Semester</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        <NewSemesterModal
          visible={newSemesterModalVisible}
          onClose={() => setNewSemesterModalVisible(false)}
          db={db}
          semestersStateSetter={semestersStateSetter}
          selectedSemesterStateSetter={selectedSemesterStateSetter}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingTop: 30,
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  semesterItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  semesterText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  semesterDate: {
    fontSize: 14,
    color: "#444",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  selectButton: {
    backgroundColor: "#1A65EB",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  newSemesterButton: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomButtons: {
    marginTop: 20,
    paddingBottom: 20,
  },
});

export default ManageSemestersModal;
