import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaView, StyleSheet, Switch, Text, View } from "react-native";
import { Colors } from "../../constants/theme";

export default function SettingsScreen() {
  const { theme, toggleTheme } = useColorScheme();
  const isDark = theme === "dark";

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}
    >
      <View style={styles.container}>
        {/* Header */}
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          Settings
        </Text>
        <Text style={[styles.subtitle, { color: Colors[theme].icon }]}>
          Customize your TaskMate experience
        </Text>

        {/* Section */}
        <View
          style={[
            styles.section,
            {
              backgroundColor:
                theme === "dark" ? "#1E1E1E" : "rgba(240,240,240,0.9)",
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: Colors[theme].text }]}>
            Dark Mode
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            ios_backgroundColor={theme === "dark" ? "#444" : "#ccc"}
            trackColor={{ false: "#ccc", true: "#4a90e2" }}
            thumbColor={isDark ? "#fff" : "#000"}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 30,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
});
