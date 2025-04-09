import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Task } from "../../types/Task";
import TaskForm, { TaskFormValues } from "./TaskForm";
import DateTimePicker from '@react-native-community/datetimepicker';  // Import the DateTimePicker

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  task: Task;
  updateExistingTask: (
    id: number,
    values: TaskFormValues & { startTime?: Date | null; endTime?: Date | null },
    completed: boolean
  ) => Promise<void>;
  removeTask: (id: number) => Promise<void>;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  visible,
  onClose,
  task,
  updateExistingTask,
  removeTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(task.start || null);
  const [endTime, setEndTime] = useState<Date | null>(task.end || null);
  const [isScheduling, setIsScheduling] = useState(false); // Whether the user is in scheduling mode
  const [showStartPicker, setShowStartPicker] = useState(false); // State for showing the start time picker
  const [showEndPicker, setShowEndPicker] = useState(false); // State for showing the end time picker

  const initialValues: TaskFormValues = {
    title: task.title,
    description: task.description,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    completed: task.completed,
  };

  const handleSubmit = async (values: TaskFormValues) => {
    await updateExistingTask(task.id, { ...values, startTime, endTime }, values.completed || false);
    onClose();
  };

  const handleUnschedule = () => {
    Alert.alert("Unschedule Task", "This will remove the start and end time for this task.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unschedule",
        style: "destructive",
        onPress: async () => {
          await updateExistingTask(
            task.id,
            { ...initialValues, startTime: null, endTime: null },
            task.completed
          );
          onClose();
        },
      },
    ]);
  };

  const handleSchedule = () => {
    setIsScheduling(true); // Enable scheduling mode
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined, type: "start" | "end") => {
    const currentDate = selectedDate || new Date();
    if (type === "start") {
      setStartTime(currentDate);
      setShowStartPicker(false); // Hide start picker after selecting a date
    } else {
      setEndTime(currentDate);
      setShowEndPicker(false); // Hide end picker after selecting a date
    }
  };

  const handleCloseDatePicker = () => {
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  const handleStartButtonPress = () => {
    setShowStartPicker(true);  // Show start date picker
    setShowEndPicker(false);   // Hide end date picker
  };

  const handleEndButtonPress = () => {
    setShowEndPicker(true);    // Show end date picker
    setShowStartPicker(false); // Hide start date picker
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
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
                {/* Delete Button */}
                <View style={styles.titleContainer}>
                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                  >
                    <Ionicons name="close" size={20} color={"white"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert("Confirm Delete", "Delete this task?", [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            await removeTask(task.id);
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
                    <Text style={styles.overviewTitle}>{task.title}</Text>
                    <Text style={styles.overviewText}>
                      {task.description || "No notes provided."}
                    </Text>
                    {task.due_date && (
                      <Text style={styles.overviewText}>
                        📅 Due:{" "}
                        {new Date(task.due_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    )}
                    {task.start && (
                      <>
                        <Text style={styles.overviewText}>
                          ⏰ Start: {new Date(task.start).toLocaleTimeString()}
                        </Text>
                        {task.end && (
                          <Text style={styles.overviewText}>
                            ⏳ Duration:{" "}
                            {Math.round(
                              (new Date(task.end).getTime() - new Date(task.start).getTime()) / 60000
                            )}{" "}
                            mins
                          </Text>
                        )}
                      </>
                    )}
                    <Text style={styles.overviewText}>
                      ✅ Completed: {task.completed ? "Yes" : "No"}
                    </Text>

                    <TouchableOpacity
                      style={styles.editToggleButton}
                      onPress={() => setIsEditing(true)}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TaskForm
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsEditing(false)}
                  />
                )}

                {/* Schedule Button */}
                {!isScheduling && (
                  <TouchableOpacity style={styles.unscheduleButton} onPress={handleSchedule}>
                    <Text style={styles.buttonText}>Schedule</Text>
                  </TouchableOpacity>
                )}

                {/* Unschedule Button */}
                {task.start && (
                  <TouchableOpacity style={styles.unscheduleButton} onPress={handleUnschedule}>
                    <Text style={styles.buttonText}>Unschedule</Text>
                  </TouchableOpacity>
                )}

                {/* Date Picker for Start and End Times */}
                {isScheduling && (
                  <View style={styles.datePickerContainer}>
                    <Text style={styles.datePickerLabel}>Select Start and End Time:</Text>
                    <View style={styles.datePickerRow}>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={handleStartButtonPress} // Show start date picker
                      >
                        <Text>Start Time: {startTime ? startTime.toLocaleString() : "Not set"}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.datePickerRow}>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={handleEndButtonPress} // Show end date picker
                      >
                        <Text>End Time: {endTime ? endTime.toLocaleString() : "Not set"}</Text>
                      </TouchableOpacity>
                    </View>

                    {showStartPicker && (
                      <DateTimePicker
                        value={startTime || new Date()}
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) =>
                          handleDateChange(event, selectedDate, "start")
                        }
                      />
                    )}
                    {showEndPicker && (
                      <DateTimePicker
                        value={endTime || new Date()}
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) =>
                          handleDateChange(event, selectedDate, "end")
                        }
                      />
                    )}
                  </View>
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
    justifyContent: "center",
    overflow: "hidden",
    elevation: 10,
  },
  titleContainer: {
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
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
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
  deleteButton: {
    position: "absolute",
    backgroundColor: "#DC3545",
    left: 0,
    top: 0,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  closeButton: {
    position: "absolute",
    backgroundColor: "#6C757D",
    right: 0,
    top: 0,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  datePickerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  datePickerRow: {
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  datePickerButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
});

export default EditTaskModal;
