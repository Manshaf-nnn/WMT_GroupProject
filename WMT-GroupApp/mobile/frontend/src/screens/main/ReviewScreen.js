import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../services/api';
import CustomButton from '../../components/CustomButton';

const ReviewScreen = ({ route, navigation }) => {
  const { restaurantId, restaurantName } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (comment.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please provide a more detailed experience (at least 10 characters).');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reviews', {
        restaurant: restaurantId,
        rating,
        comment
      });
      Alert.alert('Thank You', 'Your review has been posted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subText}>How was your experience at</Text>
        <Text style={styles.resName}>{restaurantName}</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity key={num} onPress={() => setRating(num)}>
              <Text style={[styles.star, { opacity: num <= rating ? 1 : 0.3 }]}>⭐</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.ratingText}>{rating}/5</Text>
        </View>

        <Text style={styles.label}>Your Thoughts</Text>
        <TextInput
          style={styles.input}
          placeholder="What did you love? Any recommendations?"
          placeholderTextColor="#666"
          multiline
          value={comment}
          onChangeText={setComment}
        />

        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" />
        ) : (
          <CustomButton title="Post Review" onPress={handleSubmit} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { fontSize: 24, color: COLORS.text },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  content: { padding: 30, flex: 1 },
  subText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 8 },
  resName: { color: COLORS.text, fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 40 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  star: { fontSize: 32, marginHorizontal: 4 },
  ratingText: { color: COLORS.primary, fontSize: 18, fontWeight: '800', marginLeft: 12 },
  label: { color: COLORS.text, fontWeight: '700', marginBottom: 16, fontSize: 16 },
  input: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, color: COLORS.text, fontSize: 16, height: 160, marginBottom: 40, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border }
});

export default ReviewScreen;
