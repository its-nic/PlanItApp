import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AgendaList, CalendarProvider, ExpandableCalendar } from 'react-native-calendars';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  due: string;
  time: string;
  duration: string;
  completed: boolean;
}

const CalendarView = () => {
  return (
    <CalendarProvider
      date={new Date().toISOString().split('T')[0]} // Set the current date as the initial date>
      showTodayButton
    >
        <ExpandableCalendar
        >
            
        </ExpandableCalendar>

    </CalendarProvider>
  );
}

export default CalendarView;
