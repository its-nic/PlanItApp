import * as SQLite from "expo-sqlite";
import {
  addTask,
  getUnscheduledTasks,
} from "../../database/db";
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Semester from "../../types/Semester";
import Task from "../../types/Task";

interface NewTaskModalProps {
  visible: boolean;
  onClose: () => void;
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
  unscheduledTasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({
  visible,
  onClose,
  db,
  selectedSemester,
  unscheduledTasksStateSetter,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);

  const handleDueDateConfirm = (date: Date) => {
    setDueDate(date);
    setDueTime(null);
    setShowDueDatePicker(false);
  };

  const handleDueTimeConfirm = (date: Date) => {
    setDueTime(date);
    setShowDueTimePicker(false);
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }
    if (dueDate && !dueTime) {
      alert("Please enter a due time.");
      return;
    }
    await addTask(db, selectedSemester, title.trim(), description.trim(), dueTime);
    await getUnscheduledTasks(db, selectedSemester, unscheduledTasksStateSetter);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTitle("");
    setDescription("");
    setDueDate(null);
    setDueTime(null);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.title}>Create a Task</Text>

          <TextInput
            style={styles.input}
            placeholder="Task Title"
            placeholderTextColor={"#B3B3B3"}
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
          />

          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            placeholderTextColor={"#B3B3B3"}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDueDatePicker(true)}
            >
            <Text style={styles.buttonText}>
              {dueDate ? `Due Date: ${dueDate.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}` : "Select Due Date (optional)"}
            </Text>
          </TouchableOpacity>

          {dueDate && (
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDueTimePicker(true)}
            >
              <Text style={styles.buttonText}>
                {dueTime ? `Due Time: ${dueTime.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})}` : "Select Due Time"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleClose()}
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
            isVisible={showDueDatePicker}
            mode="date"
            onConfirm={handleDueDateConfirm}
            onCancel={() => setShowDueDatePicker(false)}
            minimumDate={selectedSemester.start_date}
            maximumDate={selectedSemester.end_date}
            locale="en"
            themeVariant="light"
          />

          {dueDate &&
          <DateTimePickerModal
            isVisible={showDueTimePicker}
            mode="time"
            onConfirm={handleDueTimeConfirm}
            onCancel={() => setShowDueTimePicker(false)}
            date={new Date(dueDate.setHours(0, 0, 0, 0))}
            minimumDate={new Date(dueDate.setHours(0, 0, 0, 0))}
            maximumDate={new Date(dueDate.setHours(23, 59, 59, 999))}
            locale="en"
            themeVariant="light"
          />}
          

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

export default NewTaskModal;
