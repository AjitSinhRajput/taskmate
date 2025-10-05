import { Colors } from "@/constants/theme";
import { db } from "@/hooks/firebaseConfig";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { onValue, push, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
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
  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  // ✅ Live fetch
  useEffect(() => {
    const tasksRef = ref(db, "tasks/");
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        // console.log("Fetched tasks:", list);
        setTasks(list);
      } else {
        setTasks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Add new task
  const handleSave = async (
    title: string,
    description: string,
    priority: "High" | "Medium" | "Low"
  ) => {
    if (!title.trim()) return;
    const timestamp = new Date().toISOString();

    await push(ref(db, "tasks/"), {
      title,
      description,
      priority,
      createdAt: timestamp,
      modifiedAt: timestamp,
    });
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
        return "#ccc";
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <Text style={[styles.heading, { color: isDark ? "#fff" : "#222" }]}>
        TaskMate
      </Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const createdDate = new Date(item.createdAt);
          const modifiedDate = new Date(item.modifiedAt);

          const isModified =
            item.modifiedAt && item.modifiedAt !== item.createdAt;

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
              {/* Title */}
              <Text style={[styles.taskTitle, { color: Colors[theme].text }]}>
                {item.title}
              </Text>

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

              {/* Footer row: Priority badge + date */}
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

                <Text style={[styles.metaText, { color: Colors[theme].text }]}>
                  {`${displayLabel}: ${displayDate.toLocaleDateString()} ${displayDate.toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}`}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
        onPress={() => setVisibleModal(true)}
      >
        <Ionicons name="add" size={36} color={Colors[theme].background} />
      </TouchableOpacity>

      {/* Modal */}
      <TaskModal
        visible={visibleModal}
        onClose={() => setVisibleModal(false)}
        onSave={(title, description, priority) => {
          handleSave(title, description, priority);
        }}
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

  taskCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    // ✅ Light shadow for light theme, stronger elevation for Android
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  taskDescription: {
    fontSize: 14,
    marginBottom: 10,
  },

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

  priorityText: {
    fontWeight: "600",
    fontSize: 12,
  },

  metaText: {
    fontSize: 12,
  },

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
