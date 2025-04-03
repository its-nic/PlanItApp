import * as SQLite from "expo-sqlite";
import {
  addSemester,
  getSelectedSemester,
  getSemesters,
} from "../../database/db";
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Semester from "../../types/Semester";

interface NewSemesterFormProps {
  visible: boolean;
  onClose: () => void;
  db: SQLite.SQLiteDatabase;
  semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>;
  selectedSemesterStateSetter: React.Dispatch<
    React.SetStateAction<Semester>
  >;
}

const NewSemesterForm: React.FC<NewSemesterFormProps> = ({
  visible,
  onClose,
  db,
  semestersStateSetter,
  selectedSemesterStateSetter,
}) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
    setShowStartDatePicker(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    setEndDate(date);
    setShowEndDatePicker(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a semester title.");
      return;
    }
    const isoStartDate = startDate.toISOString().split("T")[0];
    const isoEndDate = endDate.toISOString().split("T")[0];
    await addSemester(db, title.trim(), isoStartDate, isoEndDate);
    await getSelectedSemester(selectedSemesterStateSetter);
    await getSemesters(db, semestersStateSetter);
    onClose();
    alert("New semester created successfully!");
    setTitle("");
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.title}>Create a New Semester</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Fall 2025"
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
          />

          <View style={styles.datePickerWrapper}>
            <Button
              title={`Start Date: ${startDate.toLocaleDateString()}`}
              onPress={() => setShowStartDatePicker(true)}
              color="#1E90FF"
            />
          </View>

          <View style={styles.datePickerWrapper}>
            <Button
              title={`End Date: ${endDate.toLocaleDateString()}`}
              onPress={() => setShowEndDatePicker(true)}
              color="#1E90FF"
            />
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button title="Cancel" onPress={onClose} color="#FF6347" />
            </View>
            <View style={styles.buttonWrapper}>
              <Button title="Create" onPress={handleSubmit} color="#32CD32" />
            </View>
          </View>

          <DateTimePickerModal
            isVisible={showStartDatePicker}
            mode="date"
            onConfirm={handleStartDateConfirm}
            onCancel={() => setShowStartDatePicker(false)}
            maximumDate={endDate}
          />
          <DateTimePickerModal
            isVisible={showEndDatePicker}
            mode="date"
            onConfirm={handleEndDateConfirm}
            onCancel={() => setShowEndDatePicker(false)}
            minimumDate={startDate}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    alignSelf: "center",
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    marginTop: "30%",
    borderRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  datePickerWrapper: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default NewSemesterForm;
