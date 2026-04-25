import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getVideos } from "../api/api";

export default function HomeScreen() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getVideos()
      .then(res => setVideos(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
        </View>
      )}
    />
  );
}