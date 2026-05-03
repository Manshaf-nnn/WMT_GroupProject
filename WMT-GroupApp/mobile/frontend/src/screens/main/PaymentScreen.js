import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CreditCard, Plus, Lock, Check, Users, Sparkles } from 'lucide-react-native';
import { useTheme, fontSize, space, radius, formatCurrency } from '../../theme';
import { ScreenContainer, Header, Button, Card, Tag, Skeleton, Stepper } from '../../components/ui';
import { paymentApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../store/AuthContext';

export default function PaymentScreen({ route, navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { reload } = useAuth();
  const { bookingId, type = 'full', amount = 0, restaurantName } = route.params || {};

  const [methods, setMethods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [tip, setTip] = useState(0);
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitWith, setSplitWith] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  // Add card form
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');

  const load = async () => {
    try {
      const m = await paymentApi.methods();
      setMethods(m);
      const def = m.find((x) => x.isDefault) || m[0];
      setSelected(def?._id || null);
    } catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const tipPresets = [0, 0.15, 0.18, 0.20];
  const total = amount + tip;
  const splitAmount = useMemo(() => splitOpen ? +(total / splitWith).toFixed(2) : total, [total, splitWith, splitOpen]);

  const submitAdd = async () => {
    if (number.replace(/\D/g, '').length < 12) return toast.show('Enter a valid card number', 'error');
    if (!holder.trim()) return toast.show('Enter cardholder name', 'error');
    const [em, ey] = exp.split('/');
    if (!em || !ey) return toast.show('Enter expiry MM/YY', 'error');
    try {
      await paymentApi.addMethod({
        number, holder, expMonth: Number(em), expYear: 2000 + Number(ey),
        isDefault: methods.length === 0
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.show('Card added', 'success');
      setShowAdd(false);
      setNumber(''); setHolder(''); setExp(''); setCvc('');
      load();
    } catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  const setDefault = async (id) => {
    try { await paymentApi.setDefault(id); load(); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  const removeMethod = async (id) => {
    Alert.alert('Remove card?', 'You can re-add it later.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try { await paymentApi.removeMethod(id); toast.show('Card removed', 'info'); load(); }
        catch (err) { toast.show(friendlyError(err), 'error'); }
      }}
    ]);
  };

  const pay = async () => {
    if (!selected && methods.length > 0) return toast.show('Select a card', 'info');
    if (methods.length === 0) return setShowAdd(true);
    setSubmitting(true);
    try {
      const splits = splitOpen ? Array.from({ length: splitWith }).map((_, i) => ({
        name: i === 0 ? 'You' : `Guest ${i + 1}`,
        amount: splitAmount,
        paid: i === 0
      })) : [];
      await paymentApi.pay({ bookingId, methodId: selected, amount: splitOpen ? splitAmount : amount, tip, type, splits });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      reload?.();
      toast.show('Payment confirmed', 'success');
      navigation.replace('BookingDetail', { id: bookingId });
    } catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <ScreenContainer>
      <Header title={type === 'deposit' ? 'Reservation Deposit' : 'Payment'} subtitle={restaurantName} />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 200 }}>
        <Card style={{ marginBottom: space.lg }}>
          <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.4, fontWeight: '700' }}>
            {type === 'deposit' ? 'DEPOSIT' : 'AMOUNT'}
          </Text>
          <Text style={{ color: theme.text, fontSize: 36, fontWeight: '900', marginTop: 4 }}>
            {formatCurrency(splitOpen ? splitAmount : total)}
          </Text>
          {tip > 0 ? (
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 4 }}>
              Includes {formatCurrency(tip)} tip
            </Text>
          ) : null}
          {splitOpen ? (
            <Text style={{ color: theme.accent, fontSize: fontSize.xs, marginTop: 4, fontWeight: '700' }}>
              Split between {splitWith} · {formatCurrency(total)} total
            </Text>
          ) : null}
        </Card>

        {type !== 'deposit' ? (
          <Card style={{ marginBottom: space.lg }}>
            <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800', marginBottom: 8 }}>Add tip</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {tipPresets.map((p) => (
                <Tag
                  key={p}
                  label={p === 0 ? 'No tip' : `${Math.round(p * 100)}% (${formatCurrency(amount * p)})`}
                  active={tip === amount * p}
                  onPress={() => setTip(amount * p)}
                />
              ))}
            </View>
          </Card>
        ) : null}

        <Card style={{ marginBottom: space.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }}>Split the bill</Text>
            <Pressable onPress={() => setSplitOpen((s) => !s)} style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
              backgroundColor: splitOpen ? theme.accent : theme.surfaceMuted
            }}>
              <Text style={{ color: splitOpen ? theme.textInverse : theme.text, fontSize: fontSize.xs, fontWeight: '700' }}>
                {splitOpen ? 'On' : 'Off'}
              </Text>
            </Pressable>
          </View>
          {splitOpen ? (
            <View style={{ alignItems: 'center', paddingTop: 8 }}>
              <Stepper value={splitWith} onChange={setSplitWith} min={2} max={10} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Users size={12} color={theme.textMuted} />
                <Text style={{ marginLeft: 6, color: theme.textMuted, fontSize: fontSize.xs }}>
                  Each pays {formatCurrency(splitAmount)}
                </Text>
              </View>
            </View>
          ) : null}
        </Card>

        <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800', marginBottom: space.md }}>Payment method</Text>
        {loading ? <Skeleton height={80} br={radius.md} /> : (
          <>
            {methods.map((m) => (
              <Pressable
                key={m._id}
                onPress={() => { Haptics.selectionAsync().catch(() => {}); setSelected(m._id); }}
                style={{
                  marginBottom: 8,
                  padding: space.md, borderRadius: radius.md,
                  borderWidth: 1.5, borderColor: selected === m._id ? theme.accent : theme.surfaceLine,
                  backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'center'
                }}
              >
                <View style={{
                  width: 36, height: 24, borderRadius: 4, backgroundColor: theme.surfaceMuted,
                  alignItems: 'center', justifyContent: 'center', marginRight: 12
                }}>
                  <Text style={{ color: theme.text, fontSize: 9, letterSpacing: 1, fontWeight: '900' }}>
                    {(m.brand || 'CARD').toUpperCase().slice(0, 4)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '700' }}>•••• {m.last4}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>
                    {m.holder} · expires {String(m.expMonth).padStart(2, '0')}/{String(m.expYear).slice(-2)}
                    {m.isDefault ? ' · Default' : ''}
                  </Text>
                </View>
                {selected === m._id ? <Check size={16} color={theme.accent} /> : null}
                <Pressable onPress={() => removeMethod(m._id)} style={{ marginLeft: 12 }} hitSlop={6}>
                  <Text style={{ color: theme.danger, fontSize: fontSize.xs, fontWeight: '700' }}>Remove</Text>
                </Pressable>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowAdd((v) => !v)}
              style={{
                padding: space.md, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed',
                borderColor: theme.surfaceLine, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'
              }}
            >
              <Plus size={14} color={theme.accent} />
              <Text style={{ marginLeft: 6, color: theme.accent, fontSize: fontSize.sm, fontWeight: '700' }}>
                {showAdd ? 'Hide form' : 'Add card'}
              </Text>
            </Pressable>
          </>
        )}

        {showAdd ? (
          <Card style={{ marginTop: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Lock size={14} color={theme.textMuted} />
              <Text style={{ marginLeft: 6, color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' }}>
                Test card · no real charges
              </Text>
            </View>
            <Field label="Card number" value={number} onChangeText={setNumber} placeholder="4242 4242 4242 4242" keyboardType="number-pad" maxLength={19} />
            <Field label="Cardholder" value={holder} onChangeText={setHolder} placeholder="As printed on card" autoCapitalize="words" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><Field label="Expiry" value={exp} onChangeText={setExp} placeholder="MM/YY" maxLength={5} /></View>
              <View style={{ flex: 1 }}><Field label="CVC" value={cvc} onChangeText={setCvc} placeholder="123" keyboardType="number-pad" maxLength={4} /></View>
            </View>
            <Button label="Save card" onPress={submitAdd} variant="primary" />
          </Card>
        ) : null}
      </ScrollView>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: space.lg, paddingBottom: 30,
        backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.surfaceLine
      }}>
        <Button
          label={`Pay ${formatCurrency(splitOpen ? splitAmount : total)}`}
          onPress={pay}
          loading={submitting}
          variant="dark" size="lg" haptic="success"
          icon={<Sparkles size={16} color={theme.textInverse} />}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
          <Lock size={10} color={theme.textMuted} />
          <Text style={{ marginLeft: 6, color: theme.textMuted, fontSize: 11 }}>
            Secured · simulated test environment
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const Field = ({ label, ...rest }) => {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        {...rest}
        placeholderTextColor={theme.textMuted}
        autoCapitalize={rest.autoCapitalize || 'none'}
        autoCorrect={false}
        style={{
          backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceLine,
          padding: 12, borderRadius: radius.md, color: theme.text, fontSize: fontSize.md
        }}
      />
    </View>
  );
};
