import { create } from "zustand";

// Helper function to safely get localStorage
const getStoredTheme = () => {
  try {
    return localStorage.getItem("preferred-theme") || "forest";
  } catch (error) {
    console.warn("localStorage not available:", error);
    return "forest";
  }
};

// Helper function to safely set localStorage
const setStoredTheme = (theme) => {
  try {
    localStorage.setItem("preferred-theme", theme);
  } catch (error) {
    console.warn("Could not save theme to localStorage:", error);
  }
};

export const useThemeStore = create((set, get) => ({
  theme: getStoredTheme(),

  setTheme: (newTheme) => {
    console.log("Setting theme to:", newTheme); // Debug log
    setStoredTheme(newTheme);
    set({ theme: newTheme });
  },

  // Optional: method to get current theme
  getCurrentTheme: () => get().theme,
}));
