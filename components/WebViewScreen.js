import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Progress from 'react-native-progress';
import Svg, { Path } from 'react-native-svg';
import { config } from '../config';

// QR Code Scanner Icon Component
const QRIcon = ({ color = '#EFEFF3', size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3H9V5H5V9H3V3ZM3 21H9V19H5V15H3V21ZM15 3H21V9H19V5H15V3ZM21 15V21H15V19H19V15H21ZM7 7H11V11H7V7ZM13 7H17V11H13V7ZM7 13H11V17H7V13ZM17 13H19V15H17V13ZM13 13H15V15H13V13ZM13 17H15V19H13V17Z"
      fill={color}
    />
  </Svg>
);

export default function WebViewScreen({ url, onBackToScanner }) {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Use config values
  const { 
    primaryColor, 
    accentColor, 
    secondaryColor, 
    backgroundColor,
    lightText,
    disabledColor,
    borderColor,
    progressBarColor,
    navBarBg,
    navBarTransparent
  } = config;

  // Separate animated values for different properties
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const navOpacity = useRef(new Animated.Value(1)).current;

  // Use refs to track scroll state
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);

  // Slide up animation - uses native driver
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // Fade out progress bar - uses native driver
  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  // Function to handle scroll start
  const handleScrollStart = () => {
    if (!isScrollingRef.current) {
      isScrollingRef.current = true;
      Animated.timing(navOpacity, {
        toValue: 0.15,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
  };

  // Function to handle scroll end
  const handleScrollEnd = () => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => {
      if (isScrollingRef.current) {
        isScrollingRef.current = false;
        Animated.timing(navOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }, 1500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  const handleLoadProgress = ({ nativeEvent }) => {
    setProgress(nativeEvent.progress);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleLoadStart = () => {
    setLoading(true);
    setProgress(0);
  };

  const handleBackPress = () => {
    if (canGoBack) {
      webViewRef.current.goBack();
    } else {
      onBackToScanner();
    }
  };

  const handleForwardPress = () => {
    if (canGoForward && webViewRef.current) {
      webViewRef.current.goForward();
    }
  };

  const handleRefreshPress = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setLoading(true);
      setProgress(0);
    }
  };

  const handleScroll = () => {
    if (!isScrollingRef.current) {
      handleScrollStart();
    }
    handleScrollEnd();
  };

  const renderLoading = () => (
    <View style={[styles.customLoadingContainer, { backgroundColor }]}>
      <ActivityIndicator size="large" color={accentColor} />
      <Text style={[styles.customLoadingText, { color: primaryColor }]}>Loading...</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: primaryColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      {loading && (
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <Progress.Bar
            progress={progress}
            width={null}
            height={3}
            color={progressBarColor}
            unfilledColor={disabledColor}
            borderWidth={0}
            borderRadius={0}
          />
        </Animated.View>
      )}

      <View style={[styles.webviewContainer, { backgroundColor }]}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          onLoadProgress={handleLoadProgress}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onNavigationStateChange={handleNavigationStateChange}
          onScroll={handleScroll}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={renderLoading}
          style={[styles.webview, { backgroundColor }]}
          scrollEnabled={true}
        />
      </View>

      <Animated.View
        style={[
          styles.bottomNav,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: navBarBg,
            opacity: navOpacity,
            borderTopColor: borderColor,
          },
        ]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleBackPress}
          activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Text style={[styles.navIcon, !canGoBack && styles.navIconDisabled, { color: lightText }]}>
              ←
            </Text>
          </View>
          <Text style={[styles.navText, !canGoBack && styles.navTextDisabled, { color: lightText }]}>
            {canGoBack ? 'Back' : 'Exit'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleForwardPress}
          disabled={!canGoForward}
          activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Text style={[styles.navIcon, !canGoForward && styles.navIconDisabled, { color: lightText }]}>
              →
            </Text>
          </View>
          <Text style={[styles.navText, !canGoForward && styles.navTextDisabled, { color: lightText }]}>
            Forward
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleRefreshPress}
          activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <Text style={[styles.navIcon, { color: lightText }]}>↻</Text>
          </View>
          <Text style={[styles.navText, { color: lightText }]}>Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={onBackToScanner}
          activeOpacity={0.7}>
          <View style={styles.navIconContainer}>
            <QRIcon color={lightText} size={26} />
          </View>
          <Text style={[styles.navText, { color: lightText }]}>Scan</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  webviewContainer: {
    flex: 1,
    marginBottom: 80,
  },
  webview: {
    flex: 1,
  },
  customLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customLoadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 70,
    paddingHorizontal: 5,
  },
  navIconContainer: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navIcon: {
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 32,
  },
  navIconDisabled: {
    opacity: 0.5,
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 16,
  },
  navTextDisabled: {
    opacity: 0.5,
  },
});