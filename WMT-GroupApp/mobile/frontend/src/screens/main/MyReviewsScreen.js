import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../services/api';

const MyReviewsScreen = ({ navigation }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const { data } = await api.get('/reviews/my');
      setReviews(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.resName}>{item.restaurant?.name || 'Luxury Dining'}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.date}>{new Date().toDateString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Reviews</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.empty}>You haven't posted any reviews yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { width: 45, height: 45, borderRadius: 22, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: COLORS.border },
  backIcon: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  rating: { color: COLORS.primary, fontWeight: '800' },
  comment: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  date: { color: COLORS.textSecondary, fontSize: 11, opacity: 0.6 },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 }
});

export default MyReviewsScreen;
