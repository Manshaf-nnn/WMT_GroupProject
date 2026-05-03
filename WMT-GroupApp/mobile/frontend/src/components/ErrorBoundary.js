import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { palette, space, fontSize, radius } from '../theme';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.warn('ErrorBoundary caught:', error?.message, info?.componentStack);
  }
  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, padding: space.xxl, justifyContent: 'center', backgroundColor: palette.charcoal }}>
          <Text style={{ color: palette.gold, fontSize: fontSize.xs, letterSpacing: 1.6, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>
            Maison
          </Text>
          <Text style={{ color: palette.ivory, fontSize: fontSize.xxl, fontWeight: '800', marginBottom: 12 }}>
            Something went off-script.
          </Text>
          <Text style={{ color: palette.textOnDarkMuted, fontSize: fontSize.md, marginBottom: 24, lineHeight: 22 }}>
            The team has been notified. You can try this screen again, or restart the app.
          </Text>
          {this.state.error?.message ? (
            <Text style={{ color: palette.errorFg, fontSize: fontSize.xs, fontFamily: 'Courier', marginBottom: 24 }}>
              {String(this.state.error.message).slice(0, 240)}
            </Text>
          ) : null}
          <Pressable
            onPress={this.reset}
            style={{
              backgroundColor: palette.gold, paddingVertical: 14, borderRadius: radius.md,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: palette.charcoal, fontWeight: '700', fontSize: fontSize.md, letterSpacing: 0.5 }}>
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
