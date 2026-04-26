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

const getSubtitle = (item) => {
  if (item?.instructor) {
    return `Instructor: ${item.instructor}`;
  }

  if (item?.category) {
    return `Category: ${item.category}`;
  }

  return "Training video";
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
        setError(`Could not load videos from ${API_BASE_URL}/videos/. ${JSON.stringify(details)}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalVideos = useMemo(() => videos.length, [videos]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>BJJ LIBRARY</Text>
          <Text style={styles.heroTitle}>Video Lessons</Text>
          <Text style={styles.heroDescription}>Browse your latest videos from the API in a clean, app-ready layout.</Text>
          <Text style={styles.endpoint}>Endpoint: {API_BASE_URL}/videos/</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Available videos</Text>
          <Text style={styles.statsValue}>{loading ? "--" : totalVideos}</Text>
        </View>

        {loading && (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#1E6EEB" />
            <Text style={styles.stateText}>Loading your library...</Text>
          </View>
        )}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Unable to load videos</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!loading && !error ? (
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={videos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.videoCard}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{index + 1}</Text>
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{item.title}</Text>
                  <Text style={styles.videoSubtitle}>{getSubtitle(item)}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No videos returned from the API yet.</Text>}
            showsVerticalScrollIndicator={false}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F5FA",
  },
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heroCard: {
    borderRadius: 18,
    backgroundColor: "#13284B",
    padding: 18,
    marginBottom: 12,
  },
  kicker: {
    color: "#AFC8F5",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  heroDescription: {
    color: "#DEE7FB",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  endpoint: {
    color: "#89A9E8",
    fontSize: 12,
  },
  statsCard: {
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E3E8F2",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsLabel: {
    color: "#5B6B8A",
    fontSize: 14,
    fontWeight: "600",
  },
  statsValue: {
    color: "#13284B",
    fontSize: 24,
    fontWeight: "700",
  },
  listContainer: {
    paddingBottom: 16,
    gap: 10,
  },
  videoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3E8F2",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#1E6EEB",
    fontWeight: "700",
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2433",
    marginBottom: 3,
  },
  videoSubtitle: {
    fontSize: 13,
    color: "#60708F",
  },
  centeredState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    gap: 10,
  },
  stateText: {
    color: "#60708F",
    fontSize: 14,
  },
  errorCard: {
    borderRadius: 14,
    backgroundColor: "#FFF3F2",
    borderColor: "#F7D0CC",
    borderWidth: 1,
    padding: 14,
  },
  errorTitle: {
    color: "#B00020",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  errorText: {
    color: "#8E2A2A",
    fontSize: 13,
  },
  empty: {
    marginTop: 6,
    color: "#60708F",
    textAlign: "center",
  },
});
