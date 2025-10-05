import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
    useColorScheme,
} from "react-native";

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    description: string,
    priority: "High" | "Medium" | "Low"
  ) => void;
}

export default function TaskModal({
  visible,
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low" | "">("");
  const [error, setError] = useState({ title: "", priority: "" });
  const [success, setSuccess] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setTitle("");
      setDescription("");
      setPriority("");
      setError({ title: "", priority: "" });
      setSuccess(false);
    }
  }, [visible]);

  const handleSave = () => {
    // Trim and clean up user input
    const cleanedTitle = title
      .replace(/^[\s\n]+|[\s\n]+$/g, "") // remove leading/trailing spaces/newlines
      .replace(/\s{2,}/g, " "); // collapse multiple spaces inside text

    const cleanedDescription = description
      .replace(/^[\s\n]+|[\s\n]+$/g, "") // remove leading/trailing newlines/spaces
      .replace(/\n{2,}/g, "\n"); // collapse multiple blank lines

    let valid = true;
    const newErrors = { title: "", priority: "" };

    if (!cleanedTitle) {
      newErrors.title = "Title is required!";
      valid = false;
    }
    if (!priority) {
      newErrors.priority = "Select a priority!";
      valid = false;
    }

    setError(newErrors);
    if (!valid) return;

    // Pass cleaned values to onSave
    onSave(
      cleanedTitle,
      cleanedDescription,
      priority as "High" | "Medium" | "Low"
    );

    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  const getPriorityColor = (p: string, selected: boolean) => {
    const colors = {
      High: selected ? "#e74c3c" : "#f8d7da",
      Medium: selected ? "#f1c40f" : "#fff3cd",
      Low: selected ? "#2ecc71" : "#d4edda",
    };
    return colors[p as keyof typeof colors];
  };

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
                { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
              ]}
            >
              {!success && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? "#fff" : "#000"}
                  />
                </TouchableOpacity>
              )}

              {success ? (
                <View style={styles.successWrapper}>
                  <Ionicons
                    name="checkmark-circle"
                    size={90}
                    color="green"
                    style={{ marginBottom: 12 }}
                  />
                  <Text
                    style={{
                      color: isDark ? "#fff" : "#000",
                      fontSize: 18,
                      fontWeight: "600",
                    }}
                  >
                    Task added successfully!
                  </Text>
                </View>
              ) : (
                <>
                  <Text
                    style={[
                      styles.modalHeading,
                      { color: isDark ? "#fff" : "#000" },
                    ]}
                  >
                    Add Task
                  </Text>

                  {/* Title */}
                  <TextInput
                    placeholder="Title"
                    value={title}
                    onChangeText={
                      (text) => setTitle(text.slice(0, 50)) // limit to 50 chars
                    }
                    style={[
                      styles.input,
                      {
                        borderColor: error.title
                          ? "red"
                          : isDark
                          ? "#444"
                          : "#ccc",
                        color: isDark ? "#fff" : "#000",
                      },
                    ]}
                    placeholderTextColor="#888"
                    maxLength={50}
                  />
                  {error.title ? (
                    <Text style={styles.errorText}>{error.title}</Text>
                  ) : (
                    <Text style={styles.charCount}>{title.length}/50</Text>
                  )}

                  {/* Description */}
                  <View style={{ marginTop: 8 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDark ? "#999" : "#666",
                        marginBottom: 4,
                      }}
                    >
                      Description (Optional)
                    </Text>
                    <TextInput
                      placeholder="Add a short description..."
                      value={description}
                      onChangeText={
                        (text) => setDescription(text.slice(0, 200)) // limit to 200 chars
                      }
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={[
                        styles.input,
                        {
                          height: 80,
                          borderColor: isDark ? "#444" : "#ccc",
                          color: isDark ? "#fff" : "#000",
                        },
                      ]}
                      placeholderTextColor="#888"
                      maxLength={200}
                    />
                    <Text style={styles.charCount}>
                      {description.length}/200
                    </Text>
                  </View>

                  {/* Priority */}
                  <View style={{ marginTop: 10 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDark ? "#999" : "#666",
                        marginBottom: 6,
                      }}
                    >
                      Priority
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
                              borderColor: isDark ? "#444" : "#ccc",
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
                                  ? "#000"
                                  : "#222",
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

                  {/* Buttons */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: "#666" }]}
                      onPress={onClose}
                    >
                      <Text style={{ color: "#fff" }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: "#4a90e2" }]}
                      onPress={handleSave}
                    >
                      <Text style={{ color: "#fff" }}>Save</Text>
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
    color: "#888",
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
    color: "red",
    fontSize: 12,
    marginTop: -2,
    marginBottom: 4,
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
