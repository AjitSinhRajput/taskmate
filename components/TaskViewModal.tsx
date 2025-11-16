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

import { Task } from "../types/type";

interface TaskViewModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void; // Still required by props but NOT used
  task: Task | null;
}

export default function TaskViewModal({
  visible,
  onClose,
  onComplete, // Not used anymore
  task,
}: TaskViewModalProps) {
  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  if (!task) return null;

  const textColor = Colors[theme].text;
  const subTextColor = Colors[theme].tabIconDefault;
  const cardColor = isDark ? "#1f1f1f" : "#ffffff";
  const dividerColor = isDark ? "#333" : "#e0e0e0";

  const createdDate = new Date(task.createdAt);
  const modifiedDate = new Date(task.modifiedAt);
  const dueDate = new Date(task.dueDate);

  const isModified = task.modifiedAt !== task.createdAt;
  const isOverdue = dueDate < new Date();
  const completed = task.completed ?? false;

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
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
            {/* STATUS */}
            <Text style={[styles.label, { color: subTextColor }]}>Status</Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: completed
                    ? Colors.common.success
                    : Colors.common.warning,
                },
              ]}
            >
              <Text style={styles.badgeText}>
                {completed ? "Completed" : "Not Completed"}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* TITLE */}
            <Text style={[styles.label, { color: subTextColor }]}>Title</Text>
            <Text
              style={[
                styles.value,
                {
                  color: textColor,
                  textDecorationLine: completed ? "line-through" : "none",
                },
              ]}
            >
              {task.title}
            </Text>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* DESCRIPTION */}
            <Text style={[styles.label, { color: subTextColor }]}>
              Description
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color: textColor,
                  fontStyle: task.description ? "normal" : "italic",
                },
              ]}
            >
              {task.description || "No description"}
            </Text>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* PRIORITY */}
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

            {/* CATEGORY */}
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

            {/* DUE DATE */}
            <Text style={[styles.label, { color: subTextColor }]}>
              Due Date
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color: completed
                    ? Colors.common.success
                    : isOverdue
                    ? Colors.common.error
                    : textColor,
                  fontWeight: completed || isOverdue ? "700" : "500",
                },
              ]}
            >
              {completed ? "Completed" : dueDate.toLocaleString()}
            </Text>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* CREATED */}
            <Text style={[styles.label, { color: subTextColor }]}>Created</Text>
            <Text style={[styles.metaValue, { color: subTextColor }]}>
              {createdDate.toLocaleString()}
            </Text>

            {/* MODIFIED */}
            <Text style={[styles.label, { color: subTextColor, marginTop: 8 }]}>
              Last Modified
            </Text>
            <Text style={[styles.metaValue, { color: subTextColor }]}>
              {isModified ? modifiedDate.toLocaleString() : "Not modified"}
            </Text>

            {/* COMPLETED AT */}
            {completed && (
              <>
                <Text
                  style={[styles.label, { color: subTextColor, marginTop: 8 }]}
                >
                  Completed At
                </Text>
                <Text style={[styles.metaValue, { color: subTextColor }]}>
                  {task.completedAt
                    ? new Date(task.completedAt).toLocaleString()
                    : "—"}
                </Text>
              </>
            )}
          </ScrollView>

          {/* ONLY CLOSE BUTTON */}
          <TouchableOpacity
            style={[
              styles.bottomButton,
              { backgroundColor: Colors[theme].tint, marginTop: 8 },
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
    elevation: 6,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  label: { fontSize: 13, fontWeight: "600", marginTop: 10 },
  value: { fontSize: 15, fontWeight: "500", marginTop: 2 },
  metaValue: { fontSize: 12, marginTop: 2, fontWeight: "500" },
  divider: { height: 1, marginVertical: 8 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  bottomButton: {
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },
});