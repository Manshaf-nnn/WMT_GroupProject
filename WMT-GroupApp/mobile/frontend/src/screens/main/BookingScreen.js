import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../../theme/colors';
import api from '../../services/api';
import CustomButton from '../../components/CustomButton';

const BookingScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const restaurantId = restaurant?._id;
  const restaurantName = restaurant?.name || 'Luxury Restaurant';
  const restaurantLocation = restaurant?.location || 'Downtown';

  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Card details state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const validateCard = () => {
    if (!cardName || !cardNumber || !expiry || !cvv) {
      Alert.alert('Incomplete Details', 'Please fill in all card details.');
      return false;
    }
    if (cardNumber.length < 16) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
      return false;
    }
    if (!expiry.includes('/')) {
      Alert.alert('Invalid Expiry', 'Please use the MM/YY format.');
      return false;
    }
    if (cvv.length < 3) {
      Alert.alert('Invalid CVV', 'CVV must be at least 3 digits.');
      return false;
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (!date) {
      Alert.alert('Date Required', 'Please select a date for your reservation.');
      return;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate < today) {
      Alert.alert('Invalid Date', 'You cannot book a table in the past!');
      return;
    }
    if (!time) {
      Alert.alert('Time Required', 'Please select a time.');
      return;
    }
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    if (!validateCard()) return;

    setLoading(true);
    try {
      await api.post('/bookings', {
        restaurant: restaurantId,
        date,
        time,
        guests: parseInt(guests)
      });
      setStep(3);
    } catch (error) {
      Alert.alert('Booking Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>✨</Text>
        <Text style={styles.successTitle}>Reservation Confirmed!</Text>
        <Text style={styles.successSub}>Your table at {restaurantName} is secured.</Text>
        <CustomButton title="View My Bookings" onPress={() => navigation.navigate('Main', { screen: 'Bookings' })} />
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.textSecondary }}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)}>
          <Text style={styles.backBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === 1 ? 'New Reservation' : 'Secure Payment'}</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.resCard}>
          <Text style={styles.resName}>{restaurantName}</Text>
          <Text style={styles.resLoc}>📍 {restaurantLocation}</Text>
        </View>

        {step === 1 ? (
          <>
            <Text style={styles.label}>Number of Guests</Text>
            <View style={styles.guestContainer}>
              {['1', '2', '4', '6', '8+'].map(num => (
                <TouchableOpacity 
                  key={num} 
                  style={[styles.guestBtn, guests === num && styles.guestBtnActive]}
                  onPress={() => setGuests(num)}
                >
                  <Text style={[styles.guestText, guests === num && styles.guestTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Select Date</Text>
            <View style={styles.datePickerContainer}>
              <input 
                type="date" 
                style={{
                  width: '100%', padding: '18px', borderRadius: '16px', backgroundColor: '#0F172A',
                  color: '#FFFFFF', border: '1px solid #334155', fontSize: '16px', outline: 'none'
                }}
                onChange={(e) => setDate(e.target.value)}
              />
            </View>

            <Text style={styles.label}>Preferred Time</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g., 19:30"
              placeholderTextColor="#666"
              value={time}
              onChangeText={setTime}
            />
            <CustomButton title="Proceed to Payment" onPress={handleProceedToPayment} />
          </>
        ) : (
          <View>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput style={styles.input} placeholder="John Doe" value={cardName} onChangeText={setCardName} placeholderTextColor="#666" />
            <Text style={styles.label}>Card Number</Text>
            <TextInput style={styles.input} placeholder="1234123412341234" value={cardNumber} onChangeText={setCardNumber} placeholderTextColor="#666" keyboardType="numeric" maxLength={16} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Expiry</Text>
                <TextInput style={styles.input} placeholder="MM/YY" value={expiry} onChangeText={setExpiry} placeholderTextColor="#666" maxLength={5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CVV</Text>
                <TextInput style={styles.input} placeholder="123" value={cvv} onChangeText={setCvv} placeholderTextColor="#666" secureTextEntry maxLength={4} />
              </View>
            </View>
            <Text style={styles.paymentSummary}>Total Due: $50.00</Text>
            {loading ? (
              <ActivityIndicator color={COLORS.primary} size="large" />
            ) : (
              <CustomButton title="Confirm & Pay" onPress={handleConfirmBooking} />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  backBtn: { fontSize: 24, color: COLORS.text, fontWeight: '300' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  content: { padding: 20 },
  resCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: COLORS.primary },
  resName: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  resLoc: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  label: { color: COLORS.text, fontWeight: '700', marginBottom: 12, fontSize: 15 },
  datePickerContainer: { marginBottom: 24 },
  guestContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  guestBtn: { width: 55, height: 55, borderRadius: 16, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  guestBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  guestText: { color: COLORS.textSecondary, fontWeight: '800' },
  guestTextActive: { color: COLORS.background },
  input: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, color: COLORS.text, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  paymentSummary: { fontSize: 18, fontWeight: '900', color: COLORS.primary, textAlign: 'center', marginVertical: 20 },
  successContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 40 },
  successEmoji: { fontSize: 80, marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 10 },
  successSub: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 40 }
});

export default BookingScreen;
