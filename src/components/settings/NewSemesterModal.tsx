import * as SQLite from "expo-sqlite";
import { addSemester, getSelectedSemester, getSemesters } from "../../database/db";
import React, { useState } from "react";
import { Modal, View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Semester } from "../../types/Semester";

interface NewSemesterModalProps {
  visible: boolean;
  onClose: () => void;
  db: SQLite.SQLiteDatabase;
  semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>;
  selectedSemesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>;
}

const NewSemesterModal: React.FC<NewSemesterModalProps> = ({
  visible,
  onClose,
  db,
  semestersStateSetter,
  selectedSemesterStateSetter,
}) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 4); // Default to 4 months from now
    return date;
  });
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
    await addSemester(db, title.trim(), startDate, endDate);
    await getSelectedSemester(selectedSemesterStateSetter);
    await getSemesters(db, semestersStateSetter);
    onClose();
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
            placeholderTextColor={"#B3B3B3"}
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowStartDatePicker(true)}
            >
            <Text style={styles.buttonText}>
              Start Date: {startDate.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowEndDatePicker(true)}
            >
            <Text style={styles.buttonText}>
              End Date: {endDate.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => onClose()}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={showStartDatePicker}
            mode="date"
            onConfirm={handleStartDateConfirm}
            onCancel={() => setShowStartDatePicker(false)}
            maximumDate={endDate}
            locale="en"
            themeVariant="light"
          />
          <DateTimePickerModal
            isVisible={showEndDatePicker}
            mode="date"
            onConfirm={handleEndDateConfirm}
            onCancel={() => setShowEndDatePicker(false)}
            minimumDate={startDate}
            locale="en"
            themeVariant="light"
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  datePickerButton: {
    backgroundColor: "#1A65EB",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: "#28A745",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    width: "45%",
  },
  cancelButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    width: "45%",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
});

export default NewSemesterModal;
