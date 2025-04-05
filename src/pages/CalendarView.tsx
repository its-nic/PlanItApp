import * as SQLite from "expo-sqlite";
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AgendaList, CalendarProvider, DateData, ExpandableCalendar, WeekCalendar } from 'react-native-calendars';
import Semester from "../types/Semester";
import Task from "../types/Task";
import { getSelectedSemester } from "../database/db";
import AgendaItem from "../components/calendar/AgendaItem";

// @ts-ignore fix for defaultProps warning: https://github.com/wix/react-native-calendars/issues/2455
ExpandableCalendar.defaultProps = undefined;

interface CalendarViewProps {
  db: SQLite.SQLiteDatabase;
  selectedSemester: Semester;
  unscheduledTasks: Task[];
  unscheduledTasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
  scheduledTasks: Task[];
  scheduledTasksStateSetter: React.Dispatch<React.SetStateAction<Task[]>>;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  db,
  selectedSemester,
  unscheduledTasks,
  unscheduledTasksStateSetter,
  scheduledTasks,
  scheduledTasksStateSetter,
}) => {
  const [agendaItems, setAgendaItems] = useState<any[]>([]);

  // Generate list of string dates between range
  const generateDatesInRange = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = [];
    var iteratorDate = new Date(startDate);
    iteratorDate.setHours(0, 0, 0, 0);
    while (iteratorDate <= endDate) {
      dates.push(iteratorDate.toLocaleDateString('en-CA'))
      iteratorDate.setDate(iteratorDate.getDate() + 1);
    }
    return dates;
  }

  // Group tasks by date
  const mapScheduledTasksToDates = (scheduledTasks: Task[], dates: string[]) => {
    const groupedTasks: any = {};
    scheduledTasks.forEach(task => {
      if (task.start_time != null) {
        const taskDate = task.start_time.toLocaleDateString('en-CA');
        if (groupedTasks[taskDate]) {
          groupedTasks[taskDate].push(task);
        }
        else {
          groupedTasks[taskDate] = [task];
        }
      }
    });
    const agenda = dates.map((date) => {
      return {
        title: date,
        data: groupedTasks[date] || [{}],
      }
    });
    return agenda;
  };

  // Update agendaItems when scheduledTasks or semester dates change
  useEffect(() => {
    const startDate = selectedSemester.start_date;
    const endDate = selectedSemester.end_date;

    // Generate a list of all dates within the selected semester range
    const datesInRange = generateDatesInRange(startDate, endDate);
    const filteredDates = datesInRange.filter((date) => {
      const currDate = new Date();
      currDate.setHours(0, 0, 0, 0);
      return date >= currDate.toLocaleDateString('en-CA');
    });

    // Map scheduled tasks to the agenda items for each day
    const agenda = mapScheduledTasksToDates(scheduledTasks, filteredDates);
    setAgendaItems(agenda);
  }, [scheduledTasks, selectedSemester]);

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

  return (
    <CalendarProvider
      date={new Date().toDateString().split('T')[0]}
      showTodayButton
      disabledOpacity={0.1}
      theme={{
        todayButtonTextColor: '#28A745',
        todayButtonFontSize: 16,
        todayButtonPosition: 'right',
      }}
    >
      <ExpandableCalendar
        minDate={selectedSemester.start_date.toLocaleDateString('en-CA')}
        maxDate={selectedSemester.end_date.toLocaleDateString('en-CA')}
        theme={{
          selectedDayBackgroundColor: '#1A65EB',
          todayTextColor: '#28A745',
        }}        
      />

      <AgendaList
      sections={agendaItems}
      renderItem={renderItem}
      sectionStyle={styles.section}
      />
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#1A65EB',
    borderTopWidth: 5,
    borderColor: 'white',
    elevation: 2,
    color: 'white',
    fontSize: 16,
    textTransform: 'capitalize',
  },
});

export default CalendarView;
