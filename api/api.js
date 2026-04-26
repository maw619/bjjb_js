import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

const DEFAULT_PORT = "8000";

const getExpoHost = () => {
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants?.manifest?.debuggerHost ||
    "";

  if (!hostUri) {
    return "";
  }

  return String(hostUri).split(":")[0] || "";
};

const getDevMachineHost = () => {
  if (!__DEV__) {
    return "127.0.0.1";
  }

  const expoHost = getExpoHost();

  if (expoHost) {
    return expoHost;
  }

  // Android emulator can access the host machine through 10.0.2.2.
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }

  // iOS simulator and Expo web can usually use localhost directly.
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
