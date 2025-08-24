// components/assignments/NewAssignmentModal.tsx
import React, { useState } from "react";
import { Modal, View, StyleSheet, TextInput, Button } from "react-native";

interface NewAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

const NewAssignmentModal: React.FC<NewAssignmentModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title); // Submit the title to create a new assignment
      setTitle(""); // Clear input
      onClose(); // Close modal after submission
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TextInput
          style={styles.input}
          placeholder="Assignment Title"
          value={title}
          onChangeText={setTitle}
        />
        <Button title="Create Assignment" onPress={handleSubmit} />
        <Button title="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: "white",
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default NewAssignmentModal;
