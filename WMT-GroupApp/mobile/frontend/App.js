import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from './src/theme/colors';
import { getCurrentUser, logout } from './src/services/authService';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import MyBookingsScreen from './src/screens/main/MyBookingsScreen';
import RestaurantDetailScreen from './src/screens/main/RestaurantDetailScreen';
import BookingScreen from './src/screens/main/BookingScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import ManageBookingsScreen from './src/screens/admin/ManageBookingsScreen';
import ManageRestaurantsScreen from './src/screens/admin/ManageRestaurantsScreen';
import ReviewScreen from './src/screens/main/ReviewScreen';
import PaymentHistoryScreen from './src/screens/main/PaymentHistoryScreen';
import SettingsScreen from './src/screens/main/SettingsScreen';
import MyReviewsScreen from './src/screens/main/MyReviewsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = ({ onSignOut }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => {
        let icon;
        if (route.name === 'Home') icon = '🔍';
        else if (route.name === 'Bookings') icon = '📋';
        else if (route.name === 'Profile') icon = '👤';
        return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icon}</Text>;
      },
      tabBarStyle: {
        backgroundColor: '#1E293B',
        borderTopWidth: 0,
        height: 70,
        paddingBottom: 15,
        paddingTop: 10,
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        borderRadius: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: '#94A3B8',
      tabBarLabelStyle: { fontWeight: '700', fontSize: 10 },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Discover' }} />
    <Tab.Screen name="Bookings" component={MyBookingsScreen} options={{ title: 'Reservations' }} />
    <Tab.Screen name="Profile">
      {(props) => <ProfileScreen {...props} onSignOut={onSignOut} />}
    </Tab.Screen>
  </Tab.Navigator>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = (userData) => {
    setUser(userData);
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onSignIn={handleSignIn} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => <RegisterScreen {...props} onSignIn={handleSignIn} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Main">
              {(props) => <MainTabs {...props} onSignOut={handleSignOut} />}
            </Stack.Screen>
            <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="ManageBookings" component={ManageBookingsScreen} />
            <Stack.Screen name="ManageRestaurants" component={ManageRestaurantsScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
