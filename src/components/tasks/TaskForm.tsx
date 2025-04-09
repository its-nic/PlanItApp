// components/tasks/TaskForm.tsx
import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export interface TaskFormValues {
  title: string;
  description?: string;
  dueDate?: Date;
  completed?: boolean;
}

interface TaskFormProps {
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(initialValues?.dueDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isValid = (): boolean => {
    return !!title.trim();
  };

  const handleSubmit = () => {
    if (!isValid()) {
      alert("Please enter a valid title.");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      completed: initialValues?.completed || false,
    });
  };

  return (
    <View style={styles.container}>
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

      <Button
        title={dueDate ? `Due: ${dueDate.toLocaleDateString()}` : "Select Due Date"}
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={dueDate || new Date()}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setDueDate(date);
          }}
        />
      )}

      <View style={styles.buttonRow}>
        <Button title="Cancel" onPress={onCancel} />
        <Button title="Submit" onPress={handleSubmit} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});

export default TaskForm;
