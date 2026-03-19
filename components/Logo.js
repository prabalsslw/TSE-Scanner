import React from 'react';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const Logo = ({ size = 100 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="sunsetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EF876D" />
          <Stop offset="70%" stopColor="#7E62BC" />
        </LinearGradient>
        <LinearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#AFA8B8" />
          <Stop offset="100%" stopColor="#4A4452" />
        </LinearGradient>
      </Defs>

      {/* Sunset glow */}
      <Circle cx="60" cy="50" r="35" fill="url(#sunsetGrad)" opacity="0.25" />

      {/* Tree */}
      <Path
        d="M60 20 L45 45 L55 45 L45 65 L60 55 L75 65 L65 45 L75 45 L60 20"
        fill="#7E62BC"
      />
      <Path d="M58 65 L58 75 L62 75 L62 65" fill="#4A4452" />

      {/* Water waves */}
      <Path
        d="M30 85 Q45 80, 60 85 T90 85"
        stroke="#AFA8B8"
        strokeWidth="4"
        fill="none"
      />
      <Path
        d="M35 92 Q50 87, 65 92 T95 92"
        stroke="#EFEFF3"
        strokeWidth="3"
        fill="none"
        opacity="0.7"
      />

      {/* Sun */}
      <Circle cx="85" cy="40" r="10" fill="#EF876D" />

      {/* Food */}
      <Circle cx="40" cy="95" r="8" fill="#EF876D" opacity="0.8" />
      <Path d="M35 92 L45 92" stroke="#EFEFF3" strokeWidth="2" />

      {/* Musical notes */}
      <Circle cx="25" cy="45" r="4" fill="#AFA8B8" />
      <Path d="M25 45 L25 60" stroke="#AFA8B8" strokeWidth="3" fill="none" />
      <Circle cx="25" cy="65" r="3" fill="#AFA8B8" />

      <Circle cx="95" cy="70" r="4" fill="#AFA8B8" />
      <Path d="M95 70 L95 85" stroke="#AFA8B8" strokeWidth="3" fill="none" />

      {/* Sparkles */}
      <Circle cx="20" cy="25" r="2" fill="#EFEFF3" />
      <Circle cx="100" cy="25" r="2" fill="#EFEFF3" />
    </Svg>
  );
};

export default Logo;
