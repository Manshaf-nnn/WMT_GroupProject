import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';
import { useTheme, space, fontSize, radius, shadow } from '../../theme';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);
  const opacity = useSharedValue(0);
  const translate = useSharedValue(-30);

  const dismiss = useCallback(() => {
    opacity.value = withTiming(0, { duration: 180 });
    translate.value = withTiming(-30, { duration: 220 }, (finished) => {
      if (finished) runOnJS(setToast)(null);
    });
  }, []);

  const show = useCallback((message, kind = 'info', durationMs = 2400) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, kind });
    opacity.value = withTiming(1, { duration: 220 });
    translate.value = withSpring(0, { damping: 14, stiffness: 220 });
    timeoutRef.current = setTimeout(dismiss, durationMs);
  }, [dismiss]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }]
  }));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? <ToastView toast={toast} animStyle={aStyle} /> : null}
    </ToastContext.Provider>
  );
};

const ToastView = ({ toast, animStyle }) => {
  const theme = useTheme();
  const tone = toast.kind === 'success'
    ? { bg: theme.success, fg: '#fff', Icon: CheckCircle2 }
    : toast.kind === 'error'
      ? { bg: theme.danger, fg: '#fff', Icon: XCircle }
      : { bg: theme.surface, fg: theme.text, Icon: Info };

  return (
    <Animated.View
      pointerEvents="none"
      style={[{
        position: 'absolute', top: 56, left: 16, right: 16, zIndex: 999
      }, animStyle]}
    >
      <View style={[{
        backgroundColor: tone.bg,
        borderRadius: radius.md,
        paddingVertical: space.md,
        paddingHorizontal: space.lg,
        flexDirection: 'row', alignItems: 'center',
        borderWidth: toast.kind === 'info' ? 1 : 0,
        borderColor: theme.surfaceLine
      }, shadow(theme, 2)]}>
        <tone.Icon size={18} color={tone.fg} style={{ marginRight: 10 }} />
        <Text style={{ color: tone.fg, fontSize: fontSize.md, flex: 1, fontWeight: '600' }}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
};

export const useToast = () => useContext(ToastContext) || { show: () => {} };

export default ToastProvider;
