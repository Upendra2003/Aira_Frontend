import { StyleSheet, Text, View, Animated, Easing, Dimensions } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Story = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
        <Ionicons name="book" size={100} color="#4F46E5" />
      </Animated.View>
      <Text style={styles.title}>Coming Soon</Text>
      <Text style={styles.subtitle}>Your story will be written here!</Text>
    </View>
  );
};

export default Story;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: width * 0.8,
  },
});
