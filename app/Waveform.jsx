import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const Waveform = ({ isPlaying }) => {
  const bars = Array.from({ length: 12 }, () => useRef(new Animated.Value(10)).current);
  const isAnimating = useRef(false); // Flag to control animation loop

  const animateBars = () => {
    if (!isAnimating.current) return; // Stop if animation flag is off

    const animations = bars.map((bar) =>
      Animated.sequence([
        Animated.timing(bar, {
          toValue: Math.random() * 60 + 10,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(bar, {
          toValue: 10,
          duration: 300,
          useNativeDriver: false,
        }),
      ])
    );

    Animated.parallel(animations).start(() => {
      if (isAnimating.current) animateBars(); // Continue only if still playing
    });
  };

  useEffect(() => {
    if (isPlaying) {
      isAnimating.current = true;
      animateBars();
    } else {
      isAnimating.current = false;
      bars.forEach((bar) => bar.setValue(10)); // Reset bars when stopped
    }
  }, [isPlaying]);

  return (
    <View style={waveStyles.container}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[waveStyles.bar, { height: bar }]}
        />
      ))}
    </View>
  );
};

export default Waveform;

const waveStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    marginVertical: 30,
  },
  bar: {
    width: 6,
    backgroundColor: '#0A84FF',
    marginHorizontal: 4,
    borderRadius: 4,
  },
});
