import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import {Image} from "expo-image";
import { useAuthStore } from '../../store/authStore';
import styles from "../../assets/styles/home.styles";
import { API_URL } from "../../constants/api";

export default function Home() {
  const {token}= useAuthStore();
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true); 
  const [loading, setLoading] = useState(true);


  const fetchBooks= async(pageNum=1, refresh=false)=>{
    try {
      console.log("Fetching with token:", token);
      if(refresh) setRefreshing(true);
      else if(pageNum===1) setLoading(true);

      const response = await fetch(`${API_URL}/books?page=${pageNum}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch books");
      
      setBooks((prevBooks) => [...prevBooks, ...data.books]);

      setHasMore(pageNum<data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.log("Error fetching books", error);
    }finally{
      if(refresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(()=>{
    fetchBooks();
  },[])
  const handleLoadMore = async () => {};

  const renderItem=({item})=>{
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image source={{uri: item.user.profileImage}} style={styles.avatar}/>
          <Text style={styles.username}>{item.username}</Text>
        </View>
      </View>

      <View style={styles.bookImageContainer}>
        <Image source={item.image} style={styles.bookImage} contentFit="cover"/>
      </View>
    </View>


  };
  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

}
