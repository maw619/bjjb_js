import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getVideos } from "../api/api";

const getSectionKey = (video) => {
  if (video.section !== undefined && video.section !== null && video.section !== "") {
    return String(video.section);
  }

  if (video.category !== undefined && video.category !== null && video.category !== "") {
    return String(video.category);
  }

  return "Uncategorized";
};

const bySectionThenId = (a, b) => {
  const sectionA = getSectionKey(a);
  const sectionB = getSectionKey(b);

  if (sectionA !== sectionB) {
    return sectionA.localeCompare(sectionB, undefined, { numeric: true, sensitivity: "base" });
  }

  return Number(a.id) - Number(b.id);
};

export default function HomeScreen() {
  const [videos, setVideos] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getVideos()
      .then((res) => {
        const payload = Array.isArray(res.data) ? res.data : [];
        setVideos(payload.sort(bySectionThenId));
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  const sections = useMemo(() => {
    const grouped = videos.reduce((acc, video) => {
      const key = getSectionKey(video);

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(video);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map(([sectionKey, data]) => ({
        key: sectionKey,
        title: `Section ${sectionKey}`,
        data,
      }));
  }, [videos]);

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (!sections.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No videos available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sections}
      keyExtractor={(section) => section.key}
      contentContainerStyle={styles.container}
      renderItem={({ item: section }) => {
        const isExpanded = Boolean(expandedSections[section.key]);

        return (
          <View style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.key)}
            >
              <View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionCount}>{section.data.length} videos</Text>
              </View>
              <Text style={styles.chevron}>{isExpanded ? "▾" : "▸"}</Text>
            </Pressable>

            {isExpanded && section.data.map((video) => (
              <View key={video.id} style={styles.videoRow}>
                <Text style={styles.videoTitle}>{video.title}</Text>
              </View>
            ))}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  emptyText: {
    color: "#6b7280",
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  sectionHeader: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  sectionCount: {
    color: "#d1d5db",
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
  videoRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  videoTitle: {
    color: "#111827",
    fontSize: 15,
  },
});
