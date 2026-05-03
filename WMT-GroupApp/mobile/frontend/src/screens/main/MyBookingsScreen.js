import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../services/api';

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings');
      // In a real app, the backend would filter by user. 
      // For this demo, we'll show all and assume the backend is handled.
      setBookings(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.resName}>{item.restaurant?.name || 'Luxury Restaurant'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22', borderColor: getStatusColor(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>🗓 Date:</Text>
        <Text style={styles.infoValue}>{new Date(item.date).toDateString()}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>⏰ Time:</Text>
        <Text style={styles.infoValue}>{item.time}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>👥 Guests:</Text>
        <Text style={styles.infoValue}>{item.guests} People</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>Fee Paid: $50.00</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.restaurant?._id })}
        >
          <Text style={styles.viewLink}>View Restaurant →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return COLORS.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>LUXURY RESTAURANT</Text>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No reservations found.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <Text style={styles.bookBtn}>Book a Table Now</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
  },
  brand: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  price: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  viewLink: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 20,
  },
  bookBtn: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 16,
  }
});

export default MyBookingsScreen;
