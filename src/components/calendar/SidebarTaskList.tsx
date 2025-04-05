// components/SidebarTaskList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Task } from "../../types/Task";

interface SidebarTaskListProps {
  tasks: Task[];
  onDragStart: (task: Task) => void;
}

const SidebarTaskList: React.FC<SidebarTaskListProps> = ({ tasks, onDragStart }) => {
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => (
    <View style={[styles.item, isActive && styles.activeItem]}>
      <Text
        onLongPress={() => {
          onDragStart(item); // Pass task info up
          drag(); // Start the drag
        }}
        style={styles.title}
      >
        {item.title}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Unscheduled Tasks</Text>
      <DraggableFlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onDragEnd={() => {}}
      />
    </View>
  );
};

export default SidebarTaskList;

const styles = StyleSheet.create({
  container: {
    width: 200,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  item: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    marginBottom: 10,
    elevation: 1,
  },
  activeItem: {
    backgroundColor: '#e6f0ff',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
});
