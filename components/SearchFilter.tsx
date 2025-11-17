import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  filter: "All" | "High" | "Medium" | "Low";
  onFilterChange: (value: "All" | "High" | "Medium" | "Low") => void;
  category: "All" | "Work" | "Personal" | "School" | "Other";
  onCategoryChange: (
    value: "All" | "Work" | "Personal" | "School" | "Other"
  ) => void;

  showCompleted: boolean;
  onToggleCompleted: () => void;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  category,
  onCategoryChange,
  showCompleted,
  onToggleCompleted,
}: SearchFilterProps) {
  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  const bg = Colors[theme].background;
  const textColor = Colors[theme].text;

  const border = isDark ? "#333" : "#ccc";

  const surface = isDark ? "#1e1f20" : "#ffffff";

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // ACTIVE FILTER DETECTION
  const hasFilter =
    filter !== "All" ||
    category !== "All" ||
    searchQuery !== "" ||
    showCompleted;

  useEffect(() => setLocalQuery(searchQuery), [searchQuery]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: filtersVisible ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [filtersVisible]);

  const handleSearch = (val: string) => {
    setLocalQuery(val);
    onSearchChange(val);
  };

  // PRIORITY COLORS
  const PRIORITY_COLORS = {
    High: "#e74c3c",
    Medium: "#f1c40f",
    Low: "#2ecc71",
  };

  // CATEGORY COLORS
  const CATEGORY_COLORS = {
    Work: "#3498db",
    Personal: "#9b59b6",
    School: "#e67e22",
    Other: "#16a085",
  };

  // UNIVERSAL CHIP STYLE HANDLER
  const getChipStyle = (
    value: string,
    isSelected: boolean,
    type: "priority" | "category"
  ) => {
    const colorMap = type === "priority" ? PRIORITY_COLORS : CATEGORY_COLORS;

    if (value === "All")
      return {
        bg: isSelected ? Colors[theme].tint : "transparent",
        text: isSelected ? Colors[theme].background : textColor,
        border: isSelected ? Colors[theme].tint : border,
      };

    const baseColor = colorMap[value as keyof typeof colorMap];

    return isSelected
      ? {
          bg: baseColor,
          text: "#fff",
          border: baseColor,
        }
      : {
          bg: isDark ? baseColor + "33" : "#f0f0f0",
          text: isDark ? "#fff" : Colors.light.text,
          border: isDark ? baseColor + "55" : "#ccc",
        };
  };

  return (
    <View style={{ marginBottom: 6 }}>
      {/* SEARCH BAR */}
      <View
        style={[
          styles.searchRow,
          {
            backgroundColor: surface,
            borderColor: border,
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={textColor} />

        <TextInput
          value={localQuery}
          onChangeText={handleSearch}
          placeholder="Search tasks…"
          placeholderTextColor={isDark ? "#777" : "#999"}
          style={[styles.searchInput, { color: textColor }]}
        />

        {localQuery !== "" && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={isDark ? "#aaa" : "#777"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER ROW */}
      <View style={styles.row}>
        {/* FILTER BUTTON */}
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: Colors[theme].tint }]}
          onPress={() => setFiltersVisible((prev) => !prev)}
        >
          <Ionicons
            name={filtersVisible ? "close-outline" : "funnel-outline"}
            size={16}
            color={Colors[theme].background}
          />
          <Text
            style={[styles.filterText, { color: Colors[theme].background }]}
          >
            Filter
          </Text>
        </TouchableOpacity>

        {/* SHOW COMPLETED */}
        <TouchableOpacity
          style={[
            styles.completedBtn,
            {
              backgroundColor: showCompleted ? Colors.common.error : surface,
              borderColor: showCompleted ? Colors.common.error : border,
            },
          ]}
          onPress={onToggleCompleted}
        >
          <Ionicons
            name={showCompleted ? "checkmark-done" : "checkmark-done-outline"}
            size={16}
            color={showCompleted ? "#fff" : textColor}
          />
          <Text
            style={{
              color: showCompleted ? "#fff" : textColor,
              marginLeft: 6,
              fontWeight: "600",
              fontSize: 13,
            }}
          >
            {showCompleted ? "Hide Completed" : "Show Completed"}
          </Text>
        </TouchableOpacity>

        {/* CLEAR BUTTON */}
        {hasFilter && (
          <TouchableOpacity
            style={[
              styles.clearBtn,
              {
                borderColor: Colors[theme].tint,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
              },
            ]}
            onPress={() => {
              handleSearch("");
              onFilterChange("All");
              onCategoryChange("All");
              if (showCompleted) onToggleCompleted();
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color={Colors[theme].tint}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color: Colors[theme].tint,
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER EXPANDED */}
      <Animated.View
        style={{
          height: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 180],
          }),
          opacity: slideAnim,
          overflow: "hidden",
        }}
      >
        <View style={[styles.filterBox, { backgroundColor: surface }]}>
          {/* PRIORITY */}
          <Text style={[styles.label, { color: textColor }]}>Priority</Text>
          <View style={styles.filtersRow}>
            {["All", "High", "Medium", "Low"].map((p) => {
              const {
                bg,
                border: b,
                text,
              } = getChipStyle(p, filter === p, "priority");
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => onFilterChange(p as any)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: bg,
                      borderColor: b,
                    },
                  ]}
                >
                  <Text style={{ color: text, fontWeight: "600" }}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CATEGORY */}
          <Text style={[styles.label, { color: textColor, marginTop: 10 }]}>
            Category
          </Text>

          {/* One row layout */}
          <View style={styles.categoryRow}>
            {["All", "Work", "Personal", "School", "Other"].map((c) => {
              const {
                bg,
                border: b,
                text,
              } = getChipStyle(c, category === c, "category");
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => onCategoryChange(c as any)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: bg,
                      borderColor: b,
                    },
                  ]}
                >
                  <Text style={{ color: text, fontWeight: "600" }}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  searchRow: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },

  row: {
    marginTop: 10,

    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    justifyContent: "flex-start",
    gap: 10,
    marginBottom: 10,
  },

  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  filterText: {
    marginLeft: 5,
    fontWeight: "700",
    fontSize: 14,
  },

  completedBtn: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },

  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },

  filterBox: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },

  label: { fontWeight: "700", fontSize: 13, marginBottom: 6 },

  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    paddingHorizontal: 26,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  categoryChip: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: "center",
  },
});