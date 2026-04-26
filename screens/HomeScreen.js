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

const getSectionKey = (item) => {
  if (item?.section !== undefined && item?.section !== null && item?.section !== "") {
    return String(item.section);
  }

  return "General";
};

const getPathSegments = (value = "") => {
  const raw = String(value || "").trim();

  if (!raw) {
    return [];
  }

  try {
    const maybeUrl = new URL(raw);
    return decodeURIComponent(maybeUrl.pathname)
      .split("/")
      .filter(Boolean);
  } catch (error) {
    return decodeURIComponent(raw)
      .split("/")
      .filter(Boolean);
  }
};

const getSeriesName = (item) => {
  const explicitSeriesName =
    item?.series_title ||
    item?.series_name ||
    item?.seriesName ||
    item?.course_title ||
    item?.course_name ||
    item?.courseName ||
    item?.category;

  if (explicitSeriesName && String(explicitSeriesName).trim()) {
    return String(explicitSeriesName).trim();
  }

  const pathLikeValue =
    item?.s3_key ||
    item?.object_key ||
    item?.file_path ||
    item?.path ||
    item?.video_url ||
    item?.videoUrl ||
    item?.s3_url ||
    item?.url;

  const segments = getPathSegments(pathLikeValue);
  const bjjIndex = segments.findIndex((segment) => segment.toLowerCase() === "bjj");

  if (bjjIndex >= 0 && segments[bjjIndex + 1]) {
    return segments[bjjIndex + 1];
  }

  if (segments.length >= 2) {
    return segments[segments.length - 2];
  }

  return "Uncategorized Series";
};

const extractTitleFromVideoName = (videoTitle = "") => {
  const normalizedTitle = String(videoTitle).trim();

  if (!normalizedTitle) {
    return "";
  }

  const withoutLeadingIndex = normalizedTitle.replace(/^\d+[\s._-]*/, "");

  return withoutLeadingIndex || normalizedTitle;
};

const getSectionDisplayName = (sectionKey, sectionVideos = []) => {
  const firstVideoWithSectionName = sectionVideos.find((video) => {
    const candidate =
      video?.section_title ||
      video?.section_name ||
      video?.sectionName ||
      video?.module_title ||
      video?.module_name ||
      video?.moduleName;

    return Boolean(candidate && String(candidate).trim());
  });

  const explicitName =
    firstVideoWithSectionName?.section_title ||
    firstVideoWithSectionName?.section_name ||
    firstVideoWithSectionName?.sectionName ||
    firstVideoWithSectionName?.module_title ||
    firstVideoWithSectionName?.module_name ||
    firstVideoWithSectionName?.moduleName;

  const inferredFromTitle = extractTitleFromVideoName(
    sectionVideos.find((video) => video?.title && String(video.title).trim())?.title,
  );

  const resolvedName = explicitName ? String(explicitName).trim() : inferredFromTitle;

  if (resolvedName) {
    const numericKey = /^\d+$/.test(String(sectionKey));

    if (numericKey) {
      return `Section ${sectionKey} · ${resolvedName}`;
    }

    return resolvedName;
  }

  if (!/^\d+$/.test(String(sectionKey))) {
    return String(sectionKey);
  }

  return `Section ${sectionKey}`;
};

const getGroupedSectionKey = (item) => {
  const seriesName = getSeriesName(item);
  const sectionKey = getSectionKey(item);

  return `${seriesName}:::${sectionKey}`;
};

const bySeriesThenSectionThenId = (a, b) => {
  const seriesA = getSeriesName(a);
  const seriesB = getSeriesName(b);

  if (seriesA !== seriesB) {
    return seriesA.localeCompare(seriesB, undefined, { numeric: true, sensitivity: "base" });
  }

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
        setVideos(payload.sort(bySeriesThenSectionThenId));
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  const sections = useMemo(() => {
    const grouped = videos.reduce((acc, video) => {
      const groupedSectionKey = getGroupedSectionKey(video);

      if (!acc[groupedSectionKey]) {
        acc[groupedSectionKey] = [];
      }

      acc[groupedSectionKey].push(video);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map(([combinedKey, data]) => {
        const firstVideo = data[0] || {};
        const seriesName = getSeriesName(firstVideo);
        const sectionKey = getSectionKey(firstVideo);

        return {
          key: combinedKey,
          title: `${seriesName} — ${getSectionDisplayName(sectionKey, data)}`,
          data,
        };
      });
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
