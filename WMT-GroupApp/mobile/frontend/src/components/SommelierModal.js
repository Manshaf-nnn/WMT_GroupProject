import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Sparkles, Send, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme, fontSize, space, radius, palette } from '../theme';
import { aiApi, friendlyError } from '../services/api';
import { useToast } from './ui/Toast';

export default function SommelierModal({ visible, onClose, restaurant }) {
  const theme = useTheme();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setMessages([{
        from: 'sommelier',
        text: `Welcome to ${restaurant?.name || 'our table'}. I'm your sommelier — tell me what you're in the mood for, and I'll suggest something memorable.`
      }]);
    }
  }, [visible, restaurant?.name]);

  const send = async (preset) => {
    const text = (preset || input).trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, { from: 'me', text }]);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const r = await aiApi.recommend({ restaurantId: restaurant._id, prompt: text });
      setMessages((m) => [...m, { from: 'sommelier', text: r.reply, picks: r.picks }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    } catch (err) {
      toast.show(friendlyError(err, 'Sommelier is unavailable'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const PRESETS = ['Vegetarian', 'Something light', 'Chef\'s favourite', 'Pair with red wine'];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <View style={{ overflow: 'hidden' }}>
          <LinearGradient
            colors={[palette.charcoal, '#1d1a14']}
            style={{ paddingTop: 60, paddingBottom: space.xl, paddingHorizontal: space.lg }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(200,164,92,0.18)',
                  alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.gold
                }}>
                  <Sparkles size={18} color={palette.gold} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: palette.gold, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700' }}>SOMMELIER</Text>
                  <Text style={{ color: '#fff', fontSize: fontSize.lg, fontWeight: '800' }}>Ask me anything</Text>
                </View>
              </View>
              <Pressable onPress={onClose} hitSlop={10}>
                <X size={22} color="#fff" />
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={20}>
          <ScrollView ref={scrollRef} contentContainerStyle={{ padding: space.lg, paddingBottom: space.xl }}>
            {messages.map((m, i) => (
              <View key={i} style={{
                alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start',
                backgroundColor: m.from === 'me' ? theme.primary : theme.surface,
                borderColor: theme.surfaceLine, borderWidth: 1,
                borderRadius: radius.lg, padding: space.md, marginBottom: 8,
                maxWidth: '88%'
              }}>
                <Text style={{
                  color: m.from === 'me' ? theme.textInverse : theme.text,
                  fontSize: fontSize.md, lineHeight: 22
                }}>{m.text}</Text>
                {m.picks?.length ? (
                  <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.surfaceLine }}>
                    {m.picks.map((p) => (
                      <View key={p._id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ color: m.from === 'me' ? theme.textInverse : theme.textSoft, fontSize: fontSize.sm, fontWeight: '600' }}>{p.name}</Text>
                        <Text style={{ color: theme.accent, fontSize: fontSize.sm, fontWeight: '700' }}>${p.price}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: theme.surface, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.surfaceLine }}>
                <ActivityIndicator size="small" color={theme.accent} />
                <Text style={{ color: theme.textMuted, fontSize: fontSize.sm, marginLeft: 8, fontStyle: 'italic' }}>Thinking…</Text>
              </View>
            ) : null}
          </ScrollView>

          {messages.length <= 1 ? (
            <View style={{ paddingHorizontal: space.lg, marginBottom: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PRESETS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => send(p)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full,
                    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceLine
                  }}
                >
                  <Text style={{ color: theme.text, fontSize: fontSize.sm, fontWeight: '600' }}>{p}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={{
            flexDirection: 'row', alignItems: 'center', padding: space.lg,
            borderTopWidth: 1, borderTopColor: theme.surfaceLine, backgroundColor: theme.bg
          }}>
            <View style={{
              flex: 1, flexDirection: 'row', alignItems: 'center',
              backgroundColor: theme.surface, paddingHorizontal: 14, paddingVertical: 10,
              borderRadius: radius.full, borderWidth: 1, borderColor: theme.surfaceLine
            }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="What should I order tonight?"
                placeholderTextColor={theme.textMuted}
                style={{ flex: 1, color: theme.text, fontSize: fontSize.md }}
                onSubmitEditing={() => send()}
                returnKeyType="send"
              />
            </View>
            <Pressable
              onPress={() => send()}
              disabled={!input.trim() || loading}
              style={{
                marginLeft: 10, width: 44, height: 44, borderRadius: 22,
                backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center',
                opacity: !input.trim() || loading ? 0.4 : 1
              }}
            >
              <Send size={16} color={theme.textInverse} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
