import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    description: string,
    priority: "High" | "Medium" | "Low",
    dueDate: Date
  ) => void;
  taskToEdit?: {
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low";
    dueDate?: string;
  } | null;
}

export default function TaskModal({
  visible,
  onClose,
  onSave,
  taskToEdit,
}: TaskModalProps) {
  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low" | "">("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState({ title: "", priority: "", dueDate: "" });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (taskToEdit && visible) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority || "");
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null);
    } else if (!visible) {
      setTitle("");
      setDescription("");
      setPriority("");
      setDueDate(null);
      setError({ title: "", priority: "", dueDate: "" });
      setSuccess(false);
    }
  }, [taskToEdit, visible]);

  const handleSave = () => {
    const cleanedTitle = title.trim();
    const cleanedDescription = description.trim();

    const newErrors = { title: "", priority: "", dueDate: "" };
    let valid = true;

    if (!cleanedTitle) {
      newErrors.title = "Title is required!";
      valid = false;
    }
    if (!priority) {
      newErrors.priority = "Select a priority!";
      valid = false;
    }
    if (!dueDate) {
      newErrors.dueDate = "Due date is required!";
      valid = false;
    }

    setError(newErrors);
    if (!valid) return;

    onSave(cleanedTitle, cleanedDescription, priority as any, dueDate!);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  const getPriorityColor = (p: string, selected: boolean) => {
    const colors = {
      High: selected ? "#e74c3c" : isDark ? "#4a2a2a" : "#f8d7da",
      Medium: selected ? "#f1c40f" : isDark ? "#665c1a" : "#fff3cd",
      Low: selected ? "#2ecc71" : isDark ? "#1d442b" : "#d4edda",
    };
    return colors[p as keyof typeof colors];
  };

  const backgroundColor = Colors[theme].background;
  const textColor = Colors[theme].text;
  const borderColor = isDark ? "#333" : "#ccc";
  const placeholderColor = isDark ? "#aaa" : "#777";
  const subTextColor = isDark ? "#999" : "#555";

  const isEditing = !!taskToEdit;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          if (success) onClose();
          else Keyboard.dismiss();
        }}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%", alignItems: "center" }}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: backgroundColor },
              ]}
            >
              {!success && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              )}

              {success ? (
                <View style={styles.successWrapper}>
                  <Ionicons
                    name="checkmark-circle"
                    size={90}
                    color={Colors.common.success}
                    style={{ marginBottom: 12 }}
                  />
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 18,
                      fontWeight: "600",
                    }}
                  >
                    {isEditing
                      ? "Task updated successfully!"
                      : "Task added successfully!"}
                  </Text>
                </View>
              ) : (
                <>
                  <Text
                    style={[
                      styles.modalHeading,
                      { color: textColor, marginTop: 6 },
                    ]}
                  >
                    {isEditing ? "Edit Task" : "Add Task"}
                  </Text>

                  {/* Title */}
                  <Text style={{ fontSize: 12, color: subTextColor }}>
                    Title <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="Title"
                    value={title}
                    onChangeText={(text) => setTitle(text.slice(0, 50))}
                    style={[
                      styles.input,
                      {
                        borderColor: error.title ? "red" : borderColor,
                        color: textColor,
                      },
                    ]}
                    placeholderTextColor={placeholderColor}
                    maxLength={50}
                  />
                  {error.title ? (
                    <Text style={[styles.errorText, { color: "red" }]}>
                      {error.title}
                    </Text>
                  ) : (
                    <Text style={[styles.charCount, { color: subTextColor }]}>
                      {title.length}/50
                    </Text>
                  )}

                  {/* Description */}
                  <View style={{ marginTop: 8 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: subTextColor,
                        marginBottom: 4,
                      }}
                    >
                      Description (Optional)
                    </Text>
                    <TextInput
                      placeholder="Add a short description..."
                      value={description}
                      onChangeText={(text) =>
                        setDescription(text.slice(0, 200))
                      }
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={[
                        styles.input,
                        {
                          height: 80,
                          borderColor,
                          color: textColor,
                        },
                      ]}
                      placeholderTextColor={placeholderColor}
                      maxLength={200}
                    />
                    <Text style={[styles.charCount, { color: subTextColor }]}>
                      {description.length}/200
                    </Text>
                  </View>

                  {/* Priority */}
                  <View style={{ marginTop: 10 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: subTextColor,
                        marginBottom: 6,
                      }}
                    >
                      Priority <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <View style={styles.priorityRow}>
                      {["High", "Medium", "Low"].map((p) => (
                        <TouchableOpacity
                          key={p}
                          style={[
                            styles.priorityBtn,
                            {
                              backgroundColor: getPriorityColor(
                                p,
                                priority === p
                              ),
                              borderWidth: priority === p ? 0 : 1,
                              borderColor,
                            },
                          ]}
                          onPress={() => setPriority(p as any)}
                        >
                          <Text
                            style={{
                              color:
                                priority === p
                                  ? "#fff"
                                  : isDark
                                  ? "#eee"
                                  : "#111",
                              fontWeight: priority === p ? "600" : "400",
                            }}
                          >
                            {p}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {error.priority ? (
                      <Text style={[styles.errorText, { marginTop: 4 }]}>
                        {error.priority}
                      </Text>
                    ) : null}
                  </View>

                  {/* Due Date */}
                  <View style={{ marginTop: 10 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: subTextColor,
                        marginBottom: 6,
                      }}
                    >
                      Due Date <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        {
                          borderColor:
                            error.dueDate && !dueDate ? "red" : borderColor,
                          paddingVertical: 12,
                          justifyContent: "center",
                        },
                      ]}
                      onPress={() => setShowPicker(true)}
                    >
                      <Text style={{ color: textColor }}>
                        {dueDate
                          ? dueDate.toLocaleString()
                          : "Select due date and time"}
                      </Text>
                    </TouchableOpacity>
                    {showPicker && (
                      <DateTimePicker
                        value={dueDate || new Date()}
                        mode="datetime"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowPicker(false);
                          if (selectedDate) setDueDate(selectedDate);
                        }}
                      />
                    )}
                    {error.dueDate && !dueDate && (
                      <Text style={[styles.errorText, { marginTop: 4 }]}>
                        {error.dueDate}
                      </Text>
                    )}
                  </View>

                  {/* Buttons */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          backgroundColor: isDark ? Colors.dark.icon : "#ddd",
                        },
                      ]}
                      onPress={onClose}
                    >
                      <Text
                        style={{
                          color: Colors[theme].text,
                          fontWeight: "500",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          backgroundColor: Colors[theme].tint,
                        },
                      ]}
                      onPress={handleSave}
                    >
                      <Text
                        style={{
                          color: Colors[theme].background,
                          fontWeight: "500",
                        }}
                      >
                        {isEditing ? "Update" : "Save"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    position: "relative",
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  charCount: {
    fontSize: 11,
    textAlign: "right",
  },
  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  priorityBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: -2,
    marginBottom: 4,
    color: "red",
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 10,
  },
  successWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
