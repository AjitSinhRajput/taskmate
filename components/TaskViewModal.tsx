import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TaskViewModalProps {
  visible: boolean;
  onClose: () => void;
  task?: {
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low";
    category: "Work" | "Personal" | "School" | "Other";
    dueDate: string;
    createdAt: string;
    modifiedAt: string;
  } | null;
}

export default function TaskViewModal({
  visible,
  onClose,
  task,
}: TaskViewModalProps) {
  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  if (!task) return null;

  const bgColor = Colors[theme].background;
  const textColor = Colors[theme].text;
  const subTextColor = Colors[theme].tabIconDefault;
  const cardColor = isDark ? "#1f1f1f" : "#ffffff";
  const dividerColor = isDark ? "#333" : "#e0e0e0";

  const createdDate = new Date(task.createdAt);
  const modifiedDate = new Date(task.modifiedAt);
  const dueDate = new Date(task.dueDate);
  const isModified = task.modifiedAt !== task.createdAt;
  const isOverdue = dueDate < new Date();

  const getPriorityColor = (priority: string) => {
    const colors = {
      High: "#e74c3c",
      Medium: "#f1c40f",
      Low: "#2ecc71",
    };
    return colors[priority as keyof typeof colors] || Colors[theme].tint;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Work: "#3498db",
      Personal: "#9b59b6",
      School: "#e67e22",
      Other: "#16a085",
    };
    return colors[category as keyof typeof colors] || Colors[theme].tint;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: cardColor,
              shadowColor: isDark ? "#000" : "#999",
            },
          ]}
        >
          {/* ❌ Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>

          <Text style={[styles.heading, { color: textColor }]}>
            Task Details
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {/* 🏷️ Title */}
            <Text style={[styles.label, { color: subTextColor }]}>Title</Text>
            <Text style={[styles.value, { color: textColor }]}>
              {task.title}
            </Text>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* 📝 Description */}
            <Text style={[styles.label, { color: subTextColor }]}>
              Description
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color: textColor,
                  fontStyle: !task.description ? "italic" : "normal",
                },
              ]}
            >
              {task.description?.trim() || "No description added"}
            </Text>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* 🚦 Priority */}
            <Text style={[styles.label, { color: subTextColor }]}>
              Priority
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            >
              <Text style={styles.badgeText}>{task.priority}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* 🗂️ Category */}
            <Text style={[styles.label, { color: subTextColor }]}>
              Category
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: getCategoryColor(task.category) },
              ]}
            >
              <Text style={styles.badgeText}>{task.category}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* ⏰ Due Date */}
            <Text style={[styles.label, { color: subTextColor }]}>
              Due Date
            </Text>
            <View style={styles.row}>
              <Text
                style={[
                  styles.value,
                  {
                    color: isOverdue ? Colors.common.error : textColor,
                    fontWeight: isOverdue ? "700" : "500",
                  },
                ]}
              >
                {dueDate.toLocaleString()}
              </Text>
              {isOverdue && (
                <View style={styles.overdueBadge}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={Colors.common.error}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      color: Colors.common.error,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    Overdue
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* 🕒 Created & Modified */}
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={[styles.label, { color: subTextColor }]}>
                  Created On
                </Text>
                <Text
                  style={[styles.metaValue, { color: subTextColor }]}
                  numberOfLines={1}
                >
                  {createdDate.toLocaleString()}
                </Text>
              </View>

              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={[styles.label, { color: subTextColor }]}>
                  Last Modified
                </Text>
                <Text
                  style={[styles.metaValue, { color: subTextColor }]}
                  numberOfLines={1}
                >
                  {isModified ? modifiedDate.toLocaleString() : "Not modified"}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* ✅ Bottom Close Button */}
          <TouchableOpacity
            style={[
              styles.bottomButton,
              {
                backgroundColor: Colors[theme].tint,
                shadowColor: isDark ? "#000" : "#999",
              },
            ]}
            onPress={onClose}
          >
            <Text
              style={{
                color: Colors[theme].background,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxHeight: "85%",
    borderRadius: 16,
    padding: 22,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  badgeText: {
    color: Colors.dark.background,
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 6,
    gap: 10,
  },
  bottomButton: {
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 10,
    elevation: 4,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },
});
