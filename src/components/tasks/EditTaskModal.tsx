import * as SQLite from "expo-sqlite";
import { deleteTask, getTasks, updateTask, } from "../../database/db";
import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Semester } from "../../types/Semester";
import { Task } from "../../types/Task";

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
  task: Task,
  tasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  visible,
  onClose,
  db,
  selectedSemester,
  task,
  tasksStateSetter,
}) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [start, setStart] = useState<Date>(new Date());
  const [completed, setCompleted] = useState<boolean>(false);
  const [minutes, setMinutes] = useState<string>("");
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);

  useEffect( () => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.due_date);
    setDueTime(task.due_date);
    setStart(task.start);
    setCompleted(task.completed);
    setMinutes(((task.end.getTime() - task.start.getTime()) / 60000).toString());
  }, [task]);

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
    if (!minutes) {
      alert("Please enter task minutes.");
      return;
    }
    if (dueDate && !dueTime) {
      alert("Please enter a due time.");
      return;
    }
    await updateTask(db, task.id, title.trim(), description.trim(), dueTime, start, new Date(start.getTime() + Number(minutes) * 60000), completed);
    await getTasks(db, selectedSemester, tasksStateSetter);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Edit Task</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  "Confirm Delete",
                  "Are you sure you want to delete this task?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        deleteTask(db, task.id);
                        getTasks(db, selectedSemester, tasksStateSetter);
                        onClose();
                      },
                    },
                  ]
                );
              }}
              >
              <Ionicons name="trash" size={15} color={'white'} />
            </TouchableOpacity>
          </View>

          <View>
            <Text>Task Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Study for Algebra Test"
              placeholderTextColor={"#B3B3B3"}
              value={title}
              onChangeText={setTitle}
              returnKeyType="done"
            />
          </View>

          <View>
            <Text>Notes (optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Chapters 3 & 4 from textbook."
              placeholderTextColor={"#B3B3B3"}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />  
          </View>

          <View>
            <Text>Minutes to Complete:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 150"
              placeholderTextColor={"#B3B3B3"}
              keyboardType="numeric"
              maxLength={3}
              value={minutes}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '').replace(/^0+/, '');
                setMinutes(filtered);
              }}
              returnKeyType="done"
            />
          </View>

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
              onPress={() => onClose()}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Update</Text>
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
  titleContainer: {
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
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
  updateButton: {
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
  deleteButton: {
    position: "absolute",
    backgroundColor: "#DC3545",
    right: 0,
    top: 0,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 50,
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

export default EditTaskModal;
