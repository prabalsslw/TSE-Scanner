import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, G, Rect, Line } from 'react-native-svg';
import Logo from './Logo';
import { config } from '../config';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 2;

// Updated Icon Components based on your reference image
const PreOrderIcon = ({ color, size = 44 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Food delivery bag/container */}
    <Rect x="5" y="8" width="14" height="12" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M8 6V5C8 4 9 3 10 3H14C15 3 16 4 16 5V6" stroke={color} strokeWidth="2" fill="none" />
    {/* Clock element integrated */}
    <Circle cx="12" cy="14" r="4" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 12V14L14 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Food items */}
    <Circle cx="9" cy="10" r="1" fill={color} />
    <Circle cx="15" cy="10" r="1" fill={color} />
  </Svg>
);

const DineInIcon = ({ color, size = 44 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Plate */}
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" fill="none" />
    {/* Knife and Fork - more elegant */}
    <Path d="M7 6L7 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M5 8L9 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M17 6L17 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M15 8L19 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Food representation */}
    <Circle cx="12" cy="12" r="2" fill={color} />
    <Path d="M8 12L16 12" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </Svg>
);

const TakeAwayIcon = ({ color, size = 44 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Parcel/Bag */}
    <Rect x="6" y="8" width="12" height="12" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M8 6V5C8 4 9 3 10 3H14C15 3 16 4 16 5V6" stroke={color} strokeWidth="2" fill="none" />
    {/* Location/Food elements */}
    <Circle cx="18" cy="18" r="2" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M19 15L19 17" stroke={color} strokeWidth="2" />
    <Circle cx="10" cy="13" r="1.2" fill={color} />
    <Circle cx="14" cy="13" r="1.2" fill={color} />
    <Path d="M12 16L12 18" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
  </Svg>
);

const ReviewIcon = ({ color, size = 44 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Star */}
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
      stroke={color} strokeWidth="2" fill="none" />
    {/* Review elements */}
    <Circle cx="12" cy="12" r="1.5" fill={color} />
    <Circle cx="8" cy="10" r="1" fill={color} opacity="0.6" />
    <Circle cx="16" cy="10" r="1" fill={color} opacity="0.6" />
    <Path d="M8 16L16 16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </Svg>
);

