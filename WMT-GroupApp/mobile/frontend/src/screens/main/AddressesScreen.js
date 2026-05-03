import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Alert } from 'react-native';
import { Plus, MapPin, Home, Trash2, Check } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Card, Input, Button, EmptyState, Skeleton } from '../../components/ui';
import { authApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export default function AddressesScreen() {
  const theme = useTheme();
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: 'Home', line1: '', line2: '', city: 'New York', postalCode: '', country: 'United States', isDefault: false });

  const load = useCallback(async () => {
    try { setAddresses(await authApi.listAddresses()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const startNew = () => {
    setEditing(null);
    setForm({ label: 'Home', line1: '', line2: '', city: 'New York', postalCode: '', country: 'United States', isDefault: addresses.length === 0 });
    setOpen(true);
  };

  const startEdit = (a) => { setEditing(a); setForm(a); setOpen(true); };

  const save = async () => {
    if (!form.line1.trim() || !form.city.trim()) return toast.show('Address line and city required', 'info');
    try {
      if (editing) await authApi.updateAddress(editing._id, form);
      else await authApi.addAddress(form);
      toast.show('Saved', 'success'); setOpen(false); load();
    } catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  const remove = (a) => {
    Alert.alert('Delete address?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await authApi.deleteAddress(a._id); toast.show('Deleted', 'info'); load(); }
        catch (err) { toast.show(friendlyError(err), 'error'); }
      }}
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="Address book" right={
        <Pressable onPress={startNew} hitSlop={6}>
          <Plus size={20} color={theme.accent} />
        </Pressable>
      } />
      {loading ? (
        <View style={{ padding: space.lg }}>
          <Skeleton height={88} br={radius.md} style={{ marginBottom: 8 }} />
          <Skeleton height={88} br={radius.md} />
        </View>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={28} color={theme.textMuted} />}
          title="No addresses saved"
          message="Add a home or office address to speed up bookings."
          action={<Button label="Add address" onPress={startNew} icon={<Plus size={14} color={theme.textInverse} />} />}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.lg }}>
          {addresses.map((a) => (
            <Pressable key={a._id} onPress={() => startEdit(a)}>
              <Card style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
                    <Home size={16} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800' }}>{a.label}</Text>
                      {a.isDefault ? (
                        <Text style={{ marginLeft: 8, color: theme.accent, fontSize: 10, letterSpacing: 1, fontWeight: '700' }}>DEFAULT</Text>
                      ) : null}
                    </View>
                    <Text style={{ color: theme.textSoft, fontSize: fontSize.sm, marginTop: 2 }}>
                      {a.line1}{a.line2 ? `, ${a.line2}` : ''}
                    </Text>
                    <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
                      {a.city}{a.postalCode ? ` · ${a.postalCode}` : ''}
                    </Text>
                  </View>
                  <Pressable onPress={() => remove(a)} hitSlop={6}>
                    <Trash2 size={14} color={theme.danger} />
                  </Pressable>
                </View>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Modal animationType="slide" presentationStyle="pageSheet" visible={open} onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <Header title={editing ? 'Edit address' : 'New address'} onBack={() => setOpen(false)} />
          <ScrollView contentContainerStyle={{ padding: space.lg }}>
            <Input label="Label" value={form.label} onChangeText={(v) => setForm((f) => ({ ...f, label: v }))} placeholder="Home / Office" autoCapitalize="words" />
            <Input label="Address" value={form.line1} onChangeText={(v) => setForm((f) => ({ ...f, line1: v }))} placeholder="123 5th Ave" autoCapitalize="words" />
            <Input label="Apt / Suite (optional)" value={form.line2} onChangeText={(v) => setForm((f) => ({ ...f, line2: v }))} placeholder="Apt 4B" autoCapitalize="words" />
            <Input label="City" value={form.city} onChangeText={(v) => setForm((f) => ({ ...f, city: v }))} placeholder="New York" autoCapitalize="words" />
            <Input label="Postal code" value={form.postalCode} onChangeText={(v) => setForm((f) => ({ ...f, postalCode: v }))} placeholder="10001" />
            <Pressable onPress={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.lg }}>
              <View style={{
                width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: form.isDefault ? theme.accent : theme.surfaceLine,
                backgroundColor: form.isDefault ? theme.accent : 'transparent',
                alignItems: 'center', justifyContent: 'center'
              }}>
                {form.isDefault ? <Check size={14} color={theme.textInverse} /> : null}
              </View>
              <Text style={{ marginLeft: 10, color: theme.text, fontSize: fontSize.md, fontWeight: '600' }}>Set as default</Text>
            </Pressable>
            <Button label="Save address" onPress={save} variant="dark" size="lg" haptic="success" />
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
