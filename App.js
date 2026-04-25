import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import axios from "axios";

export default function App() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/videos/") // adjust if needed
      .then(res => {
        console.log(res.data);
        setVideos(res.data);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <View style={{ marginTop: 50 }}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.title}</Text>
        )}
      />
    </View>
  );
}