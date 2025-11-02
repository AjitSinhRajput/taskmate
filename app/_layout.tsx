import { Colors } from "@/constants/theme";
import { ThemeProvider, useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

          {/* Dynamic StatusBar */}
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
  // ✅ Ask for notification permissions when the app loads
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Please enable notifications to receive task reminders.");
      }
    })();
  }, []);

  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
