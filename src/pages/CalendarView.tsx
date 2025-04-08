import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Task } from '../types/Task';
import { Semester } from '../types/Semester';
import * as SQLite from 'expo-sqlite';
import CalendarKit from '@howljs/calendar-kit';
import { addTask, getTask, getTasks, updateTaskTime } from '../database/db';
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
  const [selectedTask, setSelectedTask] = useState<Task>({id:0, semester_id:selectedSemester.id, title:"", description:"", due_date:null, start:new Date(), end:new Date(), completed:false});
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);

  const handleEventCreate = (event: any) => {
    addTask(db, selectedSemester, "New Task", "", null, new Date(event.start.dateTime), new Date(event.end.dateTime));
    getTasks(db, selectedSemester, tasksStateSetter);
  }

  const handleEventChange = (event: any) => {
    updateTaskTime(db, Number(event.id), new Date(event.start.dateTime), new Date(event.end.dateTime));
    getTasks(db, selectedSemester, tasksStateSetter);
  }

  const handleEventSelect = async (event: any) => {
    await getTask(db, Number(event.id), setSelectedTask);
    if(selectedTask.id != 0) {
      setEditTaskModalVisible(true);
    }
  }

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
        <TouchableOpacity style={styles.button} onPress={() => visibleDays === 1 ? setVisibleDays(7) : setVisibleDays(1)}>
          <Ionicons name={visibleDays === 1 ? "calendar-outline" : "today-outline"} size={20} color={'white'} />
        </TouchableOpacity>

        <EditTaskModal
          visible={editTaskModalVisible}
          onClose={() => setEditTaskModalVisible(false)}
          db={db}
          selectedSemester={selectedSemester}
          task={selectedTask}
          tasksStateSetter={tasksStateSetter}
      />
      </View>

      <CalendarKit
        minDate={selectedSemester.start_date}
        maxDate={selectedSemester.end_date} 
        hourFormat='h:mm A'
        showWeekNumber
        allowPinchToZoom
        firstDay={7}
        numberOfDays={visibleDays}
        onDateChanged={(date) => setVisibleStartDate(new Date(date))}
        allowDragToCreate
        onDragCreateEventEnd={handleEventCreate}
        allowDragToEdit
        onDragEventEnd={handleEventChange}
        dragStep={5}
        onPressEvent={handleEventSelect}
        events={tasks.map(task => ({
          id: task.id.toString(),
          title: task.title,
          start: { dateTime: task.start.toISOString() },
          end: { dateTime: task.end.toISOString() },
          color: '#1A65EB',
        }))}
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
