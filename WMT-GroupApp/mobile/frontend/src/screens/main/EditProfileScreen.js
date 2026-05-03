import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Camera, Lock, Trash2 } from 'lucide-react-native';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Input, Button, Tag, Avatar, Card } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../store/AuthContext';
import { authApi, friendlyError } from '../../services/api';

const DIETARY = ['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free', 'Nut-Free'];
const CUISINES = ['French', 'Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Steakhouse', 'Seafood', 'Vegan', 'Lebanese', 'American'];

export default function EditProfileScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { user, reload, signOut } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState(user?.profileImage || '');
  const [dietary, setDietary] = useState(user?.dietaryPreferences || []);
  const [favCuisines, setFavCuisines] = useState(user?.favoriteCuisines || []);
  const [saving, setSaving] = useState(false);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return toast.show('Photo permission required', 'error');
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true,
      aspect: [1, 1], quality: 0.6, base64: true
    });
    if (r.canceled || !r.assets?.length) return;
    const a = r.assets[0];
    setPhoto(a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
  };

  const save = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({
        name, phone, profileImage: photo,
        dietaryPreferences: dietary, favoriteCuisines: favCuisines
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await reload();
      toast.show('Profile saved', 'success');
      navigation.goBack();
    } catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (newPwd.length < 6) return toast.show('New password too short', 'error');
    if (newPwd !== confirmPwd) return toast.show('Passwords do not match', 'error');
    setChangingPwd(true);
    try {
      await authApi.changePassword(currentPwd, newPwd);
      toast.show('Password updated', 'success');
      setPwdOpen(false); setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) { toast.show(friendlyError(err), 'error'); }
    finally { setChangingPwd(false); }
  };

  const deleteAccount = () => {
    Alert.alert('Delete account?', 'This permanently removes your account and history. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await authApi.deleteAccount(); await signOut(); }
        catch (err) { toast.show(friendlyError(err), 'error'); }
      }}
    ]);
  };

  const toggle = (cur, set, v) => set(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);

  return (
    <ScreenContainer>
      <Header title="Edit profile" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}>
          <View style={{ alignItems: 'center', marginBottom: space.xl }}>
            <Pressable onPress={pickPhoto}>
              <Avatar uri={photo} name={name} size={96} />
              <View style={{
                position: 'absolute', right: 0, bottom: 0, width: 30, height: 30, borderRadius: 15,
                backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center',
                borderWidth: 3, borderColor: theme.bg
              }}>
                <Camera size={14} color={theme.textInverse} />
              </View>
            </Pressable>
            <Text style={{ marginTop: 10, color: theme.textMuted, fontSize: fontSize.xs }}>Tap to change photo</Text>
          </View>

          <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
          <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (555) 555-1234" keyboardType="phone-pad" />

          <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>
            Dietary preferences
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: space.lg }}>
            {DIETARY.map((d) => <Tag key={d} label={d} active={dietary.includes(d)} onPress={() => toggle(dietary, setDietary, d)} />)}
          </View>

          <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>
            Favorite cuisines
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: space.xl }}>
            {CUISINES.map((c) => <Tag key={c} label={c} active={favCuisines.includes(c)} onPress={() => toggle(favCuisines, setFavCuisines, c)} />)}
          </View>

          <Button label={saving ? 'Saving…' : 'Save changes'} onPress={save} loading={saving} variant="dark" size="lg" haptic="success" />

          <Card style={{ marginTop: space.xl }}>
            <Pressable onPress={() => setPwdOpen((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Lock size={16} color={theme.text} />
              <Text style={{ marginLeft: 10, color: theme.text, fontSize: fontSize.md, fontWeight: '800', flex: 1 }}>Change password</Text>
              <Text style={{ color: theme.accent, fontSize: fontSize.sm, fontWeight: '700' }}>{pwdOpen ? 'Hide' : 'Open'}</Text>
            </Pressable>
            {pwdOpen ? (
              <View style={{ marginTop: space.lg }}>
                <Input label="Current password" value={currentPwd} onChangeText={setCurrentPwd} secureTextEntry />
                <Input label="New password" value={newPwd} onChangeText={setNewPwd} secureTextEntry />
                <Input label="Confirm new password" value={confirmPwd} onChangeText={setConfirmPwd} secureTextEntry />
                <Button label={changingPwd ? 'Updating…' : 'Update password'} onPress={changePassword} loading={changingPwd} variant="primary" />
              </View>
            ) : null}
          </Card>

          <Pressable onPress={deleteAccount} style={{
            marginTop: space.xl, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
            borderRadius: radius.md, borderWidth: 1, borderColor: theme.danger, backgroundColor: 'transparent'
          }}>
            <Trash2 size={14} color={theme.danger} />
            <Text style={{ marginLeft: 8, color: theme.danger, fontSize: fontSize.md, fontWeight: '800' }}>Delete account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
