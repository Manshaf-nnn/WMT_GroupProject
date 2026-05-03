import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Camera, X } from 'lucide-react-native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Button, Stars, Tag, Skeleton } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { restaurantApi, reviewApi, friendlyError } from '../../services/api';

const TAGS = [
  { key: 'food', label: 'Food' },
  { key: 'service', label: 'Service' },
  { key: 'ambience', label: 'Ambience' },
  { key: 'value', label: 'Value' }
];

export default function ReviewScreen({ route, navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { restaurantId, reviewId, initial } = route.params || {};
  const [restaurant, setRestaurant] = useState(null);
  const [rating, setRating] = useState(initial?.rating || 0);
  const [comment, setComment] = useState(initial?.comment || '');
  const [tags, setTags] = useState(initial?.tags || []);
  const [photos, setPhotos] = useState(initial?.photos || []);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    restaurantApi.get(restaurantId).then(setRestaurant).catch(() => {});
  }, [restaurantId]);

  const toggleTag = (k) => {
    setTags((cur) => cur.includes(k) ? cur.filter((t) => t !== k) : [...cur, k]);
  };

  const addPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast.show('Photo permission required', 'error'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.7, base64: true
    });
    if (r.canceled || !r.assets?.length) return;
    const a = r.assets[0];
    const dataUri = a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri;
    setPhotos((cur) => [...cur, dataUri].slice(0, 4));
  };

  const submit = async () => {
    if (rating === 0) { toast.show('Tap to choose a rating', 'info'); return; }
    if (comment.trim().length < 8) { toast.show('Tell us a little more (8+ chars)', 'info'); return; }
    setSubmitting(true);
    try {
      if (reviewId) {
        await reviewApi.update(reviewId, { rating, comment, tags, photos });
      } else {
        await reviewApi.create({ restaurant: restaurantId, rating, comment, tags, photos });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.show(reviewId ? 'Review updated' : 'Thank you for your review.', 'success');
      navigation.goBack();
    } catch (err) {
      toast.show(friendlyError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title={reviewId ? 'Edit review' : 'Write a review'} subtitle={restaurant?.name} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}>
          {restaurant ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.xl }}>
              <ExpoImage source={{ uri: restaurant.heroImage || restaurant.images?.[0] }} style={{ width: 56, height: 56, borderRadius: 12 }} contentFit="cover" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: theme.text, fontSize: fontSize.lg, fontWeight: '800' }}>{restaurant.name}</Text>
                <Text style={{ color: theme.textMuted, fontSize: fontSize.sm }}>{restaurant.cuisine} · {restaurant.location}</Text>
              </View>
            </View>
          ) : <Skeleton height={56} br={radius.md} style={{ marginBottom: space.xl }} />}

          <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800', marginBottom: 8 }}>How was it?</Text>
          <View style={{ alignItems: 'center', paddingVertical: space.md }}>
            <Stars value={rating} onChange={setRating} size={42} gap={6} />
            <Text style={{ marginTop: 8, color: theme.textMuted, fontSize: fontSize.xs, letterSpacing: 1.2, fontWeight: '700' }}>
              {rating === 0 ? 'TAP TO RATE' : ['POOR','FAIR','GOOD','GREAT','EXCEPTIONAL'][rating - 1]}
            </Text>
          </View>

          <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800', marginTop: space.lg, marginBottom: 8 }}>What stood out?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: space.lg }}>
            {TAGS.map((t) => (
              <Tag key={t.key} label={t.label} active={tags.includes(t.key)} onPress={() => toggleTag(t.key)} />
            ))}
          </View>

          <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800', marginBottom: 8 }}>Tell the community</Text>
          <View style={{ backgroundColor: theme.surface, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: theme.surfaceLine }}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              multiline
              placeholder="What worked, what didn't, what you'd order again."
              placeholderTextColor={theme.textMuted}
              style={{ color: theme.text, fontSize: fontSize.md, minHeight: 120, textAlignVertical: 'top' }}
              maxLength={1000}
            />
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, textAlign: 'right' }}>{comment.length}/1000</Text>
          </View>

          <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800', marginTop: space.lg, marginBottom: 8 }}>Photos (optional)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {photos.map((p, i) => (
              <View key={i} style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                <ExpoImage source={{ uri: p }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <Pressable onPress={() => setPhotos((cur) => cur.filter((_, idx) => idx !== i))} style={{
                  position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11,
                  backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center'
                }}>
                  <X size={12} color="#fff" />
                </Pressable>
              </View>
            ))}
            {photos.length < 4 ? (
              <Pressable onPress={addPhoto} style={{
                width: 96, height: 96, borderRadius: 12, borderWidth: 1, borderColor: theme.surfaceLine,
                backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center'
              }}>
                <Camera size={20} color={theme.textMuted} />
                <Text style={{ marginTop: 4, color: theme.textMuted, fontSize: fontSize.xs }}>Add</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: space.lg, paddingBottom: 30, backgroundColor: theme.bg,
        borderTopWidth: 1, borderTopColor: theme.surfaceLine
      }}>
        <Button label={submitting ? 'Submitting…' : 'Publish Review'} onPress={submit} loading={submitting} variant="dark" size="lg" haptic="success" />
      </View>
    </ScreenContainer>
  );
}
