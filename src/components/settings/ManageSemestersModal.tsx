import * as SQLite from "expo-sqlite";
import { deleteSemester, getSemesters, saveSelectedSemester } from "../../database/db";
import Semester from "../../types/Semester";
import { Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import NewSemesterForm from "./NewSemesterForm";

interface ManageSemestersModalProps {
    visible: boolean
    onClose: () => void;
    db: SQLite.SQLiteDatabase;
    semesters: Semester[];
    semestersStateSetter: React.Dispatch<React.SetStateAction<Semester[]>>;
    selectedSemester: Semester;
    selectedSemesterStateSetter: React.Dispatch<React.SetStateAction<Semester>>;
}

const ManageSemestersModal: React.FC<ManageSemestersModalProps> = ({ visible, onClose, db, semesters, semestersStateSetter, selectedSemester, selectedSemesterStateSetter }) => {

    return(
        <Modal visible={visible} animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Select a Semester</Text>
                        <ScrollView style={styles.scrollView}>
                            {semesters.map((semester) => (
                                <View key={semester.id} style={styles.semesterItem}>
                                    <Text style={styles.semesterText}>{semester.title}</Text>
                                    <Text>{`Start: ${semester.start_date}`}</Text>
                                    <Text>{`End: ${semester.end_date}`}</Text>
                                    
                                    {/* Select Button */}
                                    <TouchableOpacity 
                                        style={styles.selectButton} 
                                        onPress={() => {
                                            selectedSemesterStateSetter(semester);
                                            saveSelectedSemester(semester);
                                            onClose();
                                        }}
                                    >
                                        <Text style={styles.selectButtonText}>Select</Text>
                                    </TouchableOpacity>

                                    {/* Delete Button */}
                                    <TouchableOpacity 
                                        style={styles.deleteButton} 
                                        onPress={() => {
                                            deleteSemester(db, semester.id);
                                            getSemesters(db, semestersStateSetter);
                                        }}
                                    >
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>

                        {/* Close Button */}
                        <Button title="Close" onPress={() => onClose()} />                            
                    </View>
                    <Button title="Create New Semester" onPress={() => setNewSemesterModalVisible(true)} />
                </View>
            </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "100%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    scrollView: {
        maxHeight: 300,
        width: "100%",
    },
    semesterItem: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginVertical: 5,
        alignItems: "center",
    },
    semesterText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    selectButton: {
        backgroundColor: "#007BFF",
        padding: 5,
        marginTop: 5,
        borderRadius: 5,
    },
    selectButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    deleteButton: {
        backgroundColor: "red",
        padding: 5,
        marginTop: 5,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default ManageSemestersModal;