import SearchFilter from "@/components/SearchFilter";
import TaskModal from "@/components/taskModal";
import TaskViewModal from "@/components/TaskViewModal";
import { Colors } from "@/constants/theme";
import { db } from "@/hooks/firebaseConfig";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { onValue, push, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  createdAt: string;
  modifiedAt: string;
  dueDate: string;
  notificationId?: string | null;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [filter, setFilter] = useState<"All" | "High" | "Medium" | "Low">(
    "All"
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  // Fetch tasks
  useEffect(() => {
    const tasksRef = ref(db, "tasks/");
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setTasks(list);
      } else {
        setTasks([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Save / update
  const handleSave = async (
    title: string,
    description: string,
    priority: "High" | "Medium" | "Low",
    dueDate: Date
  ) => {
    const timestamp = new Date().toISOString();
    let notificationId: string | null = null;

    const triggerTime = new Date(dueDate.getTime() - 30 * 60 * 1000);

    if (triggerTime > new Date()) {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Task Reminder",
          body: `"${title}" is due at ${dueDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerTime,
        },
      });
    }

    if (editingTask) {
      await update(ref(db, `tasks/${editingTask.id}`), {
        title,
        description,
        priority,
        dueDate: dueDate.toISOString(),
        modifiedAt: timestamp,
        notificationId,
      });
      setEditingTask(null);
    } else {
      await push(ref(db, "tasks/"), {
        title,
        description,
        priority,
        createdAt: timestamp,
        modifiedAt: timestamp,
        dueDate: dueDate.toISOString(),
        notificationId,
      });
    }
  };

  const handleDelete = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => await remove(ref(db, `tasks/${taskId}`)),
      },
    ]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "#e74c3c";
      case "Medium":
        return "#f1c40f";
      case "Low":
        return "#2ecc71";
      default:
        return Colors[theme].tint;
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = filter === "All" || t.priority === filter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <Text style={[styles.heading, { color: isDark ? "#fff" : "#222" }]}>
        TaskMate
      </Text>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons
            name={
              searchQuery.trim().length > 0 ? "search-outline" : "list-outline"
            }
            size={44}
            color={Colors[theme].tint}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyStateText, { color: Colors[theme].text }]}>
            {searchQuery.trim().length > 0 ? "Task not found" : "No tasks yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const createdDate = new Date(item.createdAt);
            const modifiedDate = new Date(item.modifiedAt);
            const isModified = item.modifiedAt !== item.createdAt;

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedTask(item);
                  setViewModalVisible(true);
                }}
              >
                <View
                  style={[
                    styles.taskCard,
                    {
                      backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
                      borderWidth: isDark ? 0 : 1,
                      borderColor: isDark ? "transparent" : "#e0e0e0",
                    },
                  ]}
                >
                  <View style={styles.taskHeader}>
                    <Text
                      style={[styles.taskTitle, { color: Colors[theme].text }]}
                    >
                      {item.title}
                    </Text>
                    <View style={styles.iconRow}>
                      <TouchableOpacity
                        style={[
                          styles.actionBtnOutline,
                          { borderColor: Colors.common.success },
                        ]}
                        onPress={() => {
                          setEditingTask(item);
                          setVisibleModal(true);
                        }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color={Colors[theme].text}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={{ color: Colors[theme].text }}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionBtnOutline,
                          { borderColor: Colors.common.error },
                        ]}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={Colors[theme].text}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={{ color: Colors[theme].text }}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.taskDescription,
                      {
                        color: Colors[theme].text,
                        fontStyle: !item.description ? "italic" : "normal",
                      },
                    ]}
                  >
                    {item.description?.trim()
                      ? item.description
                      : "No description added"}
                  </Text>

                  <View style={styles.footerRow}>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(item.priority) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: Colors.dark.background },
                        ]}
                      >
                        {item.priority}
                      </Text>
                    </View>

                    <Text
                      style={[styles.metaText, { color: Colors[theme].text }]}
                    >
                      Due: {new Date(item.dueDate).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
        onPress={() => {
          setEditingTask(null);
          setVisibleModal(true);
        }}
      >
        <Ionicons name="add" size={36} color={Colors[theme].background} />
      </TouchableOpacity>

      <TaskModal
        visible={visibleModal}
        onClose={() => {
          setVisibleModal(false);
          setEditingTask(null);
        }}
        onSave={(title, description, priority, dueDate) =>
          handleSave(title, description, priority, dueDate)
        }
        taskToEdit={editingTask}
      />
      <TaskViewModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    marginLeft: 16,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  taskCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconRow: { flexDirection: "row", alignItems: "center" },
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 8,
    borderWidth: 1.8,
  },
  taskTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  taskDescription: { fontSize: 14, marginBottom: 10 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontWeight: "600", fontSize: 12 },
  metaText: { fontSize: 12 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
