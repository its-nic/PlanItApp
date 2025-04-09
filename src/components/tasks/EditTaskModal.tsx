import * as SQLite from "expo-sqlite";
import { deleteTask, getTasks, updateTask } from "../../database/db";
import React, { useEffect, useState } from "react";
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
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Semester } from "../../types/Semester";
import { Task } from "../../types/Task";

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
  task: Task;
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [completed, setCompleted] = useState(false);
  const [minutes, setMinutes] = useState("");
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.due_date);
    setDueTime(task.due_date);
    setStart(task.start);
    setCompleted(task.completed);
    if (task.start && task.end) {
      const duration = (task.end.getTime() - task.start.getTime()) / 60000;
      setMinutes(duration.toString());
    } else {
      setMinutes("");
    }
    setIsEditing(false); // reset to view mode on open
  }, [task]);

  const handleDueDateConfirm = (date: Date) => {
    setDueDate(date);
    setShowDueDatePicker(false);
  };

  const handleDueTimeConfirm = (date: Date) => {
    setDueTime(date);
    setShowDueTimePicker(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }
    if (!minutes && start) {
      alert("Please enter task minutes.");
      return;
    }
    if (dueDate && !dueTime) {
      alert("Please enter a due time.");
      return;
    }

    const calculatedEnd =
      start && minutes ? new Date(start.getTime() + Number(minutes) * 60000) : null;

    await updateTask(
      db,
      task.id,
      title.trim(),
      description.trim(),
      dueTime,
      start,
      calculatedEnd,
      completed
    );

    await getTasks(db, selectedSemester, tasksStateSetter);
    onClose();
  };

  const handleUnschedule = async () => {
    Alert.alert("Unschedule Task", "This will remove the start and end time for this task.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unschedule",
        style: "destructive",
        onPress: async () => {
          await updateTask(db, task.id, title.trim(), description.trim(), dueTime, null, null, completed);
          await getTasks(db, selectedSemester, tasksStateSetter);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          onClose(); // Close when tapping outside modal
        }}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalContainerWrapper}
            >
              <ScrollView
                contentContainerStyle={styles.modalContainer}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.titleContainer}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert("Confirm Delete", "Delete this task?", [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            await deleteTask(db, task.id);
                            await getTasks(db, selectedSemester, tasksStateSetter);
                            onClose();
                          },
                        },
                      ]);
                    }}
                  >
                    <Ionicons name="trash" size={15} color={"white"} />
                  </TouchableOpacity>
                </View>

                {/* VIEW MODE */}
                {!isEditing ? (
                  <>
                    <Text style={styles.overviewTitle}>{title}</Text>
                    <Text style={styles.overviewText}>
                      {description || "No notes provided."}
                    </Text>
                    {dueDate && (
                      <Text style={styles.overviewText}>
                        📅 Due:{" "}
                        {dueDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    )}
                    {start && (
                      <>
                        <Text style={styles.overviewText}>
                          ⏰ Start: {start.toLocaleTimeString()}
                        </Text>
                        <Text style={styles.overviewText}>
                          ⏳ Duration: {minutes} mins
                        </Text>
                      </>
                    )}
                    <Text style={styles.overviewText}>
                      ✅ Completed: {completed ? "Yes" : "No"}
                    </Text>

                    <TouchableOpacity
                      style={styles.editToggleButton}
                      onPress={() => setIsEditing(true)}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* EDIT MODE */}
                    <Text>Task Name:</Text>
                    <TextInput
                      style={styles.input}
                      value={title}
                      onChangeText={setTitle}
                    />
                    <Text>Notes:</Text>
                    <TextInput
                      style={styles.input}
                      multiline
                      numberOfLines={4}
                      value={description}
                      onChangeText={setDescription}
                    />
                    {start && (
                      <>
                        <Text>Minutes to Complete:</Text>
                        <TextInput
                          style={styles.input}
                          value={minutes}
                          keyboardType="numeric"
                          onChangeText={(text) =>
                            setMinutes(text.replace(/[^0-9]/g, "").replace(/^0+/, ""))
                          }
                        />
                      </>
                    )}
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDueDatePicker(true)}
                    >
                      <Text style={styles.buttonText}>
                        {dueDate
                          ? `Due Date: ${dueDate.toLocaleDateString("en-US")}`
                          : "Select Due Date"}
                      </Text>
                    </TouchableOpacity>

                    {dueDate && (
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowDueTimePicker(true)}
                      >
                        <Text style={styles.buttonText}>
                          {dueTime
                            ? `Due Time: ${dueTime.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}`
                            : "Select Due Time"}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setIsEditing(false);
                        }}
                      >
                        <Text style={styles.buttonText}>Cancel Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.updateButton} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {start && (
                  <TouchableOpacity style={styles.unscheduleButton} onPress={handleUnschedule}>
                    <Text style={styles.buttonText}>Unschedule</Text>
                  </TouchableOpacity>
                )}

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

                {dueDate && (
                  <DateTimePickerModal
                    isVisible={showDueTimePicker}
                    mode="time"
                    onConfirm={handleDueTimeConfirm}
                    onCancel={() => setShowDueTimePicker(false)}
                    date={dueDate}
                    locale="en"
                    themeVariant="light"
                  />
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 10,
  },
  modalContainerWrapper: {
    borderRadius: 12,
    maxHeight: "90%",
    width: "90%",
    alignSelf: "center",
    justifyContent: "center", // <--- THIS CENTERS VERTICALLY
    overflow: "hidden",
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
    color: "#333",
    textAlign: "center",
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
    textAlign: "center",
  },
  overviewText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#444",
  },
  editToggleButton: {
    backgroundColor: "#1A65EB",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  datePickerButton: {
    backgroundColor: "#1A65EB",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
  unscheduleButton: {
    backgroundColor: "#6C757D",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    width: "100%",
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
});

export default EditTaskModal;
