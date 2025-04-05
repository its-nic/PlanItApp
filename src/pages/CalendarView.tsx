import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import {
  ExpandableCalendar,
  TimelineList,
  CalendarProvider,
  CalendarUtils,
  TimelineEventProps,
} from 'react-native-calendars';
import { groupBy } from 'lodash';
import { Task } from '../types/Task';
import Semester from '../types/Semester';
import * as SQLite from 'expo-sqlite';

const { width } = Dimensions.get('window');

interface CalendarViewProps {
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
  unscheduledTasks: Task[];
  unscheduledTasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
  scheduledTasks: Task[];
  scheduledTasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
}

const INITIAL_TIME = { hour: 9, minutes: 0 };

const CalendarView: React.FC<CalendarViewProps> = ({
  scheduledTasks,
  scheduledTasksStateSetter,
  unscheduledTasks,
  unscheduledTasksStateSetter,
}) => {
  const [currentDate, setCurrentDate] = useState(CalendarUtils.getCalendarDateString(new Date()));
  const [showSidebar, setShowSidebar] = useState(false);

  const events: TimelineEventProps[] = useMemo(() => {
    return scheduledTasks
      .filter(task => task.start_time && task.end_time)
      .map(task => ({
        id: String(task.id),
        start: task.start_time ? task.start_time.toISOString() : '',
        end: task.end_time ? task.end_time.toISOString() : '',
        title: task.title,
        color: '#1A65EB',
      }));
  }, [scheduledTasks]);

  const eventsByDate = useMemo(() => {
    return groupBy(events, e => CalendarUtils.getCalendarDateString(e.start));
  }, [events]);

  const createNewEvent = useCallback(
    (timeString: string, timeObj: { date?: string; hour: number; minutes: number }) => {
      if (!timeObj.date) return;

      const start = new Date(`${timeObj.date} ${timeObj.hour.toString().padStart(2, '0')}:${timeObj.minutes.toString().padStart(2, '0')}`);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      const newTask: Task = {
        id: Math.floor(Math.random() * 100000),
        title: 'New Event',
        start_time: start,
        end_time: end,
        semester_id: 0,
        description: '',
        due_date: null,
        due_time: null,
        completed: false,
      };

      scheduledTasksStateSetter(prev => [...prev, newTask]);
    },
    [scheduledTasksStateSetter]
  );

  const approveNewEvent = useCallback(
    (timeString: string, timeObj: { date?: string; hour: number; minutes: number }) => {
      if (!timeObj.date) return;

      const start = new Date(`${timeObj.date} ${timeObj.hour.toString().padStart(2, '0')}:${timeObj.minutes.toString().padStart(2, '0')}`);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      Alert.prompt('New Event', 'Enter event title', [
        {
          text: 'Cancel',
          onPress: () => {},
        },
        {
          text: 'Create',
          onPress: (eventTitle) => {
            const newTask: Task = {
              id: Math.floor(Math.random() * 100000),
              title: eventTitle?.trim() || 'New Event',
              start_time: start,
              end_time: end,
              semester_id: 0,
              description: '',
              due_date: null,
              due_time: null,
              completed: false,
            };

            scheduledTasksStateSetter(prev => [...prev, newTask]);
          },
        },
      ]);
    },
    [scheduledTasksStateSetter]
  );

  return (
    <View style={styles.container}>
      <CalendarProvider
        date={currentDate}
        onDateChanged={setCurrentDate}
        showTodayButton
      >
        <ExpandableCalendar firstDay={1} />

        <TimelineList
          events={eventsByDate}
          timelineProps={{
            format24h: true,
            onBackgroundLongPress: createNewEvent,
            onBackgroundLongPressOut: approveNewEvent,
            scrollOffset: 0,
            unavailableHours: [
              { start: 0, end: 6 },
              { start: 22, end: 24 }
            ]
          }}
          initialTime={INITIAL_TIME}
        />
      </CalendarProvider>

      {showSidebar && (
        <View style={styles.unscheduledContainer}>
          {unscheduledTasks.map(task => (
            <Text
              key={task.id}
              style={styles.unscheduledTask}
              onPress={() => {
                const now = new Date();
                const end = new Date(now);
                end.setHours(now.getHours() + 1);

                const updatedTask: Task = {
                  ...task,
                  start_time: now,
                  end_time: end,
                };

                scheduledTasksStateSetter(prev => [...prev, updatedTask]);
                unscheduledTasksStateSetter(prev => prev.filter(t => t.id !== task.id));
              }}
            >
              {task.title}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowSidebar(prev => !prev)}
      >
        <Text style={styles.fabText}>{showSidebar ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  unscheduledContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 8,
    maxWidth: width * 0.4,
    zIndex: 10,
  },
  unscheduledTask: {
    marginVertical: 5,
    padding: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#1A65EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CalendarView;
