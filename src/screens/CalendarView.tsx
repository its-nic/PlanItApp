import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Task } from '../types/Task';
import { Semester } from '../types/Semester';
import * as SQLite from 'expo-sqlite';
import CalendarKit from '@howljs/calendar-kit';
import { addTask, getTask, getTasks, updateTaskTime, deleteTask } from '../storage/db';
import EditTaskModal from '../components/tasks/EditTaskModal';

interface CalendarViewProps {
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
  tasks: Task[];
  tasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  db,
  selectedSemester,
  tasks,
  tasksStateSetter,
}) => {
  const [visibleStartDate, setVisibleStartDate] = useState(new Date());
  const [visibleDays, setVisibleDays] = useState(7);
  const [selectedTask, setSelectedTask] = useState<Task>({
    id: 0,
    semester_id: selectedSemester.id,
    title: '',
    description: '',
    due_date: null,
    start: new Date(),
    end: new Date(),
    completed: false,
  });
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);

  // Convert tasks to EventItem format required by CalendarKit
  const convertTasksToEvents = (tasks: Task[]) => {
    return tasks
      .filter((task) => {
        // Ensure both start and end dates exist and are valid
        return task.start && task.end && 
               !isNaN(task.start.getTime()) && 
               !isNaN(task.end.getTime());
      })
      .map((task) => ({
        id: task.id.toString(),
        title: task.title,
        start: { dateTime: task.start!.toISOString() },
        end: { dateTime: task.end!.toISOString() },
        // You can add more event details here if needed, such as description or color
      }));
  };

  // Handle event creation
  const handleEventCreate = (event: any) => {
    try {
      const startDate = new Date(event.start.dateTime);
      const endDate = new Date(event.end.dateTime);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Invalid date received from calendar event:', event);
        return;
      }
      
      addTask(db, selectedSemester, 'New Task', '', null, startDate, endDate);
      getTasks(db, selectedSemester, tasksStateSetter);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  // Handle event modification
  const handleEventChange = (event: any) => {
    try {
      const startDate = new Date(event.start.dateTime);
      const endDate = new Date(event.end.dateTime);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Invalid date received from calendar event:', event);
        return;
      }
      
      updateTaskTime(db, Number(event.id), startDate, endDate);
      getTasks(db, selectedSemester, tasksStateSetter);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  // Handle event selection (task selection)
  const handleEventSelect = async (event: any) => {
    await getTask(db, Number(event.id), (task) => {
      setSelectedTask(task);
      setEditTaskModalVisible(true);
    });
  };

  useEffect(() => {
    getTasks(db, selectedSemester, tasksStateSetter); // Load tasks initially
  }, [db, selectedSemester]);

  return (
    <View style={styles.container}>
      <View style={styles.monthHeaderWrapper}>
        {visibleDays === 7 && <Text style={styles.weekLabel}>Week</Text>}
        <Text style={styles.monthHeader}>
          {visibleStartDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => setVisibleDays(visibleDays === 1 ? 7 : 1)}>
          <Ionicons name={visibleDays === 1 ? 'calendar-outline' : 'today-outline'} size={20} color={'white'} />
        </TouchableOpacity>

        <EditTaskModal
          visible={editTaskModalVisible}
          onClose={() => setEditTaskModalVisible(false)}
          task={selectedTask}
          updateExistingTask={async (id, values, completed) => {
            await updateTaskTime(db, id, values.startTime!, values.endTime!); // Update task start and end times
            await getTasks(db, selectedSemester, tasksStateSetter); // Refresh tasks
          }}
          removeTask={async (id) => {
            await deleteTask(db, id);
            await getTasks(db, selectedSemester, tasksStateSetter); // Refresh tasks
          }}
        />
      </View>

      <CalendarKit
        minDate={selectedSemester.start_date}
        maxDate={selectedSemester.end_date}
        hourFormat="h:mm A"
        showWeekNumber
        allowPinchToZoom
        firstDay={7}
        numberOfDays={visibleDays}
        onDateChanged={(date) => {
          try {
            const newDate = new Date(date);
            if (!isNaN(newDate.getTime())) {
              setVisibleStartDate(newDate);
            } else {
              console.warn('Invalid date received from calendar:', date);
            }
          } catch (error) {
            console.error('Error handling date change:', error);
          }
        }}
        allowDragToCreate
        onDragCreateEventEnd={handleEventCreate}
        allowDragToEdit
        onDragEventEnd={handleEventChange}
        dragStep={5}
        onPressEvent={handleEventSelect}
        events={convertTasksToEvents(tasks)} // Convert tasks to events for CalendarKit
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthHeaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  weekLabel: {
    position: 'absolute',
    left: 10,
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  button: {
    position: 'absolute',
    right: 10,
    borderRadius: 50,
    backgroundColor: '#1A65EB',
    padding: 8,
  },
});

export default CalendarView;
