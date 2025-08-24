import * as SQLite from "expo-sqlite";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Semester } from "../types/Semester";
import { Assignment } from "../types/Assignment";
import NewAssignmentModal from "../components/assignments/NewAssignmentModal"; // Import the new modal
import EditTaskModal from "../components/tasks/EditTaskModal"; // Modal for task editing
import EditAssignmentModal from "../components/assignments/EditAssignmentModal"; // Modal for editing assignments
import useAssignments, { TaskFormValues } from "../hooks/useAssignments"; // Import the useAssignments hook
import { Task } from "../types/Task";

interface AssignmentViewProps {
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
}

const AssignmentsView: React.FC<AssignmentViewProps> = ({
  db,
  selectedSemester,
}) => {
  const {
    assignments,
    createAssignment,
    createTaskForAssignment,
    updateExistingTask,
    removeTask,
    removeAssignment, // Get removeAssignment function from useAssignments
  } = useAssignments(db, selectedSemester);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false); // State for editing assignments
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false); // Modal for task editing
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
    null
  );

  // Function to handle deleting an assignment
  const deleteAssignment = (id: number) => {
    removeAssignment(id); // Use removeAssignment from the hook to delete the assignment
    setShowEditAssignmentModal(false); // Close the modal after deletion
  };

  // Function to handle editing an assignment when clicked
  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment); // Set the selected assignment for editing
    setShowEditAssignmentModal(true); // Show the edit assignment modal
  };

  // Function to handle editing a task when clicked
  const handleEditTask = (task: Task) => {
    setSelectedTask(task); // Set the selected task for editing
    setEditModalVisible(true); // Show the edit task modal
  };

  return (
    <View style={styles.container}>
      {/* Button to create new assignment */}
      <TouchableOpacity
        style={styles.newAssignmentButton}
        onPress={() => setShowAssignmentModal(true)}
      >
        <Text style={styles.buttonText}>＋ Create Assignment</Text>
      </TouchableOpacity>

      {/* Assignments List */}
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: assignment }) => (
          <TouchableOpacity
            style={styles.assignmentItem}
            onPress={() => handleEditAssignment(assignment)} // Open the edit assignment modal when clicked
          >
            <Text style={styles.assignmentTitle}>{assignment.title}</Text>

            {/* List tasks under each assignment */}
            {assignment.tasks.map((task) => (
              <TouchableOpacity
                key={`${assignment.id}-${task.id}`} // Composite key for uniqueness
                style={styles.taskItem}
                onPress={() => handleEditTask(task)} // Open the edit task modal on task click
              >
                <Text>{task.title}</Text>
                {task.due_date && (
                  <Text>
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
                )}
              </TouchableOpacity>
            ))}

            {/* Button to add a task to this assignment */}
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() =>
                createTaskForAssignment(assignment.id, {
                  title: "New Task",
                  description: "",
                  dueDate: null,
                } as TaskFormValues)
              }
            >
              <Text style={styles.buttonText}>＋ Add Task</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* NEW ASSIGNMENT MODAL */}
      <NewAssignmentModal
        visible={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onSubmit={async (title) => {
          try {
            await createAssignment(title);
            setShowAssignmentModal(false);
          } catch (error) {
            console.error("Error creating assignment:", error);
            Alert.alert("Error", "An error occurred while creating the assignment.");
          }
        }}
      />

      {/* EDIT ASSIGNMENT MODAL */}
      {selectedAssignment && (
        <EditAssignmentModal
          visible={showEditAssignmentModal}
          onClose={() => setShowEditAssignmentModal(false)}
          assignment={selectedAssignment}
          onSubmit={async (updatedTitle) => {
            // Update assignment logic here
            console.log("Updated Title: ", updatedTitle);
            setShowEditAssignmentModal(false);
          }}
          onDelete={deleteAssignment} // Pass delete function to modal
        />
      )}

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
  newAssignmentButton: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderRadius: 6,
    alignItems: "center",
  },
  addTaskButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  assignmentItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  taskItem: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
});

export default AssignmentsView;
