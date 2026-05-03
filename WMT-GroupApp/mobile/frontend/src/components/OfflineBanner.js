import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useTheme, fontSize, space } from '../theme';

export default function OfflineBanner() {
  const theme = useTheme();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      setOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return () => sub();
  }, []);

  if (!offline) return null;

  return (
    <View style={{
      backgroundColor: theme.burgundy, paddingHorizontal: space.lg,
      paddingVertical: space.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
    }}>
      <WifiOff size={14} color="#fff" />
      <Text style={{ color: '#fff', marginLeft: 8, fontSize: fontSize.xs, letterSpacing: 0.5, fontWeight: '600' }}>
        You are offline · changes will sync when you reconnect
      </Text>
    </View>
  );
}
