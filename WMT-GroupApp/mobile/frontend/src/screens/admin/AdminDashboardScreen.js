import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../services/api';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    pendingBookings: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In a real app, you'd have a specific stats endpoint
      // For now, we simulate by fetching all restaurants and bookings
      const [res, book] = await Promise.all([
        api.get('/restaurants'),
        api.get('/bookings')
      ]);
      
      const pending = book.data.filter(b => b.status === 'pending').length;
      
      setStats({
        totalRestaurants: res.data.length,
        pendingBookings: pending,
        totalBookings: book.data.length
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const ADMIN_MENU = [
    { label: 'Manage Restaurants', icon: '🏢', route: 'ManageRestaurants' },
    { label: 'Booking Requests', icon: '📩', route: 'ManageBookings', badge: stats.pendingBookings },
    { label: 'System Analytics', icon: '📊', route: null },
    { label: 'App Settings', icon: '⚙️', route: null },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.brand}>ADMIN PANEL</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalRestaurants}</Text>
            <Text style={styles.statLabel}>Restaurants</Text>
          </View>
          <View style={[styles.statCard, { borderColor: COLORS.primary }]}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.pendingBookings}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          {ADMIN_MENU.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.actionItem}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>{item.icon}</Text>
                <Text style={styles.actionLabel}>{item.label}</Text>
              </View>
              <View style={styles.actionRight}>
                {item.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Switch to User View</Text>
        </TouchableOpacity>
      </ScrollView>
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
  header: {
    padding: 24,
  },
  brand: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 12,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: '900',
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  }
});

export default AdminDashboardScreen;
