import React, { useEffect, useMemo, useState } from "react";
import { View, Text, SectionList, Pressable, StyleSheet } from "react-native";
import { getVideos } from "../api/api";

const getSectionName = (video) => video.section || video.category || "Uncategorized";

export default function HomeScreen() {
  const [videos, setVideos] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    getVideos()
      .then((res) => setVideos(res.data))
      .catch((err) => console.log(err));
  }, []);

  const sections = useMemo(() => {
    const grouped = videos.reduce((acc, video) => {
      const section = getSectionName(video);
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(video);
      return acc;
    }, {});

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [videos]);

  const toggleSection = (title) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderSectionHeader={({ section }) => {
        const isCollapsed = collapsedSections[section.title];

        return (
          <Pressable style={styles.sectionHeader} onPress={() => toggleSection(section.title)}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.chevron}>{isCollapsed ? "▸" : "▾"}</Text>
          </Pressable>
        );
      }}
      renderItem={({ item, section }) => {
        if (collapsedSections[section.title]) {
          return null;
        }

        return (
          <View style={styles.videoRow}>
            <Text style={styles.videoTitle}>{item.title}</Text>
          </View>
        );
      }}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.container}
      ListEmptyComponent={<Text style={styles.emptyText}>No videos available.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  chevron: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  videoRow: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  videoTitle: {
    fontSize: 15,
    color: "#111827",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 24,
  },
});