export default function HomeScreen({ onDineIn }) {
  const {
    primaryColor,
    accentColor,
    secondaryColor,
    backgroundColor,
    lightText,
    appName,
    tagline,
    homeTagLine,
    footerText,
  } = config;

  // Animation values for each card - using simpler, faster animations
  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const opacityAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle floating animation for background
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    // Title entrance animation
    const titleAnimation = Animated.timing(titleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    });

    // Staggered card animations - faster entrance
    const cardAnimations = Animated.stagger(80, [
      Animated.spring(scaleAnims[0], { toValue: 1, speed: 20, useNativeDriver: true }),
      Animated.spring(scaleAnims[1], { toValue: 1, speed: 20, useNativeDriver: true }),
      Animated.spring(scaleAnims[2], { toValue: 1, speed: 20, useNativeDriver: true }),
      Animated.spring(scaleAnims[3], { toValue: 1, speed: 20, useNativeDriver: true }),
    ]);

    // Start all animations
    floatAnimation.start();
    titleAnimation.start();
    cardAnimations.start();

    return () => {
      // Clean up animations
      floatAnimation.stop();
      titleAnimation.stop();
      cardAnimations.stop();
      
      // Reset values
      scaleAnims[0].setValue(1);
      scaleAnims[1].setValue(1);
      scaleAnims[2].setValue(1);
      scaleAnims[3].setValue(1);
      floatAnim.setValue(0);
      titleAnim.setValue(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Disable warning because these are refs that don't change

  const handlePressIn = (index) => {
    // Fast press animation
    Animated.spring(scaleAnims[index], {
      toValue: 0.92,
      speed: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    // Fast release animation
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      speed: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPress = (index) => {
    if (index === 1) { // Dine In button
      // Quick success animation
      Animated.sequence([
        Animated.spring(scaleAnims[index], {
          toValue: 1.05,
          speed: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          speed: 40,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDineIn();
      });
    } else {
      // Quick feedback for non-functional buttons
      Animated.sequence([
        Animated.timing(opacityAnims[index], {
          toValue: 0.6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnims[index], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  const titleTranslateY = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const titleOpacity = titleAnim;

  const cards = [
    { id: 0, title: 'Pre-Order', icon: PreOrderIcon, color: secondaryColor, comingSoon: true },
    { id: 1, title: 'Dine In', icon: DineInIcon, color: accentColor, comingSoon: false },
    { id: 2, title: 'Take Away', icon: TakeAwayIcon, color: secondaryColor, comingSoon: true },
    { id: 3, title: 'Review', icon: ReviewIcon, color: secondaryColor, comingSoon: true },
  ];

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: primaryColor }]}>
      {/* Added StatusBar exactly like QR scanner page */}
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      
      {/* Animated Background Elements */}
      <Animated.View style={[styles.backgroundCircle, {
        backgroundColor: accentColor,
        opacity: 0.08,
        transform: [
          { translateX: floatInterpolate },
          { translateY: floatInterpolate },
        ],
        top: -50,
        right: -50,
      }]} />
      
      <Animated.View style={[styles.backgroundCircle, {
        backgroundColor: secondaryColor,
        opacity: 0.08,
        bottom: -80,
        left: -80,
      }]} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header with Logo and Brand - EXACT spacing like QR scanner page */}
        <Animated.View style={[
          styles.header,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }]
          }
        ]}>
          <View style={styles.logoSection}> {/* Added logoSection wrapper like QR scanner */}
            <View style={[styles.logoWrapper, { borderColor: accentColor }]}>
              <Logo size={90} />
            </View>
            <Text style={[styles.brandName, { color: lightText }]}>{appName}</Text>
            <Text style={[styles.tagline, { color: accentColor }]}>{tagline}</Text>
          </View>
        </Animated.View>

        {/* Welcome Message - with proper spacing after tagline */}
        <Animated.View style={[
          styles.welcomeSection,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }]
          }
        ]}>
          <Text style={[styles.welcomeSubtitle, { color: backgroundColor }]}>
            {homeTagLine}
          </Text>
        </Animated.View>

        {/* Cards Grid - with proper top spacing */}
        <View style={styles.cardsGrid}>
          {cards.map((card, index) => {
            const IconComponent = card.icon;
            const isDineIn = index === 1;
            const cardBackground = isDineIn 
              ? `rgba(239, 135, 109, 0.15)` 
              : `rgba(175, 168, 184, 0.1)`;
            
            return (
              <Animated.View
                key={card.id}
                style={[
                  styles.cardContainer,
                  {
                    transform: [{ scale: scaleAnims[index] }],
                    opacity: opacityAnims[index],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.card,
                    { 
                      backgroundColor: cardBackground,
                      borderColor: card.color,
                      borderWidth: isDineIn ? 2 : 1,
                    }
                  ]}
                  activeOpacity={1}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  onPress={() => handleCardPress(index)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: `${card.color}15` }]}>
                    <IconComponent color={card.color} size={44} />
                  </View>
                  <Text style={[styles.cardTitle, { color: lightText }]}>
                    {card.title}
                  </Text>
                  {card.comingSoon && (
                    <View style={[styles.comingSoonBadge, { backgroundColor: secondaryColor }]}>
                      <Text style={styles.comingSoonText}>SOON</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Space before footer */}
        <View style={styles.spaceBeforeFooter} />

        {/* Decorative Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: backgroundColor }]}>
            {footerText}
          </Text>
          <View style={styles.footerDots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  backgroundCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    zIndex: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoSection: {
    paddingTop: 50, // Added exact same paddingTop as QR scanner
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
    marginBottom: 30, // This creates space after tagline
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginTop: 10, // Added small margin after tagline
    zIndex: 1,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    opacity: 0.9,
    textAlign: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20, // Added proper top margin for cards
    zIndex: 1,
  },
  cardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    backdropFilter: 'blur(10px)',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#EFEFF3',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spaceBeforeFooter: {
    flex: 1,
    minHeight: 30,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 30,
    zIndex: 1,
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
});