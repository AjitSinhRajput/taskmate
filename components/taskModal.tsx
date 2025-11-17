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
  Switch,
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
    category: "Work" | "Personal" | "School" | "Other",
    completed: boolean
  ) => void;
  taskToEdit?: {
    title: string;
    description: string;
    priority: "High" | "Medium" | "Low";
    dueDate?: string;
    category: "Work" | "Personal" | "School" | "Other";
    completed: boolean;
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

  /* ------------------------- STATE ------------------------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState<"High" | "Medium" | "Low" | "">("");
  const [category, setCategory] = useState<
    "Work" | "Personal" | "School" | "Other" | ""
  >("");

  const [completed, setCompleted] = useState(false);

  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [success, setSuccess] = useState(false);

  const [tempHours, setTempHours] = useState("");
  const [tempMinutes, setTempMinutes] = useState("");

  const [error, setError] = useState({
    title: "",
    priority: "",
    dueDate: "",
    category: "",
  });

  const TITLE_LIMIT = 40;
  const DESC_LIMIT = 200;
  const isEditing = !!taskToEdit;

  /* ------------------------- THEME COLORS ------------------------- */
  const textColor = Colors[theme].text;
  const bgColor = Colors[theme].background;
  const tint = Colors[theme].tint;
  const borderColor = Colors[theme].icon;
  const placeholderColor = Colors[theme].icon;

  const surface = isDark ? "#1e1f20" : "#ffffff";

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

  const dim = (hex: string) => hex + "55";

  /* ------------------------- PREFILL EDIT ------------------------- */
  useEffect(() => {
    if (taskToEdit && visible) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setCompleted(taskToEdit.completed);

      if (taskToEdit.dueDate) {
        const d = new Date(taskToEdit.dueDate);
        setDueDate(d);
        setTempHours(d.getHours().toString().padStart(2, "0"));
        setTempMinutes(d.getMinutes().toString().padStart(2, "0"));
      }
    }

    if (!visible) {
      setTitle("");
      setDescription("");
      setPriority("");
      setCategory("");
      setCompleted(false);
      setDueDate(null);
      setTempHours("");
      setTempMinutes("");
      setError({ title: "", priority: "", dueDate: "", category: "" });
      setSuccess(false);
    }
  }, [taskToEdit, visible]);

  /* ------------------------- SAVE ------------------------- */
  const handleSave = () => {
    const newErr = { title: "", priority: "", dueDate: "", category: "" };
    let ok = true;

    if (!title.trim()) {
      newErr.title = "Title is required";
      ok = false;
    }
    if (!priority) {
      newErr.priority = "Priority required";
      ok = false;
    }
    if (!category) {
      newErr.category = "Category required";
      ok = false;
    }
    if (!dueDate) {
      newErr.dueDate = "Due date required";
      ok = false;
    }

    setError(newErr);
    if (!ok) return;

    onSave(
      title.trim(),
      description.trim(),
      priority as any,
      dueDate!,
      category as any,
      completed
    );

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 800);
  };

  /* ------------------------- UI ------------------------- */
  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ width: "100%", alignItems: "center" }}
          >
            <View style={[styles.modalBox, { backgroundColor: surface }]}>
              {/* CLOSE */}
              {!success && (
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              )}

              {/* HEADER */}
              <Text style={[styles.heading, { color: textColor }]}>
                {isEditing ? "Edit Task" : "Add Task"}
              </Text>

              {/* SUCCESS */}
              {success ? (
                <View style={styles.successWrap}>
                  <Ionicons
                    name="checkmark-circle"
                    size={90}
                    color={Colors.common.success}
                  />
                  <Text style={{ color: textColor, marginTop: 10 }}>
                    {isEditing ? "Task updated!" : "Task added!"}
                  </Text>
                </View>
              ) : (
                <>
                  {/* TITLE */}
                  <Text style={[styles.label, { color: textColor }]}>
                    Title *
                  </Text>
                  <TextInput
                    value={title}
                    onChangeText={(t) => setTitle(t.slice(0, TITLE_LIMIT))}
                    placeholder="Task title"
                    placeholderTextColor={placeholderColor}
                    style={[
                      styles.input,
                      {
                        borderColor: error.title
                          ? Colors.common.error
                          : borderColor,
                        color: textColor,
                      },
                    ]}
                  />

                  {/* DESCRIPTION */}
                  <Text style={[styles.label, { color: textColor }]}>
                    Description
                  </Text>
                  <TextInput
                    multiline
                    value={description}
                    onChangeText={(t) => setDescription(t.slice(0, DESC_LIMIT))}
                    placeholder="Optional details..."
                    placeholderTextColor={placeholderColor}
                    style={[
                      styles.input,
                      { height: 80, color: textColor, borderColor },
                    ]}
                  />

                  {/* PRIORITY */}
                  <Text style={[styles.label, { color: textColor }]}>
                    Priority *
                  </Text>
                  <View style={styles.priorityRow}>
                    {(["High", "Medium", "Low"] as const).map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setPriority(p)}
                        style={[
                          styles.priorityBtn,
                          {
                            backgroundColor:
                              priority === p
                                ? priorityColors[p]
                                : dim(priorityColors[p]),
                          },
                        ]}
                      >
                        <Text style={styles.priorityText}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* CATEGORY */}
                  <Text style={[styles.label, { color: textColor }]}>
                    Category *
                  </Text>
                  <View style={styles.categoryRow}>
                    {(["Work", "Personal", "School", "Other"] as const).map(
                      (c) => (
                        <TouchableOpacity
                          key={c}
                          onPress={() => setCategory(c)}
                          style={[
                            styles.categoryBtn,
                            {
                              backgroundColor:
                                category === c
                                  ? categoryColors[c]
                                  : dim(categoryColors[c]),
                            },
                          ]}
                        >
                          <Text style={styles.priorityText}>{c}</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  {/* DUE DATE */}
                  <Text style={[styles.label, { color: textColor }]}>
                    Due Date *
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    style={[
                      styles.input,
                      styles.dateBtn,
                      {
                        borderColor: error.dueDate
                          ? Colors.common.error
                          : borderColor,
                      },
                    ]}
                  >
                    <Text style={{ color: textColor }}>
                      {dueDate
                        ? dueDate.toLocaleString()
                        : "Select date & time"}
                    </Text>

                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={placeholderColor}
                    />
                  </TouchableOpacity>

                  {/* DATE PICKER MODAL */}
                  {showPicker && (
                    <Modal transparent>
                      <TouchableWithoutFeedback
                        onPress={() => setShowPicker(false)}
                      >
                        <View style={styles.pickerOverlay}>
                          <TouchableWithoutFeedback>
                            <View
                              style={[
                                styles.pickerContainer,
                                { backgroundColor: surface },
                              ]}
                            >
                              <Text
                                style={[styles.heading, { color: textColor }]}
                              >
                                Select Date
                              </Text>

                              <DateTimePicker
                                value={dueDate || new Date()}
                                mode="date"
                                minimumDate={new Date()}
                                display={
                                  Platform.OS === "ios" ? "inline" : "spinner"
                                }
                                onChange={(_, d) => {
                                  if (d) setDueDate(d);
                                }}
                              />

                              <TouchableOpacity
                                onPress={() => setShowPicker(false)}
                                style={[
                                  styles.doneButton,
                                  { backgroundColor: tint },
                                ]}
                              >
                                <Text style={styles.doneText}>Done</Text>
                              </TouchableOpacity>
                            </View>
                          </TouchableWithoutFeedback>
                        </View>
                      </TouchableWithoutFeedback>
                    </Modal>
                  )}

                  {/* COMPLETED TOGGLE (EDIT MODE ONLY) */}
                  {isEditing && (
                    <View style={styles.switchRow}>
                      <Text style={{ color: textColor, fontWeight: "600" }}>
                        Mark as Completed
                      </Text>

                      <Switch
                        value={completed}
                        onValueChange={setCompleted}
                        thumbColor={completed ? "#fff" : "#000"}
                        trackColor={{
                          true: Colors.common.success,
                          false: placeholderColor,
                        }}
                      />
                    </View>
                  )}

                  {/* FOOTER BUTTONS */}
                  <View style={styles.footerButtons}>
                    <TouchableOpacity
                      onPress={onClose}
                      style={[
                        styles.button,
                        { borderColor: tint, borderWidth: 1 },
                      ]}
                    >
                      <Text style={{ color: textColor }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSave}
                      style={[styles.button, { backgroundColor: tint }]}
                    >
                      <Text style={{ color: bgColor }}>
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

/* ------------------------- STYLES ------------------------- */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
  },

  closeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },

  dateBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },

  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  priorityText: {
    color: "#fff",
    fontWeight: "700",
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  categoryBtn: {
    width: "23%",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  pickerContainer: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
  },

  doneButton: {
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },

  doneText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },

  switchRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  successWrap: {
    alignItems: "center",
    paddingVertical: 40,
  },
});