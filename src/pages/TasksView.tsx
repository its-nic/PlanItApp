import * as SQLite from "expo-sqlite";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Button,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Semester } from "../types/Semester";
import { Task } from "../types/Task";
import { addTask, getTasks } from "../database/db";
import EditTaskModal from "../components/tasks/EditTaskModal"; // Adjust if your path differs

interface TaskViewProps {
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
  tasks: Task[];
  tasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
}

const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

const TasksView: React.FC<TaskViewProps> = ({
  db,
  selectedSemester,
  tasks,
  tasksStateSetter,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "The task title is required.");
      return;
    }

    const start = new Date();
    const end = new Date();
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    start.setHours(startH, startM, 0);
    end.setHours(endH, endM, 0);

    if (end <= start) {
      Alert.alert("Validation Error", "End time must be after the start time.");
      return;
    }

    try {
      await addTask(db, selectedSemester, title, description, dueDate, start, end);
      await getTasks(db, selectedSemester, tasksStateSetter);
      setTitle("");
      setDescription("");
      setDueDate(null);
      setStartTime("08:00");
      setEndTime("09:00");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "An error occurred while creating the task.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newTaskButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.buttonText}>＋ Create Task</Text>
      </TouchableOpacity>

      <ScrollView keyboardShouldPersistTaps="handled">
        {tasks.map((task: Task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskItem}
            onPress={() => {
              setSelectedTask(task);
              setEditModalVisible(true);
            }}
          >
            <Text>ID: {task.id}</Text>
            <Text>SemesterID: {task.semester_id}</Text>
            <Text>Title: {task.title}</Text>
            {task.description && <Text>Description: {task.description}</Text>}
            {task.due_date && (
              <Text>
                Due: {new Date(task.due_date).toLocaleDateString("en-US")}
              </Text>
            )}
            <Text>Complete: {task.completed ? "Yes" : "No"}</Text>
            <Text>Start: {new Date(task.start).toLocaleTimeString()}</Text>
            <Text>End: {new Date(task.end).toLocaleTimeString()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>New Task</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: "#333" }}>
              {dueDate
                ? `Due: ${dueDate.toLocaleDateString("en-US")}`
                : "Select Due Date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={dueDate || new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) setDueDate(selectedDate);
              }}
            />
          )}
          <Text>Start Time</Text>
          <Picker
            selectedValue={startTime}
            onValueChange={setStartTime}
          >
            {timeOptions.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
          <Text>End Time</Text>
          <Picker
            selectedValue={endTime}
            onValueChange={setEndTime}
          >
            {timeOptions.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
          <View style={styles.buttonRow}>
            <Button title="Cancel" color="gray" onPress={() => setShowModal(false)} />
            <Button title="Create" onPress={handleCreateTask} />
          </View>
        </View>
      </Modal>

      {selectedTask && (
        <EditTaskModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          db={db}
          selectedSemester={selectedSemester}
          task={selectedTask}
          tasksStateSetter={tasksStateSetter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  taskItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  newTaskButton: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
});

export default TasksView;
