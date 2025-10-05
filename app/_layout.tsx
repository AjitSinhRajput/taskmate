import { Colors } from "@/constants/theme";
import { ThemeProvider, useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootStack() {
  const { theme } = useColorScheme();
  const isDark = theme === "dark";

  return (
    <SafeAreaProvider>
      <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDark
              ? Colors.dark.background
              : Colors.light.background,
          }}
          edges={["top", "left", "right"]}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>

          {/* ✅ Dynamic StatusBar */}
          <StatusBar
            style={isDark ? "light" : "dark"}
            backgroundColor={
              isDark ? Colors.dark.background : Colors.light.background
            }
          />
        </SafeAreaView>
      </NavThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
