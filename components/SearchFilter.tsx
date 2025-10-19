import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
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
  debounceDelay?: number;
}

const filters: ("All" | "High" | "Medium" | "Low")[] = [
  "All",
  "High",
  "Medium",
  "Low",
];

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  debounceDelay = 300,
}: SearchFilterProps) {
  const { theme } = useColorScheme();
  const isDark = theme === "dark";
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleSearchChange = (text: string) => {
    setLocalQuery(text);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      onSearchChange(text);
    }, debounceDelay);
  };

  const handleClearSearch = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    setLocalQuery("");
    onSearchChange("");
  };

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
    <View style={styles.wrapper}>
      {/* 🔍 Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDark ? "#222" : "#f2f2f2",
            borderColor: isDark ? "#444" : "#ccc",
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={isDark ? "#bbb" : "#555"}
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search tasks..."
          placeholderTextColor={isDark ? "#888" : "#666"}
          style={[styles.searchInput, { color: Colors[theme].text }]}
          value={localQuery}
          onChangeText={handleSearchChange}
        />
        {localQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? "#888" : "#555"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 🏷️ Priority Filters */}
      <View style={styles.filterRow}>
        {filters.map((item) => {
          const bgColor =
            item === "All"
              ? filter === "All"
                ? Colors[theme].tint
                : isDark
                ? "#2a2a2a"
                : "#e0e0e0"
              : getPriorityColor(item);

          const textColor =
            item === "All"
              ? filter === "All"
                ? Colors[theme].background
                : isDark
                ? "#fff"
                : "#333"
              : item === "Medium"
              ? "#000"
              : "#fff";

          return (
            <TouchableOpacity
              key={item}
              onPress={() => onFilterChange(item)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor:
                    filter === item ? bgColor : isDark ? "#2a2a2a" : "#e0e0e0",
                },
              ]}
            >
              <Text
                style={{
                  color: filter === item ? textColor : isDark ? "#fff" : "#333",
                  fontWeight: filter === item ? "700" : "500",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 4,
    marginHorizontal: 10,
  },
  filterBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
});