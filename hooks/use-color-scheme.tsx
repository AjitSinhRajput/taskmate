// hooks/use-color-scheme.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  // Load theme from AsyncStorage or system default
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      } else {
        const sys = Appearance.getColorScheme() === "dark" ? "dark" : "light";
        setTheme(sys);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useColorScheme = () => useContext(ThemeContext);
