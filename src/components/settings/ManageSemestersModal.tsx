import * as SQLite from "expo-sqlite";
import {
  deleteSemester,
  getSemesters,
  saveSelectedSemester,
} from "../../database/db";
import Semester from "../../types/Semester";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
} from "react-native";
import { useState } from "react";
import NewSemesterForm from "./NewSemesterForm";

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

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {semesters.map((semester) => (
              <View key={semester.id} style={styles.semesterItem}>
                <Text style={styles.semesterText}>{semester.title}</Text>
                <Text style={styles.semesterDate}>{`Start: ${semester.start_date}`}</Text>
                <Text style={styles.semesterDate}>{`End: ${semester.end_date}`}</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => {
                      selectedSemesterStateSetter(semester);
                      saveSelectedSemester(semester);
                      onClose();
                    }}
                  >
                    <Text style={styles.buttonText}>Select</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      deleteSemester(db, semester.id);
                      getSemesters(db, semestersStateSetter);
                    }}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.bottomButtons}>
            <Button title="Create New Semester" color="#32CD32" onPress={() => setNewSemesterModalVisible(true)} />
            <View style={styles.spacer} />
            <Button title="Close" color="#FF6347" onPress={onClose} />
          </View>
        </View>

        <NewSemesterForm
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
    paddingTop: 60,
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
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
    backgroundColor: "#1E90FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  bottomButtons: {
    marginTop: 10,
    paddingBottom: 20,
  },
  spacer: {
    height: 10,
  },
});

export default ManageSemestersModal;
