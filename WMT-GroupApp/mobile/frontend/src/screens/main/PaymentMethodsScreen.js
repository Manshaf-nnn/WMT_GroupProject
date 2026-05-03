import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CreditCard, Plus, Trash2, Star, Lock } from 'lucide-react-native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Card, Button, EmptyState, Skeleton } from '../../components/ui';
import { paymentApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export default function PaymentMethodsScreen() {
  const theme = useTheme();
  const toast = useToast();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [exp, setExp] = useState('');

  const load = useCallback(async () => {
    try { setMethods(await paymentApi.methods()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const add = async () => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 12) return toast.show('Enter a valid card number', 'error');
    if (!holder.trim()) return toast.show('Enter cardholder name', 'error');
    const [em, ey] = exp.split('/');
    if (!em || !ey) return toast.show('Expiry as MM/YY', 'error');
    try {
      await paymentApi.addMethod({
        number: cleaned, holder, expMonth: Number(em), expYear: 2000 + Number(ey),
        isDefault: methods.length === 0
      });
      toast.show('Card saved', 'success'); setShowAdd(false); setNumber(''); setHolder(''); setExp(''); load();
    } catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  const remove = (m) => {
    Alert.alert('Remove card?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try { await paymentApi.removeMethod(m._id); toast.show('Removed', 'info'); load(); }
        catch (err) { toast.show(friendlyError(err), 'error'); }
      }}
    ]);
  };

  const setDefault = async (id) => {
    try { await paymentApi.setDefault(id); toast.show('Default updated', 'success'); load(); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  return (
    <ScreenContainer>
      <Header title="Payment methods" right={
        <Pressable onPress={() => setShowAdd((v) => !v)} hitSlop={6}>
          <Plus size={20} color={theme.accent} />
        </Pressable>
      } />
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}>
        {loading ? <Skeleton height={88} br={radius.md} /> : methods.length === 0 && !showAdd ? (
          <EmptyState
            icon={<CreditCard size={28} color={theme.textMuted} />}
            title="No saved cards"
            message="Add a card to make checkout instant."
            action={<Button label="Add card" onPress={() => setShowAdd(true)} />}
          />
        ) : (
          methods.map((m) => (
            <Card key={m._id} style={{ marginBottom: 10, padding: space.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 44, height: 28, borderRadius: 6, backgroundColor: theme.surfaceMuted,
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Text style={{ color: theme.text, fontSize: 9, letterSpacing: 1, fontWeight: '900' }}>
                    {(m.brand || 'CARD').toUpperCase().slice(0, 4)}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }}>•••• {m.last4}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>
                    {m.holder} · {String(m.expMonth).padStart(2, '0')}/{String(m.expYear).slice(-2)}
                    {m.isDefault ? ' · Default' : ''}
                  </Text>
                </View>
                {!m.isDefault ? (
                  <Pressable onPress={() => setDefault(m._id)} hitSlop={6} style={{ marginRight: 14 }}>
                    <Star size={14} color={theme.accent} />
                  </Pressable>
                ) : null}
                <Pressable onPress={() => remove(m)} hitSlop={6}>
                  <Trash2 size={14} color={theme.danger} />
                </Pressable>
              </View>
            </Card>
          ))
        )}

        {showAdd ? (
          <Card style={{ marginTop: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Lock size={14} color={theme.textMuted} />
              <Text style={{ marginLeft: 6, color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1, fontWeight: '700' }}>
                TEST CARD · NO REAL CHARGES
              </Text>
            </View>
            <Field label="Card number" value={number} onChangeText={setNumber} placeholder="4242 4242 4242 4242" keyboardType="number-pad" />
            <Field label="Cardholder" value={holder} onChangeText={setHolder} placeholder="As printed" autoCapitalize="words" />
            <Field label="Expiry" value={exp} onChangeText={setExp} placeholder="MM/YY" maxLength={5} />
            <Button label="Save card" onPress={add} variant="primary" />
          </Card>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const Field = ({ label, ...rest }) => {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor={theme.textMuted}
        autoCapitalize={rest.autoCapitalize || 'none'}
        autoCorrect={false}
        style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceLine, padding: 12, borderRadius: radius.md, color: theme.text, fontSize: fontSize.md }}
      />
    </View>
  );
};
