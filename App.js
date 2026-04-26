import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { API_BASE_URL, getVideos } from "./api/api";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getVideos()
      .then((res) => {
        setVideos(res.data);
      })
      .catch((err) => {
        const details = err?.response?.data || err.message;
        setError(`Could not load videos from ${API_BASE_URL}/videos/. ${JSON.stringify(details)}`);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>DRF Endpoint: {API_BASE_URL}/videos/</Text>

      {loading && <ActivityIndicator size="large" />}

      {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error ? (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No data returned from API.</Text>}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    fontSize: 14,
    marginBottom: 16,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 16,
  },
  empty: {
    marginTop: 16,
  },
  error: {
    color: "#b00020",
    fontSize: 14,
  },
});
