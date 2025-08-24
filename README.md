# PlanIt – Study Planner App

PlanIt is a React Native mobile app designed for students to manage their academic lives. From organizing semesters and visualizing class schedules to managing tasks and deadlines, PlanIt helps students stay on track with a clean, intuitive interface and calendar integration.

## **Learning Objectives & Technical Highlights**

This project serves as an excellent learning platform for mastering several key mobile development concepts:

### **State Management & Data Flow**
- **React Hooks Mastery**: Comprehensive use of `useState`, `useEffect`, and custom hooks (`useTasks`, `useAssignments`)
- **Props Drilling Patterns**: Understanding how to pass data through component hierarchies efficiently
- **Local State vs. Database State**: Managing both component-level and persistent data states

### **Database Design & SQLite Integration**
- **Relational Database Concepts**: Foreign key relationships between semesters, assignments, and tasks
- **SQLite with React Native**: Using `expo-sqlite` for local data persistence
- **Database Schema Design**: Proper table structure with constraints and relationships
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality for all entities

### **Date & Time Handling**
- **JavaScript Date API**: Comprehensive date manipulation and validation
- **ISO String Conversion**: Proper serialization/deserialization for database storage
- **Date Validation**: Robust error handling for invalid dates (prevents app crashes)
- **Calendar Integration**: Converting between different date formats for UI components

### **Component Architecture**
- **Modal Pattern**: Reusable modal components for forms and editing
- **Form Handling**: Controlled components with validation and state management
- **Component Composition**: Building complex UIs from simple, reusable components
- **Props Interface Design**: TypeScript interfaces for component contracts

### **React Native Specific Patterns**
- **Platform-Specific Code**: Handling iOS vs. Android differences
- **Navigation Patterns**: Tab-based navigation with React Navigation
- **Touch Interactions**: Drag-and-drop, long press, and gesture handling
- **Responsive Design**: Adapting layouts for different screen sizes

## **Features**

### **Current Functionality**

#### **Semester Management**
- Create a new semester by specifying title, start date, and end date
- View all existing semesters and select one as "Active"
- Delete old semesters (cannot delete the currently active one)
- Persist the selected semester using AsyncStorage

#### **Calendar View (Powered by CalendarKit)**
- Displays a week or day calendar toggle
- Visual blocks for each task, based on start/end times
- Tap to edit a task using a modal (EditTaskModal)
- Drag to create new tasks
- Drag existing tasks to reschedule (time is automatically updated in the database)
- Fully integrates task management and scheduling in one interactive view

#### **Task Management**
- Displays all tasks for the selected semester
- Shows task info: title, description, due date, duration, and status
- Edit tasks via modal: update title, description, time, and duration
- Delete tasks from the modal, with confirmation prompt
- Task times and durations are synced with calendar view

#### **Settings Page**
- Displays currently active semester and basic stats (task count, date range)
- Manage semesters via a modal (set active, delete, create)
- Organized and clear layout for academic overview

#### **Local Persistence**
- SQLite (via expo-sqlite) stores semesters and tasks
- AsyncStorage remembers the selected semester between app sessions

### **Planned / Upcoming Features**
- **Drag & Drop from Task List to Calendar**: Add ability to drag a task from the Task List page and drop it into the calendar
- **Add Task Functionality**: A "+ New Task" button to add a task from the TasksView
- **Task Sorting Options**: Buttons to sort tasks by due date, duration, name, or completion
- **UI Enhancements**: Drag-and-drop animations and haptic feedback
- **Sync & Backup**: Firebase or Supabase integration for cloud syncing

## **Technical Architecture**

### **Project Structure**
```
src/
├── components/          # Reusable UI components
│   ├── assignments/     # Assignment-related modals
│   ├── settings/        # Settings and semester management
│   └── tasks/          # Task forms and display components
├── hooks/              # Custom React hooks for data management
├── screens/            # Main app screens and views
├── storage/            # Database operations and data layer
└── types/              # TypeScript type definitions
```

### **Data Flow Architecture**
1. **Database Layer** (`storage/db.tsx`): SQLite operations and data persistence
2. **Custom Hooks** (`hooks/`): Business logic and state management
3. **Screen Components** (`screens/`): Main UI views and navigation
4. **Reusable Components** (`components/`): Modular UI elements

### **Database Schema**
```sql
-- Semesters table (parent)
CREATE TABLE semesters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL
);

-- Assignments table (child of semesters)
CREATE TABLE assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  semester_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE
);

-- Tasks table (child of semesters, optional assignment link)
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  semester_id INTEGER NOT NULL,
  assignment_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  start TEXT,
  end TEXT,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE SET NULL
);
```

### **Key Technical Patterns**

#### **Error Handling & Validation**
- **Date Validation**: Comprehensive date parsing with fallbacks
- **Database Error Handling**: Try-catch blocks with proper cleanup
- **User Input Validation**: Form validation and error messages
- **Graceful Degradation**: App continues working even with corrupted data

#### **Performance Optimizations**
- **Database Statement Reuse**: Prepared statements for repeated operations
- **Efficient Queries**: Single queries with JOINs where possible
- **State Updates**: Minimal re-renders through proper state management
- **Memory Management**: Proper cleanup of database statements

#### **Type Safety**
- **TypeScript Interfaces**: Strong typing for all data structures
- **Props Validation**: Component interfaces ensure correct usage
- **Database Types**: Type-safe database operations
- **API Contracts**: Clear interfaces between components

## **Tech Stack**

### **Core Technologies**
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **Async Storage**: @react-native-async-storage/async-storage

### **UI & Interaction**
- **Calendar**: @howljs/calendar-kit
- **Date/Time Picker**: react-native-modal-datetime-picker
- **Icons**: @expo/vector-icons (Ionicons)
- **Navigation**: @react-navigation/bottom-tabs and @react-navigation/native

### **Development Tools**
- **Debugging**: expo-drizzle-studio-plugin for live DB inspection
- **Type Checking**: TypeScript for compile-time error detection
- **Code Quality**: ESLint and Prettier for consistent code style

## **Installation & Setup**

### **Prerequisites**
- Node.js (v16 or higher)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (for emulator or physical device)

### **Clone and Run**
```bash
git clone https://github.com/yourusername/planit-study-planner.git
cd planit-study-planner
npm install
npx expo start
```

Use Expo Go or an emulator to launch the app.

## **Learning Outcomes**

By working with this codebase, developers will gain experience with:

1. **React Native Fundamentals**: Component lifecycle, state management, and navigation
2. **Database Design**: Schema design, relationships, and CRUD operations
3. **Error Handling**: Robust error handling patterns for production apps
4. **Performance**: Database optimization and React performance best practices
5. **TypeScript**: Strong typing and interface design
6. **Mobile UX**: Touch interactions, modals, and responsive design
7. **Data Persistence**: Local storage strategies and data synchronization
8. **Testing**: Component testing and database operation validation

## **Contributing**

This project welcomes contributions! Areas for improvement include:
- Additional test coverage
- Performance optimizations
- UI/UX enhancements
- New features and functionality
- Documentation improvements

## **License**

This project is open source and available under the [MIT License](LICENSE).
