import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Calendar, Users, MessageSquare, Sparkles, Check } from 'lucide-react-native';
import { useTheme, fontSize, space, radius, formatCurrency } from '../../theme';
import { ScreenContainer, Header, Button, Stepper, Card, Tag, Skeleton } from '../../components/ui';
import { restaurantApi, bookingApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const TIMES = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

const buildDays = () => {
  const out = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0);
    out.push(d);
  }
  return out;
};

const OCCASIONS = [null, 'Anniversary', 'Birthday', 'Business', 'Date', 'Special'];

export default function BookingScreen({ route, navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { restaurantId } = route.params || {};

  const [restaurant, setRestaurant] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState(null);
  const [requests, setRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const days = useMemo(buildDays, []);

  useEffect(() => {
    restaurantApi.get(restaurantId).then(setRestaurant).catch((e) => toast.show(friendlyError(e), 'error'));
  }, [restaurantId]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const totalAmount = restaurant?.depositRequired ? restaurant.depositAmount : 0;
      const booking = await bookingApi.create({
        restaurant: restaurantId,
        date: date.toISOString(),
        time,
        guests,
        specialRequests: requests,
        occasion,
        totalAmount
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (restaurant?.depositRequired) {
        navigation.replace('Payment', { bookingId: booking._id, type: 'deposit', amount: restaurant.depositAmount, restaurantName: restaurant.name });
      } else {
        navigation.replace('BookingDetail', { id: booking._id, justBooked: true });
      }
    } catch (err) {
      toast.show(friendlyError(err, 'Could not create booking'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!restaurant) {
    return (
      <ScreenContainer>
        <Header title="Reservation" />
        <View style={{ padding: space.lg }}>
          <Skeleton height={120} br={radius.lg} style={{ marginBottom: space.lg }} />
          <Skeleton height={80} br={radius.lg} style={{ marginBottom: space.lg }} />
          <Skeleton height={200} br={radius.lg} />
        </View>
      </ScreenContainer>
    );
  }

  const monthLabel = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <ScreenContainer>
      <Header title="Reservation" subtitle={restaurant.name} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 140 }}>
          <Card padded={false} style={{ overflow: 'hidden', marginBottom: space.xl }}>
            <ExpoImage source={{ uri: restaurant.heroImage }} style={{ width: '100%', height: 110 }} contentFit="cover" />
            <View style={{ padding: space.lg }}>
              <Text style={{ color: theme.accent, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' }}>{restaurant.cuisine}</Text>
              <Text style={{ color: theme.text, fontSize: fontSize.xl, fontWeight: '900', marginTop: 2 }}>{restaurant.name}</Text>
              <Text style={{ color: theme.textMuted, fontSize: fontSize.sm, marginTop: 4 }}>{restaurant.location}</Text>
            </View>
          </Card>

          <Section title="When">
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginBottom: 8, letterSpacing: 1.2, fontWeight: '700' }}>{monthLabel.toUpperCase()}</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={days}
              keyExtractor={(d) => d.toISOString()}
              ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
              renderItem={({ item }) => {
                const same = item.toDateString() === date.toDateString();
                return (
                  <Pressable
                    onPress={() => { Haptics.selectionAsync().catch(() => {}); setDate(item); }}
                    style={{
                      width: 56, paddingVertical: 12, alignItems: 'center', borderRadius: radius.md,
                      backgroundColor: same ? theme.primary : theme.surface,
                      borderWidth: 1, borderColor: same ? theme.primary : theme.surfaceLine
                    }}
                  >
                    <Text style={{ color: same ? theme.textInverse : theme.textMuted, fontSize: 11, letterSpacing: 1, fontWeight: '700' }}>
                      {item.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}
                    </Text>
                    <Text style={{ color: same ? theme.textInverse : theme.text, fontSize: fontSize.xl, fontWeight: '800', marginTop: 4 }}>
                      {item.getDate()}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Section>

          <Section title="Time">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {TIMES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => { Haptics.selectionAsync().catch(() => {}); setTime(t); }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.full,
                    backgroundColor: time === t ? theme.primary : theme.surface,
                    borderWidth: 1, borderColor: time === t ? theme.primary : theme.surfaceLine
                  }}
                >
                  <Text style={{ color: time === t ? theme.textInverse : theme.text, fontSize: fontSize.sm, fontWeight: '700' }}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Section>

          <Section title="Party size">
            <View style={{ alignItems: 'center', paddingVertical: space.md }}>
              <Stepper value={guests} onChange={setGuests} min={1} max={20} />
              <Text style={{ marginTop: 8, color: theme.textMuted, fontSize: fontSize.xs }}>
                Larger parties may be split across two tables.
              </Text>
            </View>
          </Section>

          <Section title="Occasion">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {OCCASIONS.map((o) => (
                <Tag key={o || 'none'} label={o || 'None'} active={occasion === o} onPress={() => setOccasion(o)} />
              ))}
            </View>
          </Section>

          <Section title="Special requests">
            <View style={{
              backgroundColor: theme.surface, borderRadius: radius.md, borderWidth: 1, borderColor: theme.surfaceLine,
              padding: 14
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MessageSquare size={14} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.2, marginLeft: 6, fontWeight: '700', textTransform: 'uppercase' }}>
                  Optional note
                </Text>
              </View>
              <TextArea value={requests} onChangeText={setRequests} placeholder="Allergies, seating preferences, anything else…" />
            </View>
          </Section>

          {restaurant.depositRequired ? (
            <Card style={{ marginTop: space.xl, borderColor: theme.accent }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles size={16} color={theme.accent} />
                <Text style={{ marginLeft: 8, color: theme.accent, fontSize: fontSize.xs, letterSpacing: 1.2, fontWeight: '700', textTransform: 'uppercase' }}>
                  Deposit required
                </Text>
              </View>
              <Text style={{ color: theme.text, fontSize: fontSize.md, marginTop: 8, lineHeight: 22 }}>
                A {formatCurrency(restaurant.depositAmount)} deposit secures your table.
                It is fully credited toward your bill on the night.
              </Text>
            </Card>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: space.lg, paddingBottom: 30, backgroundColor: theme.bg,
        borderTopWidth: 1, borderTopColor: theme.surfaceLine
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>
              {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {time}
            </Text>
            <Text style={{ color: theme.text, fontSize: fontSize.lg, fontWeight: '800' }}>
              {guests} {guests === 1 ? 'guest' : 'guests'}
            </Text>
          </View>
          {restaurant.depositRequired ? (
            <Text style={{ color: theme.accent, fontSize: fontSize.lg, fontWeight: '900' }}>
              {formatCurrency(restaurant.depositAmount)}
            </Text>
          ) : null}
        </View>
        <Button
          label={restaurant.depositRequired ? 'Continue to Payment' : 'Confirm Reservation'}
          onPress={submit}
          loading={submitting}
          variant="dark"
          size="lg"
          haptic="success"
          icon={!submitting ? <Check size={16} color={theme.textInverse} /> : undefined}
        />
      </View>
    </ScreenContainer>
  );
}

const Section = ({ title, children }) => {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: space.xl }}>
      <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800', marginBottom: space.md }}>{title}</Text>
      {children}
    </View>
  );
};

import { TextInput } from 'react-native';
const TextArea = ({ value, onChangeText, placeholder }) => {
  const theme = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.textMuted}
      multiline
      numberOfLines={3}
      maxLength={300}
      style={{ minHeight: 70, color: theme.text, fontSize: fontSize.md, textAlignVertical: 'top' }}
    />
  );
};
