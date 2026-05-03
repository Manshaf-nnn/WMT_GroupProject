import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Share } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, Clock, Users, MapPin, MessageSquare, X as XIcon, QrCode, CheckCircle2, Share2, Sparkles } from 'lucide-react-native';
import { useTheme, fontSize, space, radius, palette } from '../../theme';
import { ScreenContainer, Header, Card, Button, QRCode as QRCodeView, Skeleton } from '../../components/ui';
import { bookingApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export default function BookingDetailScreen({ route, navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { id, justBooked } = route.params || {};
  const [booking, setBooking] = useState(null);

  const load = useCallback(async () => {
    try { setBooking(await bookingApi.get(id)); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (justBooked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.show('Reservation confirmed.', 'success');
    }
  }, [justBooked]);

  const cancel = () => {
    Alert.alert('Cancel reservation?', 'This action cannot be undone.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel reservation', style: 'destructive',
        onPress: async () => {
          try {
            await bookingApi.cancel(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            toast.show('Reservation cancelled', 'success');
            load();
          } catch (err) { toast.show(friendlyError(err), 'error'); }
        }
      }
    ]);
  };

  const checkIn = async () => {
    try {
      await bookingApi.checkIn(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.show('Checked in. Enjoy your evening.', 'success');
      load();
    } catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  const inviteGroup = async () => {
    if (!booking) return;
    const code = booking.checkInCode;
    const link = `https://maison.app/join/${booking._id}?code=${code}`;
    await Share.share({ message: `Join me at ${booking.restaurant?.name} on ${new Date(booking.date).toLocaleDateString()} ${booking.time}. Code: ${code}\n${link}` });
  };

  const openMaps = () => {
    if (!booking) return;
    const q = encodeURIComponent(`${booking.restaurant?.address || booking.restaurant?.location || ''} ${booking.restaurant?.city || ''}`);
    Linking.openURL(`https://maps.apple.com/?q=${q}`).catch(() => Linking.openURL(`https://maps.google.com/?q=${q}`));
  };

  if (!booking) {
    return (
      <ScreenContainer>
        <Header title="Reservation" />
        <View style={{ padding: space.lg }}>
          <Skeleton height={220} br={radius.lg} style={{ marginBottom: space.lg }} />
          <Skeleton height={120} br={radius.lg} />
        </View>
      </ScreenContainer>
    );
  }

  const eventTime = new Date(booking.date);
  const minutesUntil = (eventTime.getTime() - Date.now()) / 60000;
  const checkInWindow = minutesUntil <= 30 && booking.status === 'approved' && !booking.checkedIn;
  const isPast = ['cancelled', 'rejected', 'completed'].includes(booking.status);

  return (
    <ScreenContainer>
      <Header title="Reservation" right={
        <Pressable onPress={inviteGroup} hitSlop={8}>
          <Share2 size={18} color={theme.text} />
        </Pressable>
      } />

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}>
        <Card padded={false} style={{ overflow: 'hidden', marginBottom: space.lg }}>
          <View>
            <ExpoImage source={{ uri: booking.restaurant?.heroImage || booking.restaurant?.images?.[0] }} style={{ width: '100%', height: 180 }} contentFit="cover" />
            <LinearGradient colors={['transparent', 'rgba(14,14,16,0.85)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: '40%' }} />
            <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
              <Text style={{ color: palette.gold, fontSize: fontSize.xs, letterSpacing: 1.4, fontWeight: '700', textTransform: 'uppercase' }}>
                {booking.restaurant?.cuisine}
              </Text>
              <Text style={{ color: '#fff', fontSize: fontSize.xxl, fontWeight: '900', marginTop: 2 }} numberOfLines={1}>
                {booking.restaurant?.name}
              </Text>
            </View>
          </View>
          <View style={{ padding: space.lg }}>
            <Row icon={<Calendar size={16} color={theme.accent} />} label="Date" value={eventTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} />
            <Row icon={<Clock size={16} color={theme.accent} />} label="Time" value={booking.time} />
            <Row icon={<Users size={16} color={theme.accent} />} label="Party" value={`${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}`} />
            <Row icon={<MapPin size={16} color={theme.accent} />} label="Address" value={booking.restaurant?.address || booking.restaurant?.location} onPress={openMaps} last />
            {booking.specialRequests ? (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: theme.surfaceMuted, borderRadius: radius.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <MessageSquare size={12} color={theme.textMuted} />
                  <Text style={{ marginLeft: 6, color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>
                    Notes
                  </Text>
                </View>
                <Text style={{ color: theme.textSoft, fontSize: fontSize.sm, lineHeight: 20 }}>{booking.specialRequests}</Text>
              </View>
            ) : null}
          </View>
        </Card>

        {!isPast ? (
          <Card style={{ marginBottom: space.lg, alignItems: 'center' }}>
            <Text style={{ color: theme.accent, letterSpacing: 1.6, fontSize: fontSize.xs, fontWeight: '700', textTransform: 'uppercase' }}>
              Check-in Code
            </Text>
            <Text style={{ color: theme.text, fontSize: fontSize.xxxl, fontWeight: '900', marginTop: 6, letterSpacing: 4 }}>
              {booking.checkInCode}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 4, textAlign: 'center' }}>
              Show this QR to your host on arrival.
            </Text>
            <View style={{ marginTop: space.lg }}>
              <QRCodeView value={`MAISON:${booking._id}:${booking.checkInCode}`} size={180} />
            </View>
            {checkInWindow ? (
              <Button label="Check in now" onPress={checkIn} variant="primary" style={{ marginTop: space.lg }} icon={<CheckCircle2 size={16} color={theme.textInverse} />} />
            ) : booking.checkedIn ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <CheckCircle2 size={14} color={theme.success} />
                <Text style={{ marginLeft: 6, color: theme.success, fontSize: fontSize.sm, fontWeight: '700' }}>Checked in</Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {!isPast && booking.totalAmount > 0 ? (
          <Button
            label={booking.depositPaid ? 'Pay Final Bill' : 'Pay Deposit'}
            onPress={() => navigation.navigate('Payment', {
              bookingId: id,
              type: booking.depositPaid ? 'full' : 'deposit',
              amount: booking.totalAmount,
              restaurantName: booking.restaurant?.name
            })}
            variant="primary"
            style={{ marginBottom: 12 }}
            icon={<Sparkles size={16} color={theme.textInverse} />}
          />
        ) : null}

        {!isPast ? (
          <Button
            label="Cancel reservation"
            onPress={cancel}
            variant="ghost"
            icon={<XIcon size={16} color={theme.danger} />}
            style={{ borderColor: theme.danger }}
          />
        ) : (
          <Button
            label="Leave a review"
            onPress={() => navigation.navigate('Review', { restaurantId: booking.restaurant?._id })}
            variant="primary"
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const Row = ({ icon, label, value, onPress, last }) => {
  const theme = useTheme();
  const Wrap = onPress ? Pressable : View;
  return (
    <Wrap onPress={onPress} style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.surfaceLine
    }}>
      <View style={{
        width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surfaceMuted,
        alignItems: 'center', justifyContent: 'center'
      }}>{icon}</View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>{label}</Text>
        <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '600', marginTop: 2 }}>{value}</Text>
      </View>
    </Wrap>
  );
};
