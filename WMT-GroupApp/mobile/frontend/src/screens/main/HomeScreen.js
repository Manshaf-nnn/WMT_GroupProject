import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../services/api';

const PRICE_FILTERS = ['All', '$', '$$', '$$$', '$$$$'];

const RestaurantCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.cardImagePlaceholder}>
      <Text style={styles.cardEmoji}>🍽</Text>
    </View>
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{item.priceRange}</Text>
        </View>
      </View>
      <Text style={styles.cardCuisine}>{item.cuisine}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardLocation}>📍 {item.location}</Text>
        {item.averageRating > 0 && (
          <Text style={styles.cardRating}>⭐ {item.averageRating.toFixed(1)}</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('All');
  const [error, setError] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      setError(null);
      const params = {};
      if (search) params.search = search;
      if (priceFilter !== 'All') params.priceRange = priceFilter;

      const { data } = await api.get('/restaurants', { params });
      setRestaurants(data);
    } catch (err) {
      setError('Could not load restaurants. Is your backend running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, priceFilter]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(fetchRestaurants, 400);
    return () => clearTimeout(timer);
  }, [fetchRestaurants]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRestaurants();
  }, [fetchRestaurants]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {error ? (
        <>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyTitle}>Connection Error</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </>
      ) : (
        <>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No Restaurants Found</Text>
          <Text style={styles.emptySubtitle}>Try a different search or filter</Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>LUXURY RESTAURANT</Text>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find your next luxury experience</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants..."
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Price Filters */}
      <View style={{ height: 80 }}>
        <FlatList
          data={PRICE_FILTERS}
          horizontal
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, priceFilter === item && styles.filterChipActive]}
              onPress={() => setPriceFilter(item)}
            >
              <Text style={[styles.filterText, priceFilter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Restaurant List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RestaurantCard 
              item={item} 
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item._id })} 
            />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={restaurants.length === 0 ? styles.emptyList : styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  brand: { fontSize: 11, fontWeight: '900', color: COLORS.primary, letterSpacing: 3, marginBottom: 6 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: 20, marginVertical: 12, borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.border, height: 52 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 15 },
  clearIcon: { color: COLORS.textSecondary, fontSize: 16, padding: 4 },
  filterList: { paddingHorizontal: 20, paddingVertical: 15, height: 75 },
  filterChip: { paddingHorizontal: 25, height: 45, borderRadius: 15, backgroundColor: COLORS.surface, marginRight: 12, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 14 },
  filterTextActive: { color: COLORS.background },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyList: { flex: 1, paddingHorizontal: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  cardImagePlaceholder: { height: 140, backgroundColor: '#1a2744', justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 48 },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  priceBadge: { backgroundColor: COLORS.primary + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.primary },
  priceText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  cardCuisine: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLocation: { color: COLORS.textSecondary, fontSize: 13 },
  cardRating: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.textSecondary, marginTop: 12, fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
});

export default HomeScreen;
