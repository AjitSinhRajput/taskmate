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
    dueDate: Date,
    category: "Work" | "Personal" | "School" | "Other"
  ) => void;
  taskToEdit?: {
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low";
    dueDate?: string;
    category: "Work" | "Personal" | "School" | "Other";
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
  const [category, setCategory] = useState<
    "Work" | "Personal" | "School" | "Other" | ""
  >("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState({
    title: "",
    priority: "",
    dueDate: "",
    category: "",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (taskToEdit && visible) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setPriority(taskToEdit.priority || "");
      setCategory(taskToEdit.category || "");
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null);
      if (taskToEdit.dueDate) {
        const d = new Date(taskToEdit.dueDate);
        setTempHours(d.getHours().toString().padStart(2, "0"));
        setTempMinutes(d.getMinutes().toString().padStart(2, "0"));
      }
    } else if (!visible) {
      setTitle("");
      setDescription("");
      setPriority("");
      setCategory("");
      setDueDate(null);
      setError({ title: "", priority: "", dueDate: "", category: "" });
      setSuccess(false);
    }
  }, [taskToEdit, visible]);

  const handleSave = () => {
    const cleanedTitle = title.trim();
    const cleanedDescription = description.trim();
    const newErrors = { title: "", priority: "", dueDate: "", category: "" };
    let valid = true;

    if (!cleanedTitle) {
      newErrors.title = "Title is required!";
      valid = false;
    }
    if (!priority) {
      newErrors.priority = "Select a priority!";
      valid = false;
    }
    if (!category) {
      newErrors.category = "Select a category!";
      valid = false;
    }
    if (!dueDate) {
      newErrors.dueDate = "Due date is required!";
      valid = false;
    }

    setError(newErrors);
    if (!valid) return;

    onSave(
      cleanedTitle,
      cleanedDescription,
      priority as any,
      dueDate!,
      category as any
    );
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  // Helpers
  const dimColor = (hex: string, factor = 0.5) => {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = Math.floor(((bigint >> 16) & 255) * factor);
    const g = Math.floor(((bigint >> 8) & 255) * factor);
    const b = Math.floor((bigint & 255) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const priorityColors = {
    High: "#e74c3c",
    Medium: "#f1c40f",
    Low: "#2ecc71",
  };
  const categoryColors = {
    Work: "#3498db",
    Personal: "#9b59b6",
    School: "#e67e22",
    Other: "#16a085",
  };

  const getPriorityColor = (p: string, selected: boolean) => {
    const base = priorityColors[p as keyof typeof priorityColors];
    return selected ? base : dimColor(base, isDark ? 0.3 : 0.75);
  };
  const getCategoryColor = (c: string, selected: boolean) => {
    const base = categoryColors[c as keyof typeof categoryColors];
    return selected ? base : dimColor(base, isDark ? 0.3 : 0.75);
  };

  const priorityIcons = {
    High: "flame-outline",
    Medium: "warning-outline",
    Low: "leaf-outline",
  };
  const categoryIcons = {
    Work: "briefcase-outline",
    Personal: "person-circle-outline",
    School: "school-outline",
    Other: "grid-outline",
  };

  const backgroundColor = Colors[theme].background;
  const textColor = Colors[theme].text;
  const borderColor = Colors[theme].icon;
  const placeholderColor = Colors[theme].icon;
  const subTextColor = Colors[theme].tabIconDefault;
  const isEditing = !!taskToEdit;

  const TITLE_LIMIT = 40;
  const DESC_LIMIT = 200;
  const [tempHours, setTempHours] = useState("");
  const [tempMinutes, setTempMinutes] = useState("");

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
            <View style={[styles.modalContent, { backgroundColor }]}>
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
                  <Text style={[styles.modalHeading, { color: textColor }]}>
                    {isEditing ? "Edit Task" : "Add Task"}
                  </Text>

                  {/* Title */}
                  <Text style={{ fontSize: 12, color: subTextColor }}>
                    Title <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="Title"
                    value={title}
                    onChangeText={(text) =>
                      setTitle(text.slice(0, TITLE_LIMIT))
                    }
                    style={[
                      styles.input,
                      {
                        borderColor: error.title ? "red" : borderColor,
                        color: textColor,
                      },
                    ]}
                    placeholderTextColor={placeholderColor}
                    maxLength={TITLE_LIMIT}
                  />
                  <Text style={styles.charCount}>
                    {title.length}/{TITLE_LIMIT}
                  </Text>
                  {error.title && (
                    <Text style={styles.errorText}>{error.title}</Text>
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
                        setDescription(text.slice(0, DESC_LIMIT))
                      }
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={[
                        styles.input,
                        { height: 80, borderColor, color: textColor },
                      ]}
                      placeholderTextColor={placeholderColor}
                      maxLength={DESC_LIMIT}
                    />
                    <Text style={styles.charCount}>
                      {description.length}/{DESC_LIMIT}
                    </Text>
                  </View>

                  {/* Priority */}
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.sectionLabel}>
                      Priority <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <View style={styles.priorityRow}>
                      {(["High", "Medium", "Low"] as const).map((p) => (
                        <TouchableOpacity
                          key={p}
                          style={[
                            styles.priorityBtn,
                            {
                              backgroundColor: getPriorityColor(
                                p,
                                priority === p
                              ),
                            },
                          ]}
                          onPress={() => setPriority(p)}
                        >
                          <Ionicons
                            name={priorityIcons[p] as any}
                            size={16}
                            color="#fff"
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: priority === p ? "700" : "500",
                            }}
                          >
                            {p}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {error.priority && (
                      <Text style={styles.errorText}>{error.priority}</Text>
                    )}
                  </View>

                  {/* Category */}
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.sectionLabel}>
                      Category <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <View style={styles.categoryRow}>
                      {(["Work", "Personal", "School", "Other"] as const).map(
                        (c) => (
                          <TouchableOpacity
                            key={c}
                            style={[
                              styles.categoryBtn,
                              {
                                backgroundColor: getCategoryColor(
                                  c,
                                  category === c
                                ),
                              },
                            ]}
                            onPress={() => setCategory(c)}
                          >
                            <Ionicons
                              name={categoryIcons[c] as any}
                              size={16}
                              color="#fff"
                              style={{ marginRight: 6 }}
                            />
                            <Text
                              style={{
                                color: "#fff",
                                fontWeight: category === c ? "700" : "500",
                              }}
                            >
                              {c}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                    {error.category && (
                      <Text style={styles.errorText}>{error.category}</Text>
                    )}
                  </View>

                  {/* Due Date */}
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.sectionLabel}>
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
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={subTextColor}
                        style={{ position: "absolute", right: 12 }}
                      />
                      <Text style={{ color: textColor }}>
                        {dueDate
                          ? dueDate.toLocaleString()
                          : "Select due date and time"}
                      </Text>
                    </TouchableOpacity>

                    {/* Centered Calendar */}
                    {showPicker && (
                      <Modal transparent animationType="fade">
                        <TouchableWithoutFeedback
                          onPress={() => setShowPicker(false)}
                        >
                          <View style={styles.overlay}>
                            <TouchableWithoutFeedback>
                              <View
                                style={[
                                  styles.centeredPickerBox,
                                  { backgroundColor },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.modalHeading,
                                    { color: textColor, marginBottom: 8 },
                                  ]}
                                >
                                  Select Date & Time
                                </Text>

                                {/* 📅 Calendar */}
                                <DateTimePicker
                                  value={dueDate || new Date()}
                                  mode="date"
                                  display={
                                    Platform.OS === "ios" ? "inline" : "spinner"
                                  }
                                  minimumDate={new Date()}
                                  onChange={(_, selectedDate) => {
                                    if (selectedDate) {
                                      setDueDate(selectedDate);
                                      // Update local time fields too
                                      setTempHours(
                                        selectedDate
                                          .getHours()
                                          .toString()
                                          .padStart(2, "0")
                                      );
                                      setTempMinutes(
                                        selectedDate
                                          .getMinutes()
                                          .toString()
                                          .padStart(2, "0")
                                      );
                                    }
                                  }}
                                />

                                {/* 🕓 Time Input */}
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 12,
                                    gap: 8,
                                  }}
                                >
                                  <TextInput
                                    keyboardType="numeric"
                                    placeholder="HH"
                                    placeholderTextColor={subTextColor}
                                    maxLength={2}
                                    style={[
                                      styles.timeInput,
                                      {
                                        color: textColor,
                                        borderColor: Colors[theme].icon,
                                      },
                                    ]}
                                    value={tempHours}
                                    onChangeText={(text) => {
                                      const clean = text.replace(/[^0-9]/g, "");
                                      if (
                                        clean === "" ||
                                        (parseInt(clean) >= 0 &&
                                          parseInt(clean) <= 23)
                                      ) {
                                        setTempHours(clean);
                                      }
                                    }}
                                  />

                                  <Text
                                    style={{ color: textColor, fontSize: 16 }}
                                  >
                                    :
                                  </Text>

                                  <TextInput
                                    keyboardType="numeric"
                                    placeholder="MM"
                                    placeholderTextColor={subTextColor}
                                    maxLength={2}
                                    style={[
                                      styles.timeInput,
                                      {
                                        color: textColor,
                                        borderColor: Colors[theme].icon,
                                      },
                                    ]}
                                    value={tempMinutes}
                                    onChangeText={(text) => {
                                      const clean = text.replace(/[^0-9]/g, "");
                                      if (
                                        clean === "" ||
                                        (parseInt(clean) >= 0 &&
                                          parseInt(clean) <= 59)
                                      ) {
                                        setTempMinutes(clean);
                                      }
                                    }}
                                  />
                                </View>

                                {/* ✅ Done button applies time */}
                                <TouchableOpacity
                                  style={{
                                    marginTop: 14,
                                    backgroundColor: Colors[theme].tint,
                                    borderRadius: 8,
                                    paddingVertical: 8,
                                    paddingHorizontal: 20,
                                  }}
                                  onPress={() => {
                                    if (dueDate) {
                                      const newDate = new Date(dueDate);
                                      newDate.setHours(
                                        parseInt(tempHours || "0")
                                      );
                                      newDate.setMinutes(
                                        parseInt(tempMinutes || "0")
                                      );
                                      setDueDate(newDate);
                                    }
                                    setShowPicker(false);
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: Colors[theme].background,
                                      fontWeight: "600",
                                    }}
                                  >
                                    Done
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </TouchableWithoutFeedback>
                          </View>
                        </TouchableWithoutFeedback>
                      </Modal>
                    )}

                    {error.dueDate && (
                      <Text style={styles.errorText}>{error.dueDate}</Text>
                    )}
                  </View>

                  {/* Buttons */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          backgroundColor: Colors[theme].background,
                          borderWidth: 1,
                          borderColor: Colors[theme].tint,
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
                        { backgroundColor: Colors[theme].tint },
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
    borderWidth: 1,
    borderColor: "rgba(150,150,150,0.3)",
    width: "90%",
    padding: 20,
    borderRadius: 12,
    position: "relative",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredPickerBox: {
    width: "85%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(200,200,200,0.3)",
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 6,
    width: 50,
    textAlign: "center",
    fontSize: 16,
    paddingVertical: 6,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    marginBottom: 6,
  },
  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginVertical: 4,
    gap: 8,
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6.7,
    paddingVertical: 10,
    borderRadius: 8,
    flexShrink: 0,
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
  charCount: {
    fontSize: 11,
    textAlign: "right",
    color: "#999",
    marginTop: -4,
  },
  errorText: {
    fontSize: 12,
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