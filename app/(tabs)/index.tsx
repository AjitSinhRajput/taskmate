import { Colors } from "@/constants/theme";
import { db } from "@/hooks/firebaseConfig";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
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
  category: "Work" | "Personal" | "School" | "Other";
  createdAt: string;
  modifiedAt: string;
}

export default function HomeScreen() {
  const userName = "John";
  const { theme } = useColorScheme();
  const isDark = theme === "dark";
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const tasksRef = ref(db, "tasks/");
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const list = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => {
            const dateA = new Date(a.modifiedAt || a.createdAt).getTime();
            const dateB = new Date(b.modifiedAt || b.createdAt).getTime();
            return dateB - dateA;
          });
        setTasks(list);
      } else {
        setTasks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Welcome back 🌙";
  };

  // 🔥 Priority and Category Definitions
  const priorityColors = {
    High: "#e74c3c",
    Medium: "#f1c40f",
    Low: "#2ecc71",
  };
  const priorityIcons = {
    High: "flame-outline",
    Medium: "warning-outline",
    Low: "leaf-outline",
  };
  const categoryColors = {
    Work: "#3498db",
    Personal: "#9b59b6",
    School: "#e67e22",
    Other: "#16a085",
  };
  const categoryIcons = {
    Work: "briefcase-outline",
    Personal: "person-circle-outline",
    School: "school-outline",
    Other: "grid-outline",
  };

  const countByPriority = (p: keyof typeof priorityColors) =>
    tasks.filter((t) => t.priority === p).length;
  const countByCategory = (cat: keyof typeof categoryColors) =>
    tasks.filter((t) => t.category === cat).length;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
    >
      <View style={styles.container}>
        {/* 🧭 Title and Logo */}
        <View style={styles.headerRow}>
          <Ionicons
            name="checkmark-done-circle-outline"
            size={38}
            color={Colors[theme].tint}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.appTitle,
              { color: isDark ? Colors.dark.tint : Colors.light.tint },
            ]}
          >
            TaskMate
          </Text>
        </View>

        {/* 👋 Greeting + Quote (Grouped Together) */}
        <View style={styles.greetingBlock}>
          <Text style={[styles.greeting, { color: Colors[theme].text }]}>
            {`${getGreeting()}, ${userName}!`}
          </Text>
          <Text style={[styles.subText, { color: Colors[theme].text }]}>
            Let’s make today productive.
          </Text>
          <Text style={[styles.quote, { color: isDark ? "#aaa" : "#777" }]}>
            “Success is the sum of small efforts, repeated day in and day out.”
          </Text>
        </View>

        {/* 🔥 Priority Overview */}
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryTitle, { color: Colors[theme].text }]}>
            Priority Overview
          </Text>

          <View style={styles.priorityGrid}>
            {Object.keys(priorityColors).map((p) => {
              const color = priorityColors[p as keyof typeof priorityColors];
              const icon = priorityIcons[p as keyof typeof priorityIcons];
              const count = countByPriority(p as keyof typeof priorityColors);

              return (
                <View
                  key={p}
                  style={[
                    styles.priorityCard,
                    {
                      backgroundColor: isDark ? `${color}25` : `${color}15`,
                      borderColor: color,
                    },
                  ]}
                >
                  <Ionicons name={icon as any} size={20} color={color} />
                  <Text
                    style={[
                      styles.priorityLabel,
                      { color: Colors[theme].text },
                    ]}
                  >
                    {p}
                  </Text>
                  <Text style={[styles.priorityCount, { color }]}>
                    {count} {count === 1 ? "Task" : "Tasks"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 🗂️ Category Overview */}
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryTitle, { color: Colors[theme].text }]}>
            Task Overview
          </Text>

          <View style={styles.categoryGrid}>
            {Object.keys(categoryColors).map((cat, index) => {
              const color = categoryColors[cat as keyof typeof categoryColors];
              const count = countByCategory(cat as keyof typeof categoryColors);
              const icon = categoryIcons[cat as keyof typeof categoryIcons];

              return (
                <View
                  key={cat}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isDark ? `${color}25` : `${color}15`,
                      borderColor: color,
                      marginRight: index % 2 === 0 ? 10 : 0,
                      marginBottom: 10,
                    },
                  ]}
                >
                  <Ionicons name={icon as any} size={20} color={color} />
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: Colors[theme].text },
                    ]}
                  >
                    {cat}
                  </Text>
                  <Text style={[styles.categoryCount, { color }]}>
                    {count} {count === 1 ? "Task" : "Tasks"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 🚀 Go to Tasks Button */}
        <Link href="/tasks" asChild>
          <TouchableOpacity style={styles.button}>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Go to My Tasks</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  // Greeting + Quote Block
  greetingBlock: {
    width: "100%",
    marginTop: 60,
    marginBottom: 40, // controls total vertical space of the block
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
  },
  subText: {
    fontSize: 15,
    marginTop: 2,
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 10,
  },

  // Summary
  summaryContainer: {
    width: "100%",
    marginTop: 8,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  // 🔥 Priority Overview
  priorityGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  priorityCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  priorityLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  priorityCount: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },

  // 🗂️ Category Overview
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  categoryCard: {
    width: "47%",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  categoryCount: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },

  // Button
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a90e2",
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 10,
    elevation: 4,
    alignSelf: "stretch",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
