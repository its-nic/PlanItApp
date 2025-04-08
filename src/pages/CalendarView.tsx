import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Task } from '../types/Task';
import { Semester } from '../types/Semester';
import * as SQLite from 'expo-sqlite';
import CalendarKit, { EventItem } from '@howljs/calendar-kit';
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
      <CalendarKit
        minDate={selectedSemester.start_date}
        maxDate={selectedSemester.end_date} 
        hourFormat='h:mm A'
        firstDay={7}
        numberOfDays={7}
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
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default CalendarView;
