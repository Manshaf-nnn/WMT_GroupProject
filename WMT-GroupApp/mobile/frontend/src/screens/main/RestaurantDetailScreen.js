import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../services/api';
import CustomButton from '../../components/CustomButton';

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchDetails();
  }, [restaurantId]);

  const fetchDetails = async () => {
    try {
      const [resDetail, resReviews] = await Promise.all([
        api.get(`/restaurants/${restaurantId}`),
        api.get(`/reviews/${restaurantId}`)
      ]);
      setRestaurant(resDetail.data);
      setReviews(resReviews.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.heroEmoji}>🏰</Text>
          </View>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.cuisine}>{restaurant.cuisine} • {restaurant.priceRange}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {restaurant.averageRating?.toFixed(1) || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.locationText}>📍 {restaurant.location}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{restaurant.description || 'Experience the finest luxury dining in a sophisticated atmosphere.'}</Text>

          <View style={styles.divider} />

          {/* Reviews Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guest Reviews</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Review', { 
                restaurantId: restaurant._id, 
                restaurantName: restaurant.name 
              })}
            >
              <Text style={styles.addReviewText}>+ Write Review</Text>
            </TouchableOpacity>
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet. Be the first to share your experience!</Text>
          ) : (
            reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.user?.name || 'Anonymous'}</Text>
                  <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Booking CTA */}
      <View style={styles.footer}>
        <CustomButton 
          title="Reserve a Table" 
          onPress={() => navigation.navigate('Booking', { restaurant })} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  hero: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#1a2744',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 80,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: COLORS.background,
    marginTop: -32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
  },
  cuisine: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  ratingBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ratingText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  locationRow: {
    marginTop: 12,
  },
  locationText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addReviewText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  reviewCount: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    color: COLORS.text,
    fontWeight: '700',
  },
  reviewRating: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  reviewComment: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  noReviews: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  }
});

export default RestaurantDetailScreen;
