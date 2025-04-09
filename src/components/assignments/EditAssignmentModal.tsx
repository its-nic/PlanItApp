import React, { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from "react-native";

interface EditAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (updatedTitle: string) => void;
  onDelete: (id: number) => void; // New prop for delete function
  assignment: { id: number; title: string };
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onDelete, // Receive delete function
  assignment,
}) => {
  const [updatedTitle, setUpdatedTitle] = useState(assignment.title);

  // Handle delete button click with confirmation
  const handleDelete = () => {
    // Show a confirmation alert before deleting
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this assignment?",
      [
        {
          text: "Cancel", // If user clicks Cancel
          style: "cancel",
        },
        {
          text: "Delete", // If user confirms deletion
          style: "destructive",
          onPress: () => {
            onDelete(assignment.id); // Call delete function with the assignment ID
          },
        },
      ],
      { cancelable: false } // Prevent dismissal by tapping outside
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Assignment</Text>
          <TextInput
            style={styles.input}
            value={updatedTitle}
            onChangeText={setUpdatedTitle}
            placeholder="Assignment Title"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => onSubmit(updatedTitle)}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete} // Call handleDelete with confirmation
          >
            <Text style={styles.buttonText}>Delete Assignment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "#FF3B30", // Red color for delete button
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default EditAssignmentModal;
