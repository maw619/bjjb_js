import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { API_BASE_URL, getVideos } from "./api/api";

const videosEndpoint = `${API_BASE_URL}/videos/`;

const getSubtitle = (item) => {
  if (item?.instructor) {
    return `Instructor: ${item.instructor}`;
  }

  if (item?.category) {
    return `Category: ${item.category}`;
  }

  return "Training video";
};

const getSectionKey = (item) => {
  if (item?.section !== undefined && item?.section !== null && item?.section !== "") {
    return String(item.section);
  }

  if (item?.category) {
    return String(item.category);
  }

  return "Uncategorized";
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

  if (explicitName) {
    const cleanName = String(explicitName).trim();
    const numericKey = /^\d+$/.test(String(sectionKey));

    if (numericKey) {
      return `Section ${sectionKey} · ${cleanName}`;
    }

    return cleanName;
  }

  if (!/^\d+$/.test(String(sectionKey))) {
    return String(sectionKey);
  }

  return `Section ${sectionKey}`;
};

const getItemApiUrl = (item) => `${videosEndpoint}${item.id}/`;

const getVideoUrl = (item) => {
  return item?.video_url || item?.videoUrl || item?.s3_url || item?.url || null;
};

const getThumbnailUrl = (item) => {
  return item?.thumbnail_url || item?.thumbnailUrl || item?.image_url || item?.poster_url || null;
};

export default function App() {
  const [videos, setVideos] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
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

  const sections = useMemo(() => {
    const grouped = videos.reduce((acc, video) => {
      const sectionKey = getSectionKey(video);
      if (!acc[sectionKey]) {
        acc[sectionKey] = [];
      }

      acc[sectionKey].push(video);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map(([key, data]) => ({
        key,
        title: getSectionDisplayName(key, data),
        data,
      }));
  }, [videos]);

  const totalVideos = useMemo(() => videos.length, [videos]);
  const totalSections = useMemo(() => sections.length, [sections]);

  const openExternalLink = useCallback(async (url) => {
    if (!url) {
      Alert.alert("Missing URL", "This video does not include a playable URL yet.");
      return;
    }

    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert("Cannot open link", `This device cannot open: ${url}`);
      return;
    }

    await Linking.openURL(url);
  }, []);

  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>BJJ LIBRARY</Text>
          <Text style={styles.heroTitle}>Video Lessons</Text>
          <Text style={styles.heroDescription}>
            Browse your latest videos from the API in a clean, app-ready layout.
          </Text>
          <Pressable onPress={() => openExternalLink(videosEndpoint)} style={styles.endpointButton}>
            <Text style={styles.endpointLabel}>Endpoint</Text>
            <Text style={styles.endpointLink}>{videosEndpoint}</Text>
          </Pressable>
        </View>

        <View style={styles.statsCard}>
          <View>
            <Text style={styles.statsLabel}>Available videos</Text>
            <Text style={styles.statsValue}>{loading ? "--" : totalVideos}</Text>
          </View>
          <View style={styles.sectionStat}>
            <Text style={styles.sectionStatLabel}>Sections</Text>
            <Text style={styles.sectionStatValue}>{loading ? "--" : totalSections}</Text>
          </View>
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
            data={sections}
            keyExtractor={(item) => item.key}
            renderItem={({ item: section }) => {
              const isExpanded = Boolean(expandedSections[section.key]);

              return (
                <View style={styles.sectionCard}>
                  <Pressable style={styles.sectionHeader} onPress={() => toggleSection(section.key)}>
                    <View>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <Text style={styles.sectionSubtitle}>{section.data.length} videos</Text>
                    </View>
                    <Text style={styles.sectionChevron}>{isExpanded ? "▾" : "▸"}</Text>
                  </Pressable>

                  {isExpanded ? (
                    <View style={styles.sectionBody}>
                      {section.data.map((item) => {
                        const thumbnailUrl = getThumbnailUrl(item);
                        const videoUrl = getVideoUrl(item);

                        return (
                          <View key={item.id} style={styles.videoCard}>
                            <View style={styles.videoInfo}>
                              <Text style={styles.videoTitle}>{item.title}</Text>
                              <Text style={styles.videoSubtitle}>{getSubtitle(item)}</Text>

                              {thumbnailUrl ? (
                                <Image
                                  source={{ uri: thumbnailUrl }}
                                  style={styles.thumbnail}
                                  resizeMode="cover"
                                />
                              ) : null}

                              <View style={styles.linkRow}>
                                <Pressable onPress={() => openExternalLink(videoUrl)} hitSlop={8}>
                                  <Text style={styles.videoLink}>Watch video</Text>
                                </Pressable>
                                <Pressable onPress={() => openExternalLink(getItemApiUrl(item))} hitSlop={8}>
                                  <Text style={styles.videoLink}>Open API record</Text>
                                </Pressable>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            }}
            ListEmptyComponent={(
              <Text style={styles.empty}>
                No videos returned from the API yet.
              </Text>
            )}
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
  endpointButton: {
    borderWidth: 1,
    borderColor: "#3D5D90",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#10213D",
  },
  endpointLabel: {
    color: "#89A9E8",
    fontSize: 11,
    marginBottom: 3,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  endpointLink: {
    color: "#B8D0FF",
    fontSize: 13,
    textDecorationLine: "underline",
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
  sectionStat: {
    alignItems: "flex-end",
  },
  sectionStatLabel: {
    color: "#5B6B8A",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionStatValue: {
    color: "#13284B",
    fontSize: 20,
    fontWeight: "700",
  },
  listContainer: {
    paddingBottom: 16,
    gap: 10,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E3E8F2",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    backgroundColor: "#13284B",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: "#C9D9F6",
    fontSize: 12,
    marginTop: 2,
  },
  sectionChevron: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionBody: {
    backgroundColor: "#FFFFFF",
  },
  videoCard: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#E3E8F2",
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
    marginBottom: 8,
  },
  thumbnail: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#EEF3FB",
  },
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  videoLink: {
    color: "#1E6EEB",
    fontWeight: "600",
    textDecorationLine: "underline",
    fontSize: 12,
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
