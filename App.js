import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { API_BASE_URL, getVideos } from "./api/api";

const videosEndpoint = `${API_BASE_URL}/videos/`;

const getPathSegments = (value = "") => {
  const raw = String(value || "").trim();

  if (!raw) {
    return [];
  }

  try {
    const maybeUrl = new URL(raw);
    return decodeURIComponent(maybeUrl.pathname).split("/").filter(Boolean);
  } catch (error) {
    return decodeURIComponent(raw).split("/").filter(Boolean);
  }
};

const getSeriesName = (item) => {
  const explicitName =
    item?.series_title ||
    item?.series_name ||
    item?.seriesName ||
    item?.course_title ||
    item?.course_name ||
    item?.courseName ||
    item?.category;

  if (explicitName && String(explicitName).trim()) {
    return String(explicitName).trim();
  }

  const pathLikeValue = item?.s3_key || item?.object_key || item?.file_path || item?.path || item?.video_url || item?.videoUrl || item?.s3_url || item?.url;
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

const getSectionName = (item) => {
  const explicitName =
    item?.section_title ||
    item?.section_name ||
    item?.sectionName ||
    item?.module_title ||
    item?.module_name ||
    item?.moduleName;

  if (explicitName && String(explicitName).trim()) {
    return String(explicitName).trim();
  }

  if (item?.section !== undefined && item?.section !== null && item?.section !== "") {
    return `Section ${item.section}`;
  }

  const rawTitle = String(item?.title || "").trim();
  if (!rawTitle) {
    return "General";
  }

  return rawTitle.replace(/^\d+[\s._-]*/, "") || rawTitle;
};

const getSubtitle = (item) => {
  if (item?.instructor) {
    return `Instructor: ${item.instructor}`;
  }

  if (item?.category) {
    return `Category: ${item.category}`;
  }

  return "Training video";
};

const getItemApiUrl = (item) => `${videosEndpoint}${item.id}/`;
const getVideoUrl = (item) => item?.video_url || item?.videoUrl || item?.s3_url || item?.url || null;
const getThumbnailUrl = (item) => item?.thumbnail_url || item?.thumbnailUrl || item?.image_url || item?.poster_url || null;

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSeries, setExpandedSeries] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    getVideos()
      .then((res) => setVideos(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => {
        const details = err?.response?.data || err.message;
        setError(`Could not load videos from ${videosEndpoint}. ${JSON.stringify(details)}`);
      })
      .finally(() => setLoading(false));
  }, []);

  const seriesList = useMemo(() => {
    const groupedBySeries = videos.reduce((acc, video) => {
      const seriesName = getSeriesName(video);
      if (!acc[seriesName]) {
        acc[seriesName] = [];
      }
      acc[seriesName].push(video);
      return acc;
    }, {});

    return Object.entries(groupedBySeries)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map(([seriesName, seriesVideos]) => {
        const groupedBySection = seriesVideos.reduce((acc, video) => {
          const sectionName = getSectionName(video);
          if (!acc[sectionName]) {
            acc[sectionName] = [];
          }
          acc[sectionName].push(video);
          return acc;
        }, {});

        const sections = Object.entries(groupedBySection)
          .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
          .map(([sectionName, sectionVideos]) => ({
            key: `${seriesName}:::${sectionName}`,
            title: sectionName,
            videos: sectionVideos,
          }));

        return {
          key: seriesName,
          title: seriesName,
          sections,
          videoCount: seriesVideos.length,
        };
      });
  }, [videos]);

  const totalVideos = videos.length;
  const totalSeries = seriesList.length;

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

  const toggleSeries = (seriesKey) => {
    setExpandedSeries((prev) => ({ ...prev, [seriesKey]: !prev[seriesKey] }));
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>BJJ LIBRARY</Text>
          <Text style={styles.heroTitle}>Series & Curriculum</Text>
          <Text style={styles.heroDescription}>A Submeta-style layout: Series on top, sections and lessons nested underneath.</Text>
          <Pressable onPress={() => openExternalLink(videosEndpoint)} style={styles.endpointButton}>
            <Text style={styles.endpointLabel}>Endpoint</Text>
            <Text style={styles.endpointLink}>{videosEndpoint}</Text>
          </Pressable>
        </View>

        <View style={styles.statsCard}>
          <View>
            <Text style={styles.statsLabel}>Series</Text>
            <Text style={styles.statsValue}>{loading ? "--" : totalSeries}</Text>
          </View>
          <View style={styles.sectionStat}>
            <Text style={styles.sectionStatLabel}>Lessons</Text>
            <Text style={styles.sectionStatValue}>{loading ? "--" : totalVideos}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color="#1E6EEB" />
            <Text style={styles.stateText}>Loading your library...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Unable to load videos</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!loading && !error ? (
          <FlatList
            data={seriesList}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item: series }) => {
              const seriesOpen = Boolean(expandedSeries[series.key]);

              return (
                <View style={styles.seriesCard}>
                  <Pressable style={styles.seriesHeader} onPress={() => toggleSeries(series.key)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.seriesTitle}>{series.title}</Text>
                      <Text style={styles.seriesMeta}>{series.sections.length} sections • {series.videoCount} lessons</Text>
                    </View>
                    <Text style={styles.chevron}>{seriesOpen ? "▾" : "▸"}</Text>
                  </Pressable>

                  {seriesOpen ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionsScroller}>
                      {series.sections.map((section) => {
                        const sectionOpen = Boolean(expandedSections[section.key]);

                        return (
                          <View key={section.key} style={styles.sectionCard}>
                            <Pressable style={styles.sectionHeader} onPress={() => toggleSection(section.key)}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text style={styles.sectionSubtitle}>{section.videos.length} lessons</Text>
                              </View>
                              <Text style={styles.chevronDark}>{sectionOpen ? "▾" : "▸"}</Text>
                            </Pressable>

                            {sectionOpen ? (
                              <View style={styles.sectionBody}>
                                {section.videos.map((video) => {
                                  const thumb = getThumbnailUrl(video);
                                  const videoUrl = getVideoUrl(video);

                                  return (
                                    <View key={video.id} style={styles.lessonRow}>
                                      {thumb ? <Image source={{ uri: thumb }} style={styles.thumb} resizeMode="cover" /> : null}
                                      <View style={styles.lessonCopy}>
                                        <Text style={styles.lessonTitle}>{video.title}</Text>
                                        <Text style={styles.lessonSubtitle}>{getSubtitle(video)}</Text>
                                        <View style={styles.lessonLinks}>
                                          <Pressable onPress={() => openExternalLink(videoUrl)} hitSlop={8}>
                                            <Text style={styles.link}>Watch</Text>
                                          </Pressable>
                                          <Pressable onPress={() => openExternalLink(getItemApiUrl(video))} hitSlop={8}>
                                            <Text style={styles.link}>API record</Text>
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
                      })}
                    </ScrollView>
                  ) : null}
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>No videos returned from the API yet.</Text>}
            showsVerticalScrollIndicator={false}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0F172A" },
  page: { flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  heroCard: { borderRadius: 18, backgroundColor: "#111827", padding: 18, marginBottom: 12, borderWidth: 1, borderColor: "#1F2937" },
  kicker: { color: "#60A5FA", fontSize: 12, letterSpacing: 1, fontWeight: "700", marginBottom: 6 },
  heroTitle: { color: "#F9FAFB", fontSize: 28, fontWeight: "700", marginBottom: 6 },
  heroDescription: { color: "#CBD5E1", fontSize: 14, lineHeight: 20, marginBottom: 10 },
  endpointButton: { borderWidth: 1, borderColor: "#334155", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: "#0B1220" },
  endpointLabel: { color: "#93C5FD", fontSize: 11, marginBottom: 3, textTransform: "uppercase", fontWeight: "700" },
  endpointLink: { color: "#BFDBFE", fontSize: 13, textDecorationLine: "underline" },
  statsCard: { borderRadius: 14, backgroundColor: "#111827", paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: "#1F2937", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statsLabel: { color: "#CBD5E1", fontSize: 14, fontWeight: "600" },
  statsValue: { color: "#F9FAFB", fontSize: 24, fontWeight: "700" },
  sectionStat: { alignItems: "flex-end" },
  sectionStatLabel: { color: "#CBD5E1", fontSize: 12, fontWeight: "600" },
  sectionStatValue: { color: "#F9FAFB", fontSize: 20, fontWeight: "700" },
  centeredState: { alignItems: "center", justifyContent: "center", marginTop: 30, gap: 10 },
  stateText: { color: "#94A3B8", fontSize: 14 },
  errorCard: { borderRadius: 14, backgroundColor: "#7F1D1D", borderColor: "#B91C1C", borderWidth: 1, padding: 14 },
  errorTitle: { color: "#FEE2E2", fontSize: 15, fontWeight: "700", marginBottom: 4 },
  errorText: { color: "#FECACA", fontSize: 13 },
  listContainer: { paddingBottom: 20, gap: 10 },
  seriesCard: { borderRadius: 14, backgroundColor: "#111827", borderWidth: 1, borderColor: "#1F2937", overflow: "hidden" },
  seriesHeader: { padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0B1220" },
  seriesTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "700" },
  seriesMeta: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  sectionsScroller: { padding: 12, gap: 10 },
  sectionCard: { width: 320, borderRadius: 12, borderWidth: 1, borderColor: "#334155", backgroundColor: "#0F172A", overflow: "hidden" },
  sectionHeader: { padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#E2E8F0" },
  sectionTitle: { color: "#0F172A", fontSize: 14, fontWeight: "700" },
  sectionSubtitle: { color: "#334155", fontSize: 12, marginTop: 2 },
  sectionBody: { padding: 10, gap: 10 },
  lessonRow: { flexDirection: "row", gap: 10, borderWidth: 1, borderColor: "#334155", borderRadius: 10, padding: 8, backgroundColor: "#111827" },
  thumb: { width: 84, height: 58, borderRadius: 6, backgroundColor: "#1F2937" },
  lessonCopy: { flex: 1 },
  lessonTitle: { color: "#F8FAFC", fontSize: 13, fontWeight: "700" },
  lessonSubtitle: { color: "#CBD5E1", fontSize: 11, marginTop: 2 },
  lessonLinks: { flexDirection: "row", gap: 10, marginTop: 6 },
  link: { color: "#60A5FA", fontSize: 12, textDecorationLine: "underline", fontWeight: "600" },
  chevron: { color: "#F8FAFC", fontSize: 18, fontWeight: "700", marginLeft: 8 },
  chevronDark: { color: "#0F172A", fontSize: 18, fontWeight: "700", marginLeft: 8 },
  empty: { marginTop: 6, color: "#94A3B8", textAlign: "center" },
});
