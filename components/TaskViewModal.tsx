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
  const subTextColor = isDark ? "#aaa" : "#555";
  const cardColor = isDark ? "#1f1f1f" : "#ffffff";
  const dividerColor = isDark ? "#333" : "#e0e0e0";

  const createdDate = new Date(task.createdAt);
  const modifiedDate = new Date(task.modifiedAt);
  const isModified = task.modifiedAt !== task.createdAt;

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
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>

          <Text style={[styles.heading, { color: textColor }]}>
            Task Details
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {/* Title */}
            <Text style={[styles.label, { color: subTextColor }]}>Title</Text>
            <Text style={[styles.value, { color: textColor }]}>
              {task.title}
            </Text>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: dividerColor,
                marginVertical: 8,
              }}
            />

            {/* Description */}
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

            <View
              style={{
                height: 1,
                backgroundColor: dividerColor,
                marginVertical: 8,
              }}
            />

            {/* Priority */}
            <Text style={[styles.label, { color: subTextColor }]}>
              Priority
            </Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            >
              <Text
                style={[styles.priorityText, { color: Colors.dark.background }]}
              >
                {task.priority}
              </Text>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: dividerColor,
                marginVertical: 8,
              }}
            />

            {/* Due Date */}
            <Text style={[styles.label, { color: subTextColor }]}>
              Due Date
            </Text>
            <Text style={[styles.value, { color: textColor }]}>
              {new Date(task.dueDate).toLocaleString()}
            </Text>

            {/* Created / Modified */}
            <View
              style={{
                height: 1,
                backgroundColor: dividerColor,
                marginVertical: 8,
              }}
            />

            <Text style={[styles.label, { color: subTextColor }]}>
              Created On
            </Text>
            <Text style={[styles.value, { color: textColor }]}>
              {createdDate.toLocaleString()}
            </Text>

            <Text style={[styles.label, { color: subTextColor }]}>
              Last Modified
            </Text>
            <Text style={[styles.value, { color: textColor }]}>
              {isModified ? modifiedDate.toLocaleString() : "Not modified"}
            </Text>
          </ScrollView>

          {/* Close Button */}
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
    marginTop: 6,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
    fontWeight: "500",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  priorityText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bottomButton: {
    alignSelf: "center",
    marginTop: 14,
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
