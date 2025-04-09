import * as SQLite from "expo-sqlite";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { Semester } from "../types/Semester";
import { Task } from "../types/Task";
import EditTaskModal from "../components/tasks/EditTaskModal";
import { getTasks, updateTaskComplete } from "../database/db";



interface TaskViewProps {
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
  tasks: Task[];
  tasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
}

const formatLength = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs ? hrs + 'hr ' : ''}${mins ? mins + 'min' : ''}`;
}

const TasksView: React.FC<TaskViewProps> = ({
  db,
  selectedSemester,
  tasks,
  tasksStateSetter,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task>({id:0, semester_id:selectedSemester.id, title:"", description:"", due_date:null, start:new Date(), end:new Date(), completed:false, color:"#87CEEB"});
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>
      <ScrollView>
        {tasks.map((task: Task) => {
          return (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              {task.description && <Text>Description: {task.description}</Text>}
              {task.due_date && <Text>Due: {task.due_date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</Text>}
              <Text>Complete: {task.completed ? "Yes" : "No"}</Text>
              <Text>Start: {task.start.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})} | {task.start.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</Text>
              <Text>Length: {((task.end.getTime() - task.start.getTime()) / 60000).toString()} Minutes</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setSelectedTask(task);
                    setEditTaskModalVisible(true);
                  }}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={task.completed ? styles.incompleteButton : styles.completeButton}
                  onPress={() => {
                    updateTaskComplete(db, task.id, !task.completed);
                    getTasks(db, selectedSemester, tasksStateSetter);
                    }}
                >
                  <Text style={styles.buttonText}>{task.completed ? "Set Incomplete" : "Set Complete"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <EditTaskModal
          visible={editTaskModalVisible}
          onClose={() => setEditTaskModalVisible(false)}
          db={db}
          selectedSemester={selectedSemester}
          task={selectedTask}
          tasksStateSetter={tasksStateSetter}
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: 'center',
  },
  taskItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#1A65EB",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  completeButton: {
    backgroundColor: "#28A745",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  incompleteButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default TasksView;