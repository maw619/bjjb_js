import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

const DEFAULT_PORT = "8000";

const pickHostFromValue = (value = "") => {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  try {
    const parsed = new URL(raw.includes("://") ? raw : `exp://${raw}`);
    return parsed.hostname || "";
  } catch (error) {
    return raw.split(":")[0] || "";
  }
};

const getExpoHost = () => {
  const hostCandidates = [
    Constants?.expoConfig?.hostUri,
    Constants?.manifest2?.extra?.expoGo?.debuggerHost,
    Constants?.manifest?.debuggerHost,
    Constants?.linkingUri,
  ];

  return hostCandidates
    .map((candidate) => pickHostFromValue(candidate))
    .find(Boolean) || "";
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
  if (Platform.OS === "android" && Constants?.isDevice === false) {
    return "10.0.2.2";
  }

  // Last-resort fallback when no Expo host metadata is available.
  return "127.0.0.1";
};

const API_HOST = process.env.EXPO_PUBLIC_API_HOST || getDevMachineHost();
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || DEFAULT_PORT;
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

const API_BASE_URL = (() => {
  if (!configuredBaseUrl) {
    return `http://${API_HOST}:${API_PORT}/api`;
  }

  // If a physical Android device is still configured to use emulator host, auto-correct in dev.
  if (__DEV__ && Platform.OS === "android" && Constants?.isDevice && configuredBaseUrl.includes("10.0.2.2")) {
    const expoHost = getExpoHost();

    if (expoHost) {
      return configuredBaseUrl.replace("10.0.2.2", expoHost);
    }
  }

  return configuredBaseUrl;
})();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getVideos = () => api.get("/videos/");

export { API_BASE_URL };
