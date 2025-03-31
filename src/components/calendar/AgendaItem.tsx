import React from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  due: string;
  time: string;
  duration: string;
  completed: boolean;
}

const AgendaItem = ( task: TaskItem ) => {
    return (
        <TouchableOpacity>
            <View>
                <Text style={styles.itemHourText}></Text>
                <Text style={styles.itemDurationText}></Text>
            </View>
            <Text style={styles.itemTitleText}>{task.title} - Due: {task.due}</Text>
            <View>
                {!task.completed && <Button color={'grey'} title={'Finish'} />}
            </View>            
        </TouchableOpacity>
    )

}

export default React.memo(AgendaItem);

const styles = StyleSheet.create({
    item: {
      padding: 20,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: 'lightgrey',
      flexDirection: 'row'
    },
    itemHourText: {
      color: 'black'
    },
    itemDurationText: {
      color: 'grey',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4
    },
    itemTitleText: {
      color: 'black',
      marginLeft: 16,
      fontWeight: 'bold',
      fontSize: 16
    },
    itemButtonContainer: {
      flex: 1,
      alignItems: 'flex-end'
    },
    emptyItem: {
      paddingLeft: 20,
      height: 52,
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'lightgrey'
    },
    emptyItemText: {
      color: 'lightgrey',
      fontSize: 14
    }
  });