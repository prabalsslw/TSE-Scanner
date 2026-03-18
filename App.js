import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRScanner from './components/QRScanner';
import WebViewScreen from './components/WebViewScreen';
import Logo from './components/Logo';
import { isValidURL } from './utils/urlValidator';
import { config } from './config';

export default function App() {
  const [url, setUrl] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  // Use config values
  const { appName, tagline, footerText, primaryColor, accentColor, secondaryColor, backgroundColor } = config;

  // Gamified animations
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const dot1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dot1Anim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    const dot2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 0.3,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
      ])
    );

    const dot3Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 500,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 0.3,
          duration: 500,
          delay: 400,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    scaleAnimation.start();
    dot1Animation.start();
    dot2Animation.start();
    dot3Animation.start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      spinAnimation.stop();
      scaleAnimation.stop();
      dot1Animation.stop();
      dot2Animation.stop();
      dot3Animation.stop();
    };
  }, [spinValue, scaleValue, dot1Anim, dot2Anim, dot3Anim]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleScan = (data) => {
    const isValid = isValidURL(data, false);
    if (isValid) {
      setUrl(data);
    }
    return isValid;
  };

  if (showSplash) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: primaryColor }]}>
        <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

        <Animated.View
          style={[
            styles.splashLogoWrapper,
            { transform: [{ scale: scaleValue }], borderColor: accentColor },
          ]}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Logo size={130} />
          </Animated.View>
        </Animated.View>

        <Text style={styles.splashBrand}>{appName}</Text>
        <Text style={[styles.splashTagline, { color: backgroundColor }]}>{tagline}</Text>

        <View style={styles.splashLoader}>
          <Animated.View
            style={[
              styles.splashDot,
              { opacity: dot1Anim, backgroundColor: accentColor },
            ]}
          />
          <Animated.View
            style={[
              styles.splashDot,
              { opacity: dot2Anim, backgroundColor: secondaryColor },
            ]}
          />
          <Animated.View
            style={[
              styles.splashDot,
              { opacity: dot3Anim, backgroundColor: backgroundColor },
            ]}
          />
        </View>

        <Text style={[styles.splashFooter, { color: accentColor }]}>{footerText}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: primaryColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      <View style={styles.content}>
        {url ? (
          <WebViewScreen url={url} onBackToScanner={() => setUrl(null)} />
        ) : (
          <QRScanner onScanSuccess={handleScan} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogoWrapper: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(175, 168, 184, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
  },
  splashBrand: {
    color: '#EFEFF3',
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: 4,
    marginBottom: 8,
    fontFamily: 'System',
  },
  splashTagline: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 2,
    fontStyle: 'italic',
    marginBottom: 40,
  },
  splashLoader: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  splashDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  splashFooter: {
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: '500',
    marginTop: 20,
  },
  content: {
    flex: 1,
  },
});