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

  return hostCandidates.map((candidate) => pickHostFromValue(candidate)).find(Boolean) || "";
};

const getDevMachineHost = () => {
  if (!__DEV__) {
    return "127.0.0.1";
  }

  const expoHost = getExpoHost();

  if (expoHost) {
    return expoHost;
  }

  if (Platform.OS === "android" && Constants?.isDevice === false) {
    return "10.0.2.2";
  }

  return "127.0.0.1";
};

const API_HOST = process.env.EXPO_PUBLIC_API_HOST || getDevMachineHost();
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || DEFAULT_PORT;
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

const getInitialBaseUrl = () => {
  if (!configuredBaseUrl) {
    return `http://${API_HOST}:${API_PORT}/api`;
  }

  if (__DEV__ && Platform.OS === "android" && Constants?.isDevice && configuredBaseUrl.includes("10.0.2.2")) {
    const expoHost = getExpoHost();

    if (expoHost) {
      return configuredBaseUrl.replace("10.0.2.2", expoHost);
    }
  }

  return configuredBaseUrl;
};

const API_BASE_URL = getInitialBaseUrl();

const buildCandidateBaseUrls = () => {
  const expoHost = getExpoHost();
  const candidates = [
    API_BASE_URL,
    `http://${API_HOST}:${API_PORT}/api`,
  ];

  if (expoHost) {
    candidates.push(`http://${expoHost}:${API_PORT}/api`);
    candidates.push(`http://${expoHost}/api`);
  }

  if (Platform.OS === "android" && Constants?.isDevice === false) {
    candidates.push(`http://10.0.2.2:${API_PORT}/api`);
  }

  return [...new Set(candidates.filter(Boolean))];
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getVideos = async () => {
  const candidateBaseUrls = buildCandidateBaseUrls();
  let lastError = null;

  for (const baseUrl of candidateBaseUrls) {
    try {
      const response = await axios.get(`${baseUrl}/videos/`, { timeout: 10000 });
      api.defaults.baseURL = baseUrl;
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export { API_BASE_URL };
