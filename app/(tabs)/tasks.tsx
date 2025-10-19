import SearchFilter from "@/components/SearchFilter";
import { Colors } from "@/constants/theme";
import { db } from "@/hooks/firebaseConfig";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { onValue, push, ref, remove, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TaskModal from "../../components/taskModal";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  createdAt: string;
  modifiedAt: string;
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

  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  // ✅ Live fetch tasks from Firebase
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

  // ✅ Add or update task
  const handleSave = async (
    title: string,
    description: string,
    priority: "High" | "Medium" | "Low"
  ) => {
    if (!title.trim()) return;
    const timestamp = new Date().toISOString();

    if (editingTask) {
      // Update existing task
      await update(ref(db, `tasks/${editingTask.id}`), {
        title,
        description,
        priority,
        modifiedAt: timestamp,
      });
      setEditingTask(null);
    } else {
      // Add new task
      await push(ref(db, "tasks/"), {
        title,
        description,
        priority,
        createdAt: timestamp,
        modifiedAt: timestamp,
      });
    }
  };

  // ✅ Delete a task with confirmation
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

  // ✅ Priority color logic
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

  const filters: ("All" | "High" | "Medium" | "Low")[] = [
    "All",
    "High",
    "Medium",
    "Low",
  ];

  // ✅ Filter tasks by selected priority
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

      {/* ✅ Filter Bar */}
      {/* <View style={styles.filterRow}>
        {filters.map((item) => {
          const bgColor =
            item === "All"
              ? filter === "All"
                ? Colors[theme].tint
                : isDark
                ? "#2a2a2a"
                : "#e0e0e0"
              : getPriorityColor(item);

          const textColor =
            item === "All"
              ? filter === "All"
                ? Colors[theme].background
                : isDark
                ? "#fff"
                : "#333"
              : item === "Medium"
              ? "#000"
              : "#fff";

          return (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor:
                    filter === item ? bgColor : isDark ? "#2a2a2a" : "#e0e0e0",
                },
              ]}
            >
              <Text
                style={{
                  color: filter === item ? textColor : isDark ? "#fff" : "#333",
                  fontWeight: filter === item ? "700" : "500",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View> */}
      {/* 🔍 Search + Filter */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* ✅ Task List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons
            name={searchQuery.trim().length > 0 ? "search-outline" : "list-outline"}
            size={44}
            color={Colors[theme].tint}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyStateText, { color: Colors[theme].text }]}>
            {searchQuery.trim().length > 0 ? "Task not found" : "No tasks yet"}
          </Text>
          <Text
            style={[
              styles.emptyStateSubtext,
              { color: isDark ? "#aaa" : "#666" },
            ]}
          >
            {searchQuery.trim().length > 0
              ? "Try another keyword or adjust the priority filter."
              : "Create your first task using the + button below."}
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

            const displayLabel = isModified ? "Modified" : "Created";
            const displayDate = isModified ? modifiedDate : createdDate;

            return (
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
                {/* Header with title + edit/delete icons */}
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
                        {
                          borderColor: Colors.common.success, // success green
                        },
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
                      <Text
                        style={{
                          color: Colors[theme].text,
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtnOutline,
                        {
                          borderColor: Colors.common.error, // error red
                        },
                      ]}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={Colors[theme].text}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          color: Colors[theme].text,
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Description */}
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

                {/* Footer: Priority + Date */}
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
                    {`${displayLabel}: ${displayDate.toLocaleDateString()} ${displayDate.toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}`}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ✅ Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
        onPress={() => {
          setEditingTask(null);
          setVisibleModal(true);
        }}
      >
        <Ionicons name="add" size={36} color={Colors[theme].background} />
      </TouchableOpacity>

      {/* ✅ Modal */}
      <TaskModal
        visible={visibleModal}
        onClose={() => {
          setVisibleModal(false);
          setEditingTask(null);
        }}
        onSave={(title, description, priority) =>
          handleSave(title, description, priority)
        }
        taskToEdit={editingTask}
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

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 12,
    marginHorizontal: 10,
  },

  filterBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
  },

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

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 8,
  },

  actionText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
    color: "#fff",
  },
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 8,
    borderWidth: 1.8,
    backgroundColor: "transparent",
  },

  actionBtnFilled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 8,
  },

  taskTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  taskDescription: { fontSize: 14, marginBottom: 10 },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

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