import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../services/api';

const ManageBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}`, { status });
      Alert.alert('Success', `Booking ${status}`);
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.resName}>{item.restaurant?.name || 'Unknown'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22', borderColor: getStatusColor(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>User:</Text>
        <Text style={styles.detailValue}>{item.user?.name || 'Unknown'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Date:</Text>
        <Text style={styles.detailValue}>{new Date(item.date).toDateString()} at {item.time}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Guests:</Text>
        <Text style={styles.detailValue}>{item.guests}</Text>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.btn, styles.rejectBtn]} 
            onPress={() => updateStatus(item._id, 'rejected')}
          >
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btn, styles.approveBtn]} 
            onPress={() => updateStatus(item._id, 'approved')}
          >
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'pending': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Requests</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No booking requests yet</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
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
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    width: 60,
    fontSize: 14,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  approveBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  rejectBtnText: {
    color: '#EF4444',
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  }
});

export default ManageBookingsScreen;
