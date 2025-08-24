// components/tasks/TaskItem.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Task } from "../../types/Task";

interface TaskItemProps {
  task: Task;
  onPress: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  return (
    <TouchableOpacity style={styles.taskItem} onPress={() => onPress(task)}>
      <Text style={styles.title}>{task.title}</Text>
      {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
      {task.due_date ? (
        <Text style={styles.dueDate}>
          Due: {(() => {
            try {
              const dueDate = new Date(task.due_date);
              if (!isNaN(dueDate.getTime())) {
                return dueDate.toLocaleDateString("en-US");
              }
              return "Invalid date";
            } catch (error) {
              return "Invalid date";
            }
          })()}
        </Text>
      ) : null}
      <Text>Start: {(() => {
        try {
          const startDate = new Date(task.start);
          if (!isNaN(startDate.getTime())) {
            return startDate.toLocaleTimeString();
          }
          return "Invalid time";
        } catch (error) {
          return "Invalid time";
        }
      })()}</Text>
      <Text>End: {(() => {
        try {
          const endDate = new Date(task.end);
          if (!isNaN(endDate.getTime())) {
            return endDate.toLocaleTimeString();
          }
          return "Invalid time";
        } catch (error) {
          return "Invalid time";
        }
      })()}</Text>
      <Text>Complete: {task.completed ? "Yes" : "No"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  dueDate: {
    fontSize: 14,
    color: "#333",
  },
});

export default TaskItem;
