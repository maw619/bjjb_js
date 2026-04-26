import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { API_BASE_URL, getVideos } from "./api/api";

const videosEndpoint = `${API_BASE_URL}/videos/`;

const formatMeta = (item) => {
  const channel = item?.instructor || item?.category || "BJJ Channel";
  const level = item?.level ? ` • ${item.level}` : "";
  return `${channel}${level}`;
};

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getVideos()
      .then((res) => {
        setVideos(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((err) => {
        const details = err?.response?.data || err.message;
        setError(`Could not load videos from ${videosEndpoint}. ${JSON.stringify(details)}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const videoCountText = useMemo(() => `${videos.length} videos`, [videos.length]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.appName}>BJJ Tube</Text>
        <Text style={styles.endpoint}>Source: {videosEndpoint}</Text>

        <View style={styles.filterBar}>
          <Text style={styles.filterText}>Home</Text>
          <Text style={styles.filterText}>Library</Text>
          <Text style={styles.filterText}>Saved</Text>
          <Text style={styles.videoCount}>{loading ? "Loading..." : videoCountText}</Text>
        </View>

        {loading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#ff0000" />
            <Text style={styles.stateText}>Loading videos...</Text>
          </View>
        )}

        {!loading && !!error && (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.videoRow}>
                <View style={styles.thumbnail}>
                  <Text style={styles.thumbnailLabel}>BJJ</Text>
                </View>

                <View style={styles.videoInfo}>
                  <Text numberOfLines={2} style={styles.videoTitle}>
                    {item.title}
                  </Text>
                  <Text style={styles.videoMeta}>{formatMeta(item)}</Text>
                  <Text style={styles.videoApi}>/videos/{item.id}/</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No videos yet.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  endpoint: {
    color: "#9f9f9f",
    fontSize: 12,
    marginBottom: 12,
  },
  filterBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b1b1b",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 10,
  },
  filterText: {
    color: "#ffffff",
    fontSize: 13,
  },
  videoCount: {
    marginLeft: "auto",
    color: "#ff4e45",
    fontWeight: "700",
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  videoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  thumbnail: {
    width: 152,
    height: 86,
    borderRadius: 10,
    backgroundColor: "#2d2d2d",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailLabel: {
    color: "#ffffff",
    fontWeight: "700",
    letterSpacing: 1,
  },
  videoInfo: {
    flex: 1,
    justifyContent: "center",
  },
  videoTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  videoMeta: {
    color: "#b4b4b4",
    fontSize: 12,
    marginBottom: 2,
  },
  videoApi: {
    color: "#7aa5ff",
    fontSize: 11,
  },
  centerState: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stateText: {
    color: "#b4b4b4",
  },
  errorText: {
    color: "#ff7777",
    textAlign: "center",
  },
  emptyText: {
    color: "#b4b4b4",
    textAlign: "center",
    marginTop: 20,
  },
});
