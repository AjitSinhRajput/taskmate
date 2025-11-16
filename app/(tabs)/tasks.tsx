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

import { Task } from "../../types/type";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [filter, setFilter] = useState<"All" | "High" | "Medium" | "Low">(
    "All"
  );
  const [categoryFilter, setCategoryFilter] = useState<
    "All" | "Work" | "Personal" | "School" | "Other"
  >("All");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  // --------------------------------------------
  // FETCH TASKS
  // --------------------------------------------
  useEffect(() => {
    const tasksRef = ref(db, "tasks/");
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Task[] = Object.keys(data).map((key) => ({
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

  // --------------------------------------------
  // SAVE OR UPDATE TASK
  // --------------------------------------------
  const handleSave = async (
    title: string,
    description: string,
    priority: "High" | "Medium" | "Low",
    dueDate: Date,
    category: "Work" | "Personal" | "School" | "Other",
    completed: boolean
  ) => {
    const timestamp = new Date().toISOString();
    let notificationId: string | null = null;

    // Schedule reminder 30 min before
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

    // UPDATE
    if (editingTask) {
      await update(ref(db, `tasks/${editingTask.id}`), {
        title,
        description,
        priority,
        category,
        dueDate: dueDate.toISOString(),
        modifiedAt: timestamp,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
        notificationId,
      });

      setEditingTask(null);
    } else {
      // CREATE
      await push(ref(db, "tasks/"), {
        title,
        description,
        priority,
        category,
        dueDate: dueDate.toISOString(),
        createdAt: timestamp,
        modifiedAt: timestamp,
        completed: false,
        completedAt: null,
        notificationId,
      });
    }
  };

  // --------------------------------------------
  // DELETE
  // --------------------------------------------
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

  // --------------------------------------------
  // COMPLETE TASK
  // --------------------------------------------
  const handleComplete = async (task: Task) => {
    try {
      if (task.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          task.notificationId
        );
      }
    } catch {}

    await update(ref(db, `tasks/${task.id}`), {
      completed: true,
      completedAt: new Date().toISOString(),
    });
  };

  // --------------------------------------------
  // HELPERS
  // --------------------------------------------
  const getPriorityColor = (priority: string) => {
    const colors = { High: "#e74c3c", Medium: "#f1c40f", Low: "#2ecc71" };
    return colors[priority as keyof typeof colors];
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Work: "#3498db",
      Personal: "#9b59b6",
      School: "#e67e22",
      Other: "#16a085",
    };
    return colors[category as keyof typeof colors];
  };

  const truncateText = (text: string, limit: number) =>
    text.length > limit ? text.slice(0, limit) + "..." : text;

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const filteredTasks = tasks.filter((t) => {
    const matchPriority = filter === "All" || t.priority === filter;
    const matchCategory =
      categoryFilter === "All" || t.category === categoryFilter;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchPriority && matchCategory && matchSearch;
  });

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <Text style={[styles.heading, { color: Colors[theme].text }]}>
        TaskMate
      </Text>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* LOADING */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
        </View>
      ) : filteredTasks.length === 0 ? (
        // EMPTY
        <View style={styles.emptyStateContainer}>
          <Ionicons
            name={searchQuery.trim() ? "search-outline" : "list-outline"}
            size={44}
            color={Colors[theme].tint}
          />
          <Text style={[styles.emptyStateText, { color: Colors[theme].text }]}>
            {searchQuery.trim() ? "Task not found" : "No tasks yet"}
          </Text>
        </View>
      ) : (
        // LIST
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const overdue = isOverdue(item.dueDate);
            const completed = item.completed;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedTask(item);
                  setViewModalVisible(true);
                }}
              >
                <View
                  style={[
                    styles.taskCard,
                    {
                      opacity: completed ? 0.5 : 1,
                      backgroundColor: isDark ? "#1f1f1f" : "#ffffff",
                    },
                  ]}
                >
                  {/* HEADER */}
                  <View style={styles.taskHeader}>
                    <Text
                      style={[
                        styles.taskTitle,
                        {
                          color: Colors[theme].text,
                          textDecorationLine: completed
                            ? "line-through"
                            : "none",
                        },
                      ]}
                    >
                      {truncateText(item.title, 22)}
                    </Text>

                    <View style={styles.iconRow}>
                      {/* EDIT */}

                      <TouchableOpacity
                        style={[
                          styles.actionBtnOutline,
                          { borderColor: Colors.common.success },
                        ]}
                        onPress={() => {
                          setEditingTask({
                            ...item,
                            completed: item.completed ?? false,
                          });
                          setVisibleModal(true);
                        }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color={Colors[theme].text}
                        />
                        <Text style={{ color: Colors[theme].text }}>Edit</Text>
                      </TouchableOpacity>

                      {/* DELETE */}
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
                        />
                        <Text style={{ color: Colors[theme].text }}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* DESCRIPTION */}
                  <Text
                    style={[
                      styles.taskDescription,
                      {
                        color: Colors[theme].text,
                        fontStyle: !item.description ? "italic" : "normal",
                      },
                    ]}
                  >
                    {truncateText(
                      item.description || "No description added",
                      70
                    )}
                  </Text>

                  {/* FOOTER */}
                  <View style={styles.footerRow}>
                    <View style={styles.leftBadges}>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: getCategoryColor(item.category) },
                        ]}
                      >
                        <Text
                          style={{
                            color: Colors.dark.background,
                            fontSize: 11,
                            fontWeight: "600",
                          }}
                        >
                          {item.category}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: getPriorityColor(item.priority) },
                        ]}
                      >
                        <Text
                          style={{
                            color: Colors.dark.background,
                            fontWeight: "600",
                            fontSize: 12,
                          }}
                        >
                          {item.priority}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.metaText,
                        {
                          color: completed
                            ? Colors.common.success
                            : overdue
                            ? Colors.common.error
                            : Colors[theme].text,
                          fontWeight: completed || overdue ? "700" : "500",
                        },
                      ]}
                    >
                      {completed
                        ? "✓ Completed"
                        : overdue
                        ? "⚠️ Overdue"
                        : "Due: " + new Date(item.dueDate).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
        onPress={() => {
          setEditingTask(null);
          setVisibleModal(true);
        }}
      >
        <Ionicons name="add" size={36} color={Colors[theme].background} />
      </TouchableOpacity>

      {/* TASK MODAL */}
      <TaskModal
        visible={visibleModal}
        onClose={() => {
          setVisibleModal(false);
          setEditingTask(null);
        }}
        onSave={(t, d, p, dd, c, done) => handleSave(t, d, p, dd, c, done)}
        taskToEdit={editingTask}
      />

      {/* VIEW MODAL */}
      <TaskViewModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedTask(null);
        }}
        onComplete={() => selectedTask && handleComplete(selectedTask)}
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
    borderRadius: 14,
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

  taskTitle: { fontSize: 16, fontWeight: "600" },
  taskDescription: { fontSize: 14, marginBottom: 10 },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftBadges: { flexDirection: "row", alignItems: "center", gap: 8 },

  categoryBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },

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
  },
});