import { Colors } from "@/constants/theme";
import { db } from "@/hooks/firebaseConfig";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
    FlatList,
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
  createdAt: string;
  modifiedAt: string;
}

export default function HomeScreen() {
  const userName = "John";
  const currentHour = new Date().getHours();
  const { theme } = useColorScheme();
  const isDark = theme === "dark";
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch tasks and sort by most recent modification or creation
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
            return dateB - dateA; // newest (modified or created) first
          });

        setTasks(list.slice(0, 3)); // show top 3
      } else {
        setTasks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const getGreeting = () => {
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 18) return "Good Afternoon";
    return "Good Evening";
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
    >
      <View style={styles.container}>
        {/* App Title */}
        <Text
          style={[
            styles.appTitle,
            { color: isDark ? Colors.dark.tint : Colors.light.tint },
          ]}
        >
          TaskMate
        </Text>

        {/* Greeting */}
        <Text style={[styles.greeting, { color: Colors[theme].text }]}>
          {`${getGreeting()}, ${userName}!`}
        </Text>
        <Text style={[styles.subText, { color: Colors[theme].text }]}>
          Let’s make today productive.
        </Text>
        {/* Illustration */}
        <Ionicons
          name="checkmark-done-circle-outline"
          size={160}
          color={Colors[theme].tint}
          style={styles.icon}
        />
        {/* Upcoming Tasks Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#1e1e1e" : "#f2f2f2" },
          ]}
        >
          <Text style={[styles.cardTitle, { color: Colors[theme].text }]}>
            Recent Tasks
          </Text>

          {tasks.length > 0 ? (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const lastUpdated = new Date(
                  item.modifiedAt || item.createdAt
                ).toLocaleString();
                return (
                  <View style={styles.taskRow}>
                    <Ionicons
                      name="ellipse"
                      size={10}
                      color={getPriorityColor(item.priority)}
                      style={{ marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.taskText, { color: Colors[theme].text }]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.taskDate,
                          { color: isDark ? "#aaa" : "#666" },
                        ]}
                      >
                        {lastUpdated}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          ) : (
            <Text
              style={[
                styles.noTasks,
                { color: isDark ? "#aaa" : "#555", marginTop: 10 },
              ]}
            >
              No tasks yet. Add one to get started!
            </Text>
          )}

          <Link href="/tasks" asChild>
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: "#4a90e2" }]}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* CTA Button */}
        <Link href="/tasks" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Go to My Tasks</Text>
          </TouchableOpacity>
        </Link>

        {/* Quote */}
        <Text style={[styles.quote, { color: isDark ? "#aaa" : "#777" }]}>
          “Success is the sum of small efforts, repeated day in and day out.”
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 30,
    letterSpacing: 0.6,
  },
  greeting: { fontSize: 26, fontWeight: "700", marginBottom: 6 },
  subText: { fontSize: 16, marginBottom: 20 },
  icon: { marginVertical: 20 },
  button: {
    backgroundColor: "#4a90e2",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  quote: {
    marginTop: 40,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Card Styles
  card: {
    width: "90%",
    borderRadius: 12,
    padding: 16,
    // marginTo: 20,
    marginBottom: 20,

    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  taskText: { fontSize: 15, fontWeight: "500" },
  taskDate: { fontSize: 11 },
  noTasks: { textAlign: "center", fontSize: 14 },
  viewAllButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  viewAllText: { color: "#fff", fontWeight: "600" },
});
