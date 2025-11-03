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
  debounceDelay?: number;
}

const priorityFilters: ("All" | "High" | "Medium" | "Low")[] = [
  "All",
  "High",
  "Medium",
  "Low",
];

const categoryFilters: ("All" | "Work" | "Personal" | "School" | "Other")[] = [
  "All",
  "Work",
  "Personal",
  "School",
  "Other",
];

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  category,
  onCategoryChange,
  debounceDelay = 300,
}: SearchFilterProps) {
  const { theme } = useColorScheme();
  const isDark = theme === "dark";
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const surface = isDark ? "#242424" : "#ffffff";
  const border = isDark ? "#333" : "#ddd";
  const text = Colors[theme].text;

  const hasActiveFilter = filter !== "All" || category !== "All";

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: filtersVisible ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [filtersVisible]);

  const handleSearchChange = (text: string) => {
    setLocalQuery(text);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(
      () => onSearchChange(text),
      debounceDelay
    );
  };

  const handleClearSearch = () => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    setLocalQuery("");
    onSearchChange("");
  };

  const handleClearFilters = () => {
    onFilterChange("All");
    onCategoryChange("All");
    setFiltersVisible(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "#ff6b6b";
      case "Medium":
        return "#f1c40f";
      case "Low":
        return "#2ecc71";
      default:
        return Colors[theme].tint;
    }
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
    <View
      style={[styles.wrapper, { backgroundColor: Colors[theme].background }]}
    >
      {/* 🔍 Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: surface, borderColor: border },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={isDark ? "#aaa" : "#555"}
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search tasks..."
          placeholderTextColor={isDark ? "#777" : "#999"}
          style={[styles.searchInput, { color: text }]}
          value={localQuery}
          onChangeText={handleSearchChange}
        />
        {localQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={isDark ? "#999" : "#777"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 🎛️ Filter Controls Row */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: Colors[theme].tint,
              borderColor: Colors[theme].tint,
            },
          ]}
          onPress={() => setFiltersVisible((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={filtersVisible ? "close-outline" : "filter-outline"}
            size={18}
            color={Colors[theme].background}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              color: Colors[theme].background,
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            {filtersVisible ? "Close Filter" : "Filter"}
          </Text>
        </TouchableOpacity>

        {hasActiveFilter && (
          <TouchableOpacity
            style={[
              styles.clearButton,
              {
                backgroundColor: isDark ? "#333" : "#eee",
                borderColor: isDark ? "#444" : "#ddd",
              },
            ]}
            onPress={handleClearFilters}
            activeOpacity={0.8}
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

      {/* 🪄 Animated Filter Section */}
      <Animated.View
        style={{
          overflow: "hidden",
          height: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 180],
          }),
          opacity: slideAnim,
        }}
      >
        <View style={[styles.filterGroup, { backgroundColor: surface }]}>
          {/* Priority */}
          <Text style={[styles.groupLabel, { color: text }]}>Priority</Text>
          <View style={styles.filterRow}>
            {priorityFilters.map((item) => {
              const isSelected = filter === item;
              const color = getPriorityColor(item);
              const isAll = item === "All";

              const bgColor = isSelected
                ? isAll
                  ? Colors[theme].tint
                  : color
                : "transparent";

              const textColor = isSelected
                ? isAll
                  ? Colors[theme].background
                  : "#fff"
                : text;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => onFilterChange(item)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: bgColor,
                      borderColor: isSelected ? color : border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: textColor,
                      fontWeight: isSelected ? "700" : "500",
                      fontSize: 13,
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Category */}
          <Text style={[styles.groupLabel, { color: text, marginTop: 8 }]}>
            Category
          </Text>
          <View style={styles.filterRow}>
            {categoryFilters.map((cat) => {
              const isSelected = category === cat;
              const color = getCategoryColor(cat);
              const isAll = cat === "All";

              const bgColor = isSelected
                ? isAll
                  ? Colors[theme].tint
                  : color
                : "transparent";

              const textColor = isSelected
                ? isAll
                  ? Colors[theme].background
                  : "#fff"
                : text;

              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => onCategoryChange(cat)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: bgColor,
                      borderColor: isSelected ? color : border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: textColor,
                      fontWeight: isSelected ? "700" : "500",
                      fontSize: 13,
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearButton: {
    flexDirection: "row",
    marginRight: "auto",
    marginLeft: 12,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  filterGroup: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    opacity: 0.7,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});