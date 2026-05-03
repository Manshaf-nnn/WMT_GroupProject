import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { getCurrentUser } from '../../services/authService';
import CustomButton from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = ({ onSignOut }) => {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const load = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    load();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: onSignOut },
      ]
    );
  };

  const MENU_ITEMS = [
    { icon: '📋', label: 'My Bookings', subtitle: 'View your reservation history', route: 'Bookings' },
    { icon: '💳', label: 'Payment History', subtitle: 'View your past transactions', route: 'PaymentHistory' },
    { icon: '⭐', label: 'My Reviews', subtitle: 'Manage your restaurant reviews', route: 'MyReviews' },
    { icon: '⚙️', label: 'Settings', subtitle: 'App preferences', route: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>LUXURY RESTAURANT</Text>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'Loading...'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'admin' ? '👑 ADMIN' : '✨ MEMBER'}
            </Text>
          </View>
          
          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={styles.adminLink} 
              onPress={() => navigation.navigate('AdminDashboard')}
            >
              <Text style={styles.adminLinkText}>Go to Admin Panel →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => item.route ? navigation.navigate(item.route) : Alert.alert('Coming Soon', 'This feature will be available in the next update.')}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <CustomButton
            title="Sign Out"
            variant="secondary"
            onPress={onSignOut}
          />
        </View>

        <Text style={styles.version}>Luxury Restaurant v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
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
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.background,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  roleBadge: {
    backgroundColor: COLORS.primary + '22',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  adminLink: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#D4AF3715',
    borderRadius: 12,
  },
  adminLinkText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  menuArrow: {
    fontSize: 22,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  signOutContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  version: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 30,
  },
});

export default ProfileScreen;
