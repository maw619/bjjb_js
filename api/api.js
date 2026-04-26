import axios from "axios";
import { Platform } from "react-native";

const DEFAULT_PORT = "8000";

const getDevMachineHost = () => {
  if (__DEV__) {
    // 10.0.2.2 allows Android emulators to access localhost on the host machine.
    if (Platform.OS === "android") {
      return "10.0.2.2";
    }

    // iOS simulator can use localhost directly.
    if (Platform.OS === "ios") {
      return "127.0.0.1";
    }
  }

  // Expo web and fallbacks.
  return "127.0.0.1";
};

const API_HOST = process.env.EXPO_PUBLIC_API_HOST || getDevMachineHost();
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || DEFAULT_PORT;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || `http://${API_HOST}:${API_PORT}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getVideos = () => api.get("/videos/");

export { API_BASE_URL };
