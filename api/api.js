import axios from "axios";
import { Platform } from "react-native";

const DEFAULT_PORT = "8000";

const pickHostFromValue = (value = "") => {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  try {
    const parsed = new URL(raw.includes("://") ? raw : `http://${raw}`);
    return parsed.hostname || "";
  } catch (error) {
    return raw.split(":")[0] || "";
  }
};

const getRuntimeHost = () => {
  const explicitHost = pickHostFromValue(process.env.EXPO_PUBLIC_API_HOST);
  if (explicitHost) {
    return explicitHost;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.hostname || "127.0.0.1";
  }

  if (__DEV__ && Platform.OS === "android") {
    return "10.0.2.2";
  }

  return "127.0.0.1";
};

const API_HOST = getRuntimeHost();
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || DEFAULT_PORT;
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

const getInitialBaseUrl = () => {
  if (!configuredBaseUrl) {
    return `http://${API_HOST}:${API_PORT}/api`;
  }

  return configuredBaseUrl;
};

const API_BASE_URL = getInitialBaseUrl();

const buildCandidateBaseUrls = () => {
  const explicitHost = pickHostFromValue(process.env.EXPO_PUBLIC_API_HOST);
  const candidates = [
    API_BASE_URL,
    `http://${API_HOST}:${API_PORT}/api`,
  ];

  if (__DEV__) {
    candidates.push(`http://127.0.0.1:${API_PORT}/api`);
    candidates.push(`http://localhost:${API_PORT}/api`);

    if (Platform.OS === "android") {
      candidates.push(`http://10.0.2.2:${API_PORT}/api`);
    }
  }

  if (explicitHost) {
    candidates.push(`http://${explicitHost}:${API_PORT}/api`);
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
