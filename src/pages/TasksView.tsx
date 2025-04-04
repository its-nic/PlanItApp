import * as SQLite from "expo-sqlite";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useState } from "react";
import Semester from "../types/Semester";
import Task from "../types/Task";
import NewTaskModal from "../components/tasks/NewTaskModal";



interface TaskViewProps {
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
  unscheduledTasks: Task[];
  unscheduledTasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
  scheduledTasks: Task[];
  scheduledTasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
}

const formatLength = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs ? hrs + 'hr ' : ''}${mins ? mins + 'min' : ''}`;
}

const TasksView: React.FC<TaskViewProps> = ({
  db,
  selectedSemester,
  unscheduledTasks,
  unscheduledTasksStateSetter,
  scheduledTasks,
  scheduledTasksStateSetter,
}) => {
  const [newTaskModalVisible, setNewTaskModalVisible] = useState(false);
  return (
    <View style={styles.container}>
      <Text>Task sort buttons up here</Text>
      <ScrollView>
        {unscheduledTasks.map((task: Task) => {
          return (
            <View key={task.id} style={styles.taskItem}>
              <Text>ID: {task.id}</Text>
              <Text>SemeterID: {task.semester_id}</Text>
              <Text>Title: {task.title}</Text>
              {task.description && <Text>Description: {task.description}</Text>}
              {task.due_date && <Text>Due: {task.due_date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</Text>}
              <Text>Length: {formatLength(task.length_minutes)}</Text>
              <Text>Complete: {task.completed ? "Yes" : "No"}</Text>
            </View>
          )
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.newTaskButton}
        onPress={() => setNewTaskModalVisible(true)}
      >
        <Text style={styles.buttonText}>Create New Task</Text>
      </TouchableOpacity>

      <NewTaskModal
        visible={newTaskModalVisible}
        onClose={() => setNewTaskModalVisible(false)}
        db={db}
        selectedSemester={selectedSemester}
        unscheduledTasksStateSetter={unscheduledTasksStateSetter}
      />
    </View>
  );
}

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
  },
  newTaskButton: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
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