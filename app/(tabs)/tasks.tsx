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
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  // THE IMPORTANT MISSING STATE
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  // FETCH TASKS
  useEffect(() => {
    const tasksRef = ref(db, "tasks/");
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Task[] = Object.keys(data).map((key) => ({
          id: key,
          completed: data[key].completed ?? false,
          ...data[key],
        }));
        setTasks(list);
      } else setTasks([]);

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // SAVE OR UPDATE
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
        category,
        dueDate: dueDate.toISOString(),
        completed,
        modifiedAt: timestamp,
        completedAt: completed ? new Date().toISOString() : null,
        notificationId,
      });
      setEditingTask(null);
    } else {
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

  // DELETE
  const handleDelete = (taskId: string) => {
    Alert.alert("Delete Task?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => remove(ref(db, `tasks/${taskId}`)),
      },
    ]);
  };

  // COMPLETE
  const handleComplete = async (task: Task) => {
    if (task.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          task.notificationId
        );
      } catch {}
    }

    await update(ref(db, `tasks/${task.id}`), {
      completed: true,
      completedAt: new Date().toISOString(),
    });
  };

  // HELPERS
  const getPriorityColor = (p: string) =>
    (({ High: "#e74c3c", Medium: "#f1c40f", Low: "#2ecc71" } as any)[p]);

  const getCategoryColor = (c: string) =>
    ((
      {
        Work: "#3498db",
        Personal: "#9b59b6",
        School: "#e67e22",
        Other: "#16a085",
      } as any
    )[c]);

  const truncateText = (text: string, limit: number) =>
    text.length > limit ? text.slice(0, limit) + "..." : text;

  const isOverdue = (due: string) => new Date(due) < new Date();

  // FILTER WITH COMPLETED MODE
  const filteredTasks = tasks.filter((t) => {
    if (showCompletedTasks && !t.completed) return false;
    if (!showCompletedTasks && t.completed) return false;

    const priorityMatch = filter === "All" || t.priority === filter;
    const categoryMatch =
      categoryFilter === "All" || t.category === categoryFilter;
    const searchMatch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return priorityMatch && categoryMatch && searchMatch;
  });

  // RENDER EACH ITEM
  const renderTask = ({ item }: { item: Task }) => {
    const completed = item.completed;
    const overdue = isOverdue(item.dueDate);

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
              backgroundColor: isDark ? "#1f1f1f" : "#fff",
              opacity: completed ? 0.5 : 1,
            },
          ]}
        >
          <View style={styles.taskHeader}>
            <Text
              style={[
                styles.taskTitle,
                {
                  color: Colors[theme].text,
                  textDecorationLine: completed ? "line-through" : "none",
                },
              ]}
            >
              {truncateText(item.title, 22)}
            </Text>

            <View style={styles.iconRow}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
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

              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: Colors.common.error }]}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={Colors[theme].text}
                />
                <Text style={{ color: Colors[theme].text }}>Delete</Text>
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
            {truncateText(item.description || "No description", 70)}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.leftBadges}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(item.category) },
                ]}
              >
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>

              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              >
                <Text style={styles.badgeText}>{item.priority}</Text>
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
                ? "⚠ Overdue"
                : "Due: " + new Date(item.dueDate).toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        showCompleted={showCompletedTasks}
        onToggleCompleted={() => setShowCompletedTasks((prev) => !prev)}
      />

      {/* LIST */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors[theme].tint} />
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color={Colors[theme].tint}
          />
          <Text style={[styles.emptyStateText, { color: Colors[theme].text }]}>
            {showCompletedTasks ? "No completed tasks" : "No tasks found"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={renderTask}
        />
      )}

      {/* ADD ONLY IF ACTIVE MODE */}
      {!showCompletedTasks && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
          onPress={() => {
            setEditingTask(null);
            setVisibleModal(true);
          }}
        >
          <Ionicons name="add" size={36} color={Colors[theme].background} />
        </TouchableOpacity>
      )}

      {/* MODALS */}
      <TaskModal
        visible={visibleModal}
        onClose={() => {
          setVisibleModal(false);
          setEditingTask(null);
        }}
        onSave={(t, d, p, dd, c, done) => handleSave(t, d, p, dd, c, done)}
        taskToEdit={editingTask}
      />

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
  emptyStateText: { fontSize: 18, fontWeight: "600", marginTop: 8 },

  taskCard: { padding: 16, marginHorizontal: 16, borderRadius: 14 },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconRow: { flexDirection: "row", alignItems: "center" },

  actionBtn: {
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

  badgeText: { color: "#000", fontWeight: "600", fontSize: 11 },
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