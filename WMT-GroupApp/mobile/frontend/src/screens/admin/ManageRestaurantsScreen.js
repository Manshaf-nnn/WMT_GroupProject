import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Modal, ScrollView, KeyboardAvoidingView, Platform, Alert, TextInput } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Plus, Edit2, Trash2, Star } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Card, Button, Input, Tag, Skeleton, EmptyState } from '../../components/ui';
import { restaurantApi, friendlyError } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const PRICES = ['$', '$$', '$$$', '$$$$'];

export default function ManageRestaurantsScreen() {
  const theme = useTheme();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const empty = { name: '', cuisine: '', location: '', city: 'New York', priceRange: '$$', description: '', heroImage: '', images: [], featured: false };
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    try { setItems(await restaurantApi.list()); }
    catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const startNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (r) => {
    setEditing(r);
    setForm({
      name: r.name, cuisine: r.cuisine, location: r.location, city: r.city || 'New York',
      priceRange: r.priceRange, description: r.description, heroImage: r.heroImage || '',
      images: r.images || [], featured: r.featured || false
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.cuisine.trim() || !form.location.trim()) {
      return toast.show('Name, cuisine, location required', 'info');
    }
    try {
      if (editing) await restaurantApi.update(editing._id, form);
      else await restaurantApi.create({ ...form, images: form.heroImage ? [form.heroImage] : [] });
      toast.show('Saved', 'success'); setOpen(false); load();
    } catch (err) { toast.show(friendlyError(err), 'error'); }
  };

  const remove = (r) => {
    Alert.alert('Delete restaurant?', `Removing "${r.name}" deletes all linked reviews.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await restaurantApi.remove(r._id); toast.show('Deleted', 'info'); load(); }
        catch (err) { toast.show(friendlyError(err), 'error'); }
      }}
    ]);
  };

  return (
    <ScreenContainer>
      <Header title="Restaurants" subtitle={`${items.length} venues`} right={
        <Pressable onPress={startNew} hitSlop={6}><Plus size={20} color={theme.accent} /></Pressable>
      } />
      {loading ? (
        <View style={{ padding: space.lg }}>
          <Skeleton height={88} br={radius.md} style={{ marginBottom: 8 }} />
          <Skeleton height={88} br={radius.md} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title="No restaurants" message="Add your first venue." action={<Button label="Add restaurant" onPress={startNew} />} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it._id}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Card padded={false} style={{ overflow: 'hidden', flexDirection: 'row' }}>
              <ExpoImage source={{ uri: item.heroImage || item.images?.[0] }} style={{ width: 90, height: 90 }} contentFit="cover" />
              <View style={{ flex: 1, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ flex: 1, color: theme.text, fontSize: fontSize.md, fontWeight: '800' }} numberOfLines={1}>{item.name}</Text>
                  {item.featured ? <Star size={12} color={theme.accent} fill={theme.accent} /> : null}
                </View>
                <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }} numberOfLines={1}>
                  {item.cuisine} · {item.priceRange} · {item.location}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Pressable onPress={() => startEdit(item)} style={btnSmall(theme, false)}>
                    <Edit2 size={11} color={theme.text} />
                    <Text style={{ marginLeft: 4, color: theme.text, fontSize: 11, fontWeight: '700' }}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => remove(item)} style={btnSmall(theme, true)}>
                    <Trash2 size={11} color={theme.danger} />
                    <Text style={{ marginLeft: 4, color: theme.danger, fontSize: 11, fontWeight: '700' }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          )}
        />
      )}

      <Modal animationType="slide" presentationStyle="pageSheet" visible={open} onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <Header title={editing ? 'Edit restaurant' : 'New restaurant'} onBack={() => setOpen(false)} />
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}>
              <Input label="Name" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Maison Lumière" autoCapitalize="words" />
              <Input label="Cuisine" value={form.cuisine} onChangeText={(v) => setForm((f) => ({ ...f, cuisine: v }))} placeholder="French" autoCapitalize="words" />
              <Input label="Neighborhood" value={form.location} onChangeText={(v) => setForm((f) => ({ ...f, location: v }))} placeholder="Midtown" autoCapitalize="words" />
              <Input label="City" value={form.city} onChangeText={(v) => setForm((f) => ({ ...f, city: v }))} placeholder="New York" autoCapitalize="words" />

              <Text style={labelStyle(theme)}>Price range</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: space.lg }}>
                {PRICES.map((p) => (
                  <Tag key={p} label={p} active={form.priceRange === p} onPress={() => setForm((f) => ({ ...f, priceRange: p }))} />
                ))}
              </View>

              <Input label="Hero Image URL" value={form.heroImage} onChangeText={(v) => setForm((f) => ({ ...f, heroImage: v }))} placeholder="https://images.unsplash.com/..." />

              <Text style={labelStyle(theme)}>Description</Text>
              <TextInput
                multiline value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="A short, evocative description"
                placeholderTextColor={theme.textMuted}
                style={{
                  minHeight: 120, padding: 14, color: theme.text, fontSize: fontSize.md,
                  backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceLine,
                  borderRadius: radius.md, textAlignVertical: 'top', marginBottom: space.lg
                }}
              />

              <Pressable onPress={() => setForm((f) => ({ ...f, featured: !f.featured }))} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.lg }}>
                <View style={{
                  width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
                  borderColor: form.featured ? theme.accent : theme.surfaceLine,
                  backgroundColor: form.featured ? theme.accent : 'transparent',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  {form.featured ? <Star size={12} color={theme.textInverse} fill={theme.textInverse} /> : null}
                </View>
                <Text style={{ marginLeft: 10, color: theme.text, fontSize: fontSize.md, fontWeight: '700' }}>Featured on home</Text>
              </Pressable>

              <Button label={editing ? 'Save changes' : 'Create restaurant'} onPress={save} variant="dark" size="lg" haptic="success" />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const btnSmall = (theme, danger) => ({
  flexDirection: 'row', alignItems: 'center',
  paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  borderWidth: 1, borderColor: danger ? theme.danger : theme.surfaceLine,
  backgroundColor: theme.surface
});

const labelStyle = (theme) => ({
  color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '700',
  letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6
});
