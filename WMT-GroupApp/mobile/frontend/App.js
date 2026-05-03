import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, useColorScheme, Text, Pressable } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Compass, Calendar as CalendarIcon, User, Search as SearchIcon, ShieldCheck } from 'lucide-react-native';

import { AuthProvider, useAuth } from './src/store/AuthContext';
import { ToastProvider } from './src/components/ui/Toast';
import { lightTheme, darkTheme, palette } from './src/theme';
import OfflineBanner from './src/components/OfflineBanner';
import ErrorBoundary from './src/components/ErrorBoundary';
import { hasOnboarded } from './src/services/storage';

import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

import HomeScreen from './src/screens/main/HomeScreen';
import SearchScreen from './src/screens/main/SearchScreen';
import RestaurantDetailScreen from './src/screens/main/RestaurantDetailScreen';
import BookingScreen from './src/screens/main/BookingScreen';
import BookingDetailScreen from './src/screens/main/BookingDetailScreen';
import MyBookingsScreen from './src/screens/main/MyBookingsScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import EditProfileScreen from './src/screens/main/EditProfileScreen';
import FavoritesScreen from './src/screens/main/FavoritesScreen';
import AddressesScreen from './src/screens/main/AddressesScreen';
import PaymentMethodsScreen from './src/screens/main/PaymentMethodsScreen';
import PaymentScreen from './src/screens/main/PaymentScreen';
import PaymentHistoryScreen from './src/screens/main/PaymentHistoryScreen';
import ReviewScreen from './src/screens/main/ReviewScreen';
import MyReviewsScreen from './src/screens/main/MyReviewsScreen';
import SettingsScreen from './src/screens/main/SettingsScreen';

import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import ManageRestaurantsScreen from './src/screens/admin/ManageRestaurantsScreen';
import ManageBookingsScreen from './src/screens/admin/ManageBookingsScreen';
import ManageUsersScreen from './src/screens/admin/ManageUsersScreen';
import ManageReviewsScreen from './src/screens/admin/ManageReviewsScreen';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Tabs = () => {
  const scheme = useColorScheme();
  const theme = scheme === 'light' ? lightTheme : darkTheme;
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
        tabBarStyle: {
          backgroundColor: theme.bgElevated,
          borderTopColor: theme.surfaceLine,
          borderTopWidth: 1,
          height: 80,
          paddingTop: 8,
          paddingBottom: 22
        },
        tabBarIcon: ({ color, focused }) => {
          const size = 22;
          if (route.name === 'Home') return <Compass size={size} color={color} strokeWidth={focused ? 2.2 : 1.6} />;
          if (route.name === 'SearchTab') return <SearchIcon size={size} color={color} strokeWidth={focused ? 2.2 : 1.6} />;
          if (route.name === 'Bookings') return <CalendarIcon size={size} color={color} strokeWidth={focused ? 2.2 : 1.6} />;
          if (route.name === 'Admin') return <ShieldCheck size={size} color={color} strokeWidth={focused ? 2.2 : 1.6} />;
          return <User size={size} color={color} strokeWidth={focused ? 2.2 : 1.6} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Discover' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} options={{ title: 'Reservations' }} />
      {user?.role === 'admin' ? (
        <Tab.Screen name="Admin" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
      ) : null}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const Root = () => {
  const { user, loading } = useAuth();
  const [onboarded, setOnboarded] = useState(null);
  const scheme = useColorScheme();
  const theme = scheme === 'light' ? lightTheme : darkTheme;

  useEffect(() => { hasOnboarded().then(setOnboarded); }, []);

  if (loading || onboarded === null) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.accent, fontSize: 12, letterSpacing: 4, fontWeight: '700', marginBottom: 16 }}>MAISON</Text>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  const navTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme : DefaultTheme).colors,
      background: theme.bg, card: theme.bgElevated, text: theme.text,
      border: theme.surfaceLine, primary: theme.accent
    }
  };

  return (
    <NavigationContainer theme={navTheme}>
      <OfflineBanner />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <RootStack.Group>
            {!onboarded ? <RootStack.Screen name="Onboarding" component={OnboardingScreen} /> : null}
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={RegisterScreen} />
            <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </RootStack.Group>
        ) : (
          <RootStack.Group>
            <RootStack.Screen name="Tabs" component={Tabs} />
            <RootStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
            <RootStack.Screen name="Booking" component={BookingScreen} />
            <RootStack.Screen name="BookingDetail" component={BookingDetailScreen} />
            <RootStack.Screen name="Payment" component={PaymentScreen} />
            <RootStack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
            <RootStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <RootStack.Screen name="Review" component={ReviewScreen} />
            <RootStack.Screen name="MyReviews" component={MyReviewsScreen} />
            <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
            <RootStack.Screen name="Favorites" component={FavoritesScreen} />
            <RootStack.Screen name="Addresses" component={AddressesScreen} />
            <RootStack.Screen name="Settings" component={SettingsScreen} />
            <RootStack.Screen name="SearchModal" component={SearchScreen} options={{ presentation: 'modal' }} />
            <RootStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <RootStack.Screen name="ManageRestaurants" component={ManageRestaurantsScreen} />
            <RootStack.Screen name="ManageBookings" component={ManageBookingsScreen} />
            <RootStack.Screen name="ManageUsers" component={ManageUsersScreen} />
            <RootStack.Screen name="ManageReviews" component={ManageReviewsScreen} />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <Root />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
