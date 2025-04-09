// components/tasks/NewTaskModal.tsx

import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import TaskForm, { TaskFormValues } from "./TaskForm";

interface NewTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ visible, onClose, onSubmit }) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TaskForm onSubmit={onSubmit} onCancel={onClose} />
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
});

export default NewTaskModal;
