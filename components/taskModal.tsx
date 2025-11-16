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

  // ------------------------------
  // STATES
  // ------------------------------
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

  // ------------------------------
  // PREFILL EDIT DATA
  // ------------------------------
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
    } else if (!visible) {
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

  // ------------------------------
  // SAVE HANDLER
  // ------------------------------
  const handleSave = () => {
    const newErr = { title: "", priority: "", dueDate: "", category: "" };
    let ok = true;

    if (!title.trim()) {
      newErr.title = "Title is required";
      ok = false;
    }
    if (!priority) {
      newErr.priority = "Priority is required";
      ok = false;
    }
    if (!category) {
      newErr.category = "Category is required";
      ok = false;
    }
    if (!dueDate) {
      newErr.dueDate = "Due date is required";
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
    }, 900);
  };

  // ------------------------------
  // COLOR HELPERS
  // ------------------------------
  const textColor = Colors[theme].text;
  const borderColor = Colors[theme].icon;
  const placeholderColor = Colors[theme].icon;
  const subTextColor = Colors[theme].tabIconDefault;

  const tint = Colors[theme].tint;

  const adjust = (hex: string, f = 0.5) => {
    const v = parseInt(hex.replace("#", ""), 16);
    return `rgb(${((v >> 16) & 255) * f}, ${((v >> 8) & 255) * f}, ${
      (v & 255) * f
    })`;
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

  const getPriorityColor = (p: string, active: boolean) =>
    active
      ? priorityColors[p as keyof typeof priorityColors]
      : adjust(priorityColors[p as keyof typeof priorityColors], 0.4);

  const getCategoryColor = (c: string, active: boolean) =>
    active
      ? categoryColors[c as keyof typeof categoryColors]
      : adjust(categoryColors[c as keyof typeof categoryColors], 0.4);

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback
        onPress={() => {
          if (success) onClose();
          else Keyboard.dismiss();
        }}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ width: "100%", alignItems: "center" }}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: Colors[theme].background },
              ]}
            >
              {/* CLOSE */}
              {!success && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              )}

              {/* TITLE */}
              <Text style={[styles.modalHeading, { color: textColor }]}>
                {isEditing ? "Edit Task" : "Add Task"}
              </Text>

              {/* SUCCESS SCREEN */}
              {success ? (
                <View style={styles.successWrapper}>
                  <Ionicons
                    name="checkmark-circle"
                    size={85}
                    color={Colors.common.success}
                  />
                  <Text
                    style={{ color: textColor, fontSize: 18, marginTop: 10 }}
                  >
                    {isEditing ? "Task updated!" : "Task added!"}
                  </Text>
                </View>
              ) : (
                <>
                  {/* TITLE FIELD */}
                  <Text style={styles.label}>
                    Title <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TextInput
                    value={title}
                    onChangeText={(t) => setTitle(t.slice(0, TITLE_LIMIT))}
                    placeholder="Task title"
                    placeholderTextColor={placeholderColor}
                    style={[
                      styles.input,
                      {
                        borderColor: error.title ? "red" : borderColor,
                        color: textColor,
                      },
                    ]}
                  />
                  {error.title && (
                    <Text style={styles.errorText}>{error.title}</Text>
                  )}

                  {/* DESCRIPTION */}
                  <Text style={[styles.label, { marginTop: 12 }]}>
                    Description (optional)
                  </Text>
                  <TextInput
                    value={description}
                    multiline
                    numberOfLines={3}
                    onChangeText={(t) => setDescription(t.slice(0, DESC_LIMIT))}
                    placeholder="Add details..."
                    placeholderTextColor={placeholderColor}
                    style={[
                      styles.input,
                      { height: 80, borderColor, color: textColor },
                    ]}
                  />

                  {/* PRIORITY */}
                  <Text style={[styles.label, { marginTop: 12 }]}>
                    Priority *
                  </Text>
                  <View style={styles.row3}>
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
                        <Text style={styles.btnText}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {error.priority && (
                    <Text style={styles.errorText}>{error.priority}</Text>
                  )}

                  {/* CATEGORY (FULL ROW GRID) */}
                  <Text style={[styles.label, { marginTop: 12 }]}>
                    Category *
                  </Text>
                  <View style={styles.row4}>
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
                          <Text style={styles.btnText}>{c}</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                  {error.category && (
                    <Text style={styles.errorText}>{error.category}</Text>
                  )}

                  {/* DUE DATE */}
                  <Text style={[styles.label, { marginTop: 12 }]}>
                    Due Date *
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    style={[
                      styles.input,
                      styles.dateInput,
                      {
                        borderColor: error.dueDate ? "red" : borderColor,
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
                      color={subTextColor}
                      style={{ marginLeft: "auto", alignSelf: "center" }}
                    />
                  </TouchableOpacity>

                  {error.dueDate && (
                    <Text style={styles.errorText}>{error.dueDate}</Text>
                  )}

                  {/* PICKER MODAL */}
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
                                { backgroundColor: Colors[theme].background },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.modalHeading,
                                  { color: textColor },
                                ]}
                              >
                                Select Date & Time
                              </Text>

                              <DateTimePicker
                                value={dueDate || new Date()}
                                mode="date"
                                display={
                                  Platform.OS === "ios" ? "inline" : "spinner"
                                }
                                minimumDate={new Date()}
                                onChange={(_, d) => {
                                  if (d) {
                                    setDueDate(d);
                                    setTempHours(
                                      d.getHours().toString().padStart(2, "0")
                                    );
                                    setTempMinutes(
                                      d.getMinutes().toString().padStart(2, "0")
                                    );
                                  }
                                }}
                              />

                              {/* TIME */}
                              <View style={styles.timeRow}>
                                <TextInput
                                  placeholder="HH"
                                  keyboardType="numeric"
                                  placeholderTextColor={subTextColor}
                                  style={[
                                    styles.timeInput,
                                    { color: textColor },
                                  ]}
                                  maxLength={2}
                                  value={tempHours}
                                  onChangeText={(t) => {
                                    const c = t.replace(/[^0-9]/g, "");
                                    if (c === "" || (+c >= 0 && +c <= 23))
                                      setTempHours(c);
                                  }}
                                />

                                <Text style={{ color: textColor }}>:</Text>

                                <TextInput
                                  placeholder="MM"
                                  keyboardType="numeric"
                                  placeholderTextColor={subTextColor}
                                  style={[
                                    styles.timeInput,
                                    { color: textColor },
                                  ]}
                                  maxLength={2}
                                  value={tempMinutes}
                                  onChangeText={(t) => {
                                    const c = t.replace(/[^0-9]/g, "");
                                    if (c === "" || (+c >= 0 && +c <= 59))
                                      setTempMinutes(c);
                                  }}
                                />
                              </View>

                              {/* DONE */}
                              <TouchableOpacity
                                style={[
                                  styles.doneButton,
                                  { backgroundColor: tint },
                                ]}
                                onPress={() => {
                                  if (dueDate) {
                                    const d = new Date(dueDate);
                                    d.setHours(parseInt(tempHours || "0"));
                                    d.setMinutes(parseInt(tempMinutes || "0"));
                                    setDueDate(d);
                                  }
                                  setShowPicker(false);
                                }}
                              >
                                <Text style={styles.doneText}>Done</Text>
                              </TouchableOpacity>
                            </View>
                          </TouchableWithoutFeedback>
                        </View>
                      </TouchableWithoutFeedback>
                    </Modal>
                  )}

                  {/* COMPLETED SWITCH (EDIT ONLY) */}
                  {isEditing && (
                    <View style={styles.footerRow}>
                      <View style={styles.switchContainer}>
                        <Text style={{ color: textColor, fontWeight: "600" }}>
                          Completed
                        </Text>
                        <Switch
                          value={completed}
                          onValueChange={setCompleted}
                          ios_backgroundColor={isDark ? "#555" : "#ccc"}
                          trackColor={{
                            false: "#aaa",
                            true: Colors.common.success,
                          }}
                          thumbColor={completed ? "#fff" : "#000"}
                        />
                      </View>

                      <View style={styles.footerButtons}>
                        <TouchableOpacity
                          style={[
                            styles.button,
                            { borderColor: tint, borderWidth: 1 },
                          ]}
                          onPress={onClose}
                        >
                          <Text style={{ color: textColor }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.button, { backgroundColor: tint }]}
                          onPress={handleSave}
                        >
                          <Text style={{ color: Colors[theme].background }}>
                            Update
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* ADD MODE BUTTONS */}
                  {!isEditing && (
                    <View style={styles.footerButtonsAdd}>
                      <TouchableOpacity
                        style={[
                          styles.button,
                          { borderColor: tint, borderWidth: 1 },
                        ]}
                        onPress={onClose}
                      >
                        <Text style={{ color: textColor }}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: tint }]}
                        onPress={handleSave}
                      >
                        <Text style={{ color: Colors[theme].background }}>
                          Save
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(150,150,150,0.3)",
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 10,
  },
  modalHeading: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  /* Inputs */
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    marginTop: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },

  dateInput: {
    flexDirection: "row",
    alignItems: "center",
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },

  /* Buttons */
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    alignItems: "center",
  },

  footerButtons: {
    flexDirection: "row",
    gap: 10,
  },

  footerButtonsAdd: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },

  /* Priority buttons */
  row3: {
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

  /* Category grid 4 per row */
  row4: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  categoryBtn: {
    width: "23%",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },

  /* Picker modal */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredPickerBox: {
    width: "86%",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(200,200,200,0.3)",
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },

  timeInput: {
    borderWidth: 1,
    width: 55,
    textAlign: "center",
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 16,
  },

  doneButton: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },

  doneText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },

  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  successWrapper: {
    alignItems: "center",
    paddingVertical: 40,
  },
});