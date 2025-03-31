import * as SQLite from "expo-sqlite";
import { addSemester, getSelectedSemester, getSemester, getSemesters, saveSelectedSemester } from "../../database/db";
import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Semester from "../../types/Semester";

 interface NewSemesterFormProps {
   visible: boolean;
   onClose: () => void;
   db: SQLite.SQLiteDatabase;
   semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>;
   selectedSemesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>;
 }

const NewSemesterForm: React.FC<NewSemesterFormProps> = ({ visible, onClose, db, semestersStateSetter, selectedSemesterStateSetter }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date);
  const [endDate, setEndDate] = useState(new Date);
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
    if (!title) {
      alert("Please enter a semester title.");
      return;
    }
    const isoStartDate = startDate.toISOString().split("T")[0];
    const isoEndDate = endDate.toISOString().split("T")[0];
    await addSemester(db, title, isoStartDate, isoEndDate);
    await getSelectedSemester(selectedSemesterStateSetter);
    await getSemesters(db, semestersStateSetter);
    onClose();
    alert("New semester created successfully!");

  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>New Semester</Text>
          <TextInput
            style={styles.input}
            placeholder="Semester Title"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.datePickerWrapper}>
            <Button title={`Start Date: ${startDate.toLocaleDateString()}`} onPress={() => setShowStartDatePicker(true)} />
          </View>
          <View style={styles.datePickerWrapper}>
            <Button title={`End Date: ${endDate.toLocaleDateString()}`} onPress={() => setShowEndDatePicker(true)} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Create" onPress={handleSubmit} />
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  datePickerWrapper: {
    marginBottom: 10,
  },
});

export default NewSemesterForm;
