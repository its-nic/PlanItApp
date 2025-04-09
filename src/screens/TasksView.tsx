// views/TasksView.tsx
import * as SQLite from "expo-sqlite";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Semester } from "../types/Semester";
import { Task } from "../types/Task";
import NewTaskModal from "../components/tasks/NewTaskModal";
import EditTaskModal from "../components/tasks/EditTaskModal";
import useTasks from "../hooks/useTasks";

interface TaskViewProps {
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
}

const TasksView: React.FC<TaskViewProps> = ({ db, selectedSemester }) => {
  // Use the custom hook to get tasks and CRUD functions.
  const { tasks, createTask, updateExistingTask, removeTask } = useTasks(
    db,
    selectedSemester
  );
  const [showModal, setShowModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

      {/* NEW TASK MODAL */}
      <NewTaskModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={async (values) => {
          try {
            await createTask(values);
            setShowModal(false);
          } catch (error) {
            console.error("Error creating task:", error);
            Alert.alert("Error", "An error occurred while creating the task.");
          }
        }}
      />

      {/* EDIT TASK MODAL */}
      {selectedTask && (
        <EditTaskModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          task={selectedTask}
          updateExistingTask={updateExistingTask}
          removeTask={removeTask}
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
});

export default TasksView;
