import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Vibration,
  Easing,
  Modal
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from 'expo-camera';
import Logo from './Logo';
import { config } from '../config';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const SCAN_BOX_SIZE = width * 0.7;

// Home Icon Component
const HomeIcon = ({ color = '#EFEFF3', size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L4 9V21H20V9L12 3Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <Path
      d="M9 21V15H15V21"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

export default function QRScanner({ onScanSuccess, onBackToHome }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState('');
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const modalButtonAnim = useRef(new Animated.Value(1)).current;
  const homeButtonAnim = useRef(new Animated.Value(1)).current;

  const { 
    primaryColor, 
    accentColor, 
    secondaryColor, 
    backgroundColor,
    lightText,
    appName,
    footerText
  } = config;

  useEffect(() => {
    const scanLineAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    scanLineAnimation.start();
    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      scanLineAnimation.stop();
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, [scanLineAnim, pulseAnim, rotateAnim]);

  // Home button subtle pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(homeButtonAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(homeButtonAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [homeButtonAnim]);

  // Fade in/out animation for Modal button when modal is visible
  useEffect(() => {
    if (showInvalidModal) {
      const fadeInOut = Animated.loop(
        Animated.sequence([
          Animated.timing(modalButtonAnim, {
            toValue: 0.5,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(modalButtonAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      fadeInOut.start();

      return () => {
        fadeInOut.stop();
        modalButtonAnim.setValue(1);
      };
    }
  }, [showInvalidModal, modalButtonAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!permission) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: primaryColor }]}>
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Logo size={100} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: lightText }]}>Preparing your experience...</Text>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: accentColor }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: secondaryColor }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: backgroundColor }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: primaryColor }]}>
        <View style={styles.centerContainer}>
          <Logo size={100} />
          <Text style={[styles.infoText, { color: lightText }]}>Camera access needed for scanning</Text>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: secondaryColor }]} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      Vibration.vibrate(100);
      
      // Check if URL is valid
      const isValid = onScanSuccess(data);
      if (!isValid) {
        // Show modern modal for invalid QR
        setInvalidMessage(`Please scan a valid ${appName} QR code to access the menu.`);
        setShowInvalidModal(true);
      }
    }
  };

  const toggleTorch = () => {
    setTorch(!torch);
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_BOX_SIZE - 4],
  });

  const handleScanAgain = () => {
    setScanned(false);
    setShowInvalidModal(false);
  };

  const homeButtonScale = homeButtonAnim.interpolate({
    inputRange: [0.5, 1, 1.5],
    outputRange: [0.95, 1, 0.95],
  });

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: primaryColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch}
      />

      {/* Semi-transparent overlay with hole for scanner */}
      <View style={styles.overlay}>
        {/* Top section with logo - dark overlay */}
        <View style={[styles.topOverlay, { backgroundColor: `${primaryColor}E6` }]}>
          <View style={styles.logoSection}>
            <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }], borderColor: accentColor }]}>
              <Logo size={90} />
            </Animated.View>
            <Text style={[styles.brandName, { color: lightText }]}>{appName}</Text>
            <Text style={[styles.tagline, { color: accentColor }]}>{config.tagline}</Text>
          </View>
        </View>

        {/* Middle section with transparent scan window */}
        <View style={styles.middleOverlay}>
          {/* Left overlay */}
          <View style={[styles.sideOverlay, { backgroundColor: `${primaryColor}E6`, width: (width - SCAN_BOX_SIZE) / 2 }]} />
          
          {/* Center with transparent window */}
          <View style={styles.scanWindow}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTopLeft, { borderColor: accentColor }]} />
              <View style={[styles.corner, styles.cornerTopRight, { borderColor: accentColor }]} />
              <View style={[styles.corner, styles.cornerBottomLeft, { borderColor: accentColor }]} />
              <View style={[styles.corner, styles.cornerBottomRight, { borderColor: accentColor }]} />
              
              <Animated.View style={[styles.scanLine, { backgroundColor: accentColor, transform: [{ translateY }] }]} />
            </View>
          </View>
          
          {/* Right overlay */}
          <View style={[styles.sideOverlay, { backgroundColor: `${primaryColor}E6`, width: (width - SCAN_BOX_SIZE) / 2 }]} />
        </View>

        {/* Bottom section with controls and footer - dark overlay */}
        <View style={[styles.bottomOverlay, { backgroundColor: `${primaryColor}E6` }]}>
          <View style={[styles.scanInstructionContainer, { borderColor: secondaryColor }]}>
            <Text style={[styles.scanInstruction, { color: lightText }]}>
              {scanned ? '✓ Code Captured' : 'Place QR code in frame'}
            </Text>
            <TouchableOpacity 
              style={[
                styles.flashButton, 
                { borderColor: secondaryColor },
                torch && { backgroundColor: accentColor, borderColor: lightText }
              ]} 
              onPress={toggleTorch}
            >
              <Text style={[styles.flashIcon, torch && { color: primaryColor }]}>⚡</Text>
            </TouchableOpacity>
          </View>
          
          {/* Home Button - Centered at bottom */}
          <Animated.View style={[styles.homeButtonWrapper, { transform: [{ scale: homeButtonScale }] }]}>
            <TouchableOpacity
              style={[styles.homeButton, { backgroundColor: `${secondaryColor}40`, borderColor: accentColor }]}
              onPress={onBackToHome}
              activeOpacity={0.7}
            >
              <HomeIcon color={lightText} size={24} />
            </TouchableOpacity>
          </Animated.View>
          
          {/* Footer with text and dots - exactly like homepage */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: backgroundColor }]}>{footerText}</Text>
            <View style={styles.footerDots}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.footerDot,
                    {
                      backgroundColor: i === 1 ? accentColor : secondaryColor,
                      opacity: i === 1 ? 1 : 0.4,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Modern Invalid QR Modal with Animated Scan Button */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showInvalidModal}
        onRequestClose={() => setShowInvalidModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: `${primaryColor}CC` }]}>
          <View style={[styles.modalContent, { backgroundColor: primaryColor, borderColor: accentColor }]}>
            <View style={[styles.modalIconContainer, { borderColor: accentColor }]}>
              <Text style={styles.modalIcon}>⚠️</Text>
            </View>
            <Text style={[styles.modalTitle, { color: accentColor }]}>Invalid QR Code</Text>
            <Text style={[styles.modalMessage, { color: lightText }]}>{invalidMessage}</Text>
            <View style={styles.modalButtonContainer}>
              <Animated.View style={{ opacity: modalButtonAnim }}>
                <TouchableOpacity
                  style={[styles.modalButton, { borderColor: accentColor }]}
                  onPress={handleScanAgain}
                >
                  <Text style={[styles.modalButtonText, { color: lightText }]}>⟳ Scan New Code</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
    fontFamily: 'System',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontFamily: 'System',
    fontWeight: '400',
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: '#EFEFF3',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    flex: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  middleOverlay: {
    flexDirection: 'row',
    height: SCAN_BOX_SIZE,
  },
  sideOverlay: {
    height: SCAN_BOX_SIZE,
  },
  scanWindow: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bottomOverlay: {
    flex: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  logoSection: {
    paddingTop: 50,
    alignItems: 'center',
  },
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(74, 68, 82, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 6,
    fontFamily: 'System',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1.2,
    fontStyle: 'italic',
    marginBottom: 30,
  },
  scanFrame: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderWidth: 3,
    zIndex: 10,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 1.5,
    shadowColor: '#EF876D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  scanInstructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 68, 82, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 40,
    borderWidth: 1,
    marginBottom: 20,
  },
  scanInstruction: {
    fontSize: 15,
    fontWeight: '400',
    marginRight: 15,
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 68, 82, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  flashIcon: {
    color: '#EFEFF3',
    fontSize: 18,
  },
  homeButtonWrapper: {
    marginBottom: 20,
  },
  homeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  // New footer section matching homepage design
  footer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '400',
    marginBottom: 8,
  },
  footerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 3,
  },
  // Modern Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(239, 135, 109, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    opacity: 0.95,
    paddingHorizontal: 10,
  },
  modalButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: 'rgba(126, 98, 188, 0.45)',
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 35,
    minWidth: 180,
    borderWidth: 2,
    shadowColor: '#EF876D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
});