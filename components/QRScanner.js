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
import Constants from 'expo-constants';
import Logo from './Logo';

const { width, height } = Dimensions.get('window');
const SCAN_BOX_SIZE = width * 0.7;

// Get config from app.json using modern Expo Constants API
const getConfig = () => {
  try {
    // Modern Expo Constants API (SDK 49+)
    const extra = Constants.expoConfig?.extra || {};
    
    return {
      appName: extra.appName || "THE SOUTH END",
      tagline: extra.tagline || "where nature meets music",
      footerText: extra.footerText || "SCAN • ORDER • ENJOY"
    };
  } catch (error) {
    // Fallback values if config fails
    console.log('Error loading config:', error);
    return {
      appName: "THE SOUTH END",
      tagline: "where nature meets music",
      footerText: "SCAN • ORDER • ENJOY"
    };
  }
};

const { appName, tagline, footerText } = getConfig();

export default function QRScanner({ onScanSuccess }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState('');
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const modalButtonAnim = useRef(new Animated.Value(1)).current;

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
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Logo size={100} />
          </Animated.View>
          <Text style={styles.loadingText}>Preparing your experience...</Text>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.centerContainer}>
          <Logo size={100} />
          <Text style={styles.infoText}>Camera access needed for scanning</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#4A4452" />
      
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch}
      />

      {/* Semi-transparent overlay with hole for scanner */}
      <View style={styles.overlay}>
        {/* Top section with logo - dark overlay */}
        <View style={styles.topOverlay}>
          <View style={styles.logoSection}>
            <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <Logo size={90} />
            </Animated.View>
            <Text style={styles.brandName}>{appName}</Text>
            <Text style={styles.tagline}>{tagline}</Text>
          </View>
        </View>

        {/* Middle section with transparent scan window */}
        <View style={styles.middleOverlay}>
          {/* Left overlay */}
          <View style={[styles.sideOverlay, { width: (width - SCAN_BOX_SIZE) / 2 }]} />
          
          {/* Center with transparent window */}
          <View style={styles.scanWindow}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              
              <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
            </View>
          </View>
          
          {/* Right overlay */}
          <View style={[styles.sideOverlay, { width: (width - SCAN_BOX_SIZE) / 2 }]} />
        </View>

        {/* Bottom section with controls and footer - dark overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.scanInstructionContainer}>
            <Text style={styles.scanInstruction}>
              {scanned ? '✓ Code Captured' : 'Place QR code in frame'}
            </Text>
            <TouchableOpacity 
              style={[styles.flashButton, torch && styles.flashButtonActive]} 
              onPress={toggleTorch}
            >
              <Text style={[styles.flashIcon, torch && styles.flashIconActive]}>⚡</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.bottomFooter}>
            <Text style={styles.footerText}>{footerText}</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>⚠️</Text>
            </View>
            <Text style={styles.modalTitle}>Invalid QR Code</Text>
            <Text style={styles.modalMessage}>{invalidMessage}</Text>
            <View style={styles.modalButtonContainer}>
              <Animated.View style={{ opacity: modalButtonAnim }}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleScanAgain}
                >
                  <Text style={styles.modalButtonText}>⟳ Scan New Code</Text>
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
    backgroundColor: '#4A4452',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A4452',
  },
  loadingText: {
    color: '#EFEFF3',
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
    backgroundColor: '#EF876D',
    marginHorizontal: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
    color: '#EFEFF3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontFamily: 'System',
    fontWeight: '400',
  },
  permissionButton: {
    backgroundColor: '#7E62BC',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
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
    backgroundColor: 'rgba(74, 68, 82, 0.9)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  middleOverlay: {
    flexDirection: 'row',
    height: SCAN_BOX_SIZE,
  },
  sideOverlay: {
    height: SCAN_BOX_SIZE,
    backgroundColor: 'rgba(74, 68, 82, 0.9)',
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
    backgroundColor: 'rgba(74, 68, 82, 0.9)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
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
    borderColor: '#EF876D',
  },
  brandName: {
    color: '#EFEFF3',
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 6,
    fontFamily: 'System',
  },
  tagline: {
    color: '#EF876D',
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
    borderColor: '#EF876D',
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
    backgroundColor: '#EF876D',
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
    borderColor: '#7E62BC',
    marginBottom: 20,
  },
  scanInstruction: {
    color: '#EFEFF3',
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
    borderColor: '#7E62BC',
  },
  flashButtonActive: {
    backgroundColor: '#EF876D',
    borderColor: '#EFEFF3',
  },
  flashIcon: {
    color: '#EFEFF3',
    fontSize: 18,
  },
  flashIconActive: {
    color: '#4A4452',
  },
  bottomFooter: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#AFA8B8',
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: '400',
  },
  // Modern Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 68, 82, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#4A4452',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF876D',
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
    borderColor: '#EF876D',
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitle: {
    color: '#EF876D',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  modalMessage: {
    color: '#EFEFF3',
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
    borderColor: '#EF876D',
    shadowColor: '#EF876D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtonText: {
    color: '#EFEFF3',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
});