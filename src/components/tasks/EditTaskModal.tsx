// components/tasks/EditTaskModal.tsx
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

  const initialValues: TaskFormValues = {
    title: task.title,
    description: task.description,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    completed: task.completed,
  };

  const handleSubmit = async (values: TaskFormValues) => {
    await updateExistingTask(task.id, { ...values }, values.completed || false);
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

                {/* Unschedule Button */}
                {task.start && (
                  <TouchableOpacity style={styles.unscheduleButton} onPress={handleUnschedule}>
                    <Text style={styles.buttonText}>Unschedule</Text>
                  </TouchableOpacity>
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
    right: 0,
    top: 0,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
});

export default EditTaskModal;
