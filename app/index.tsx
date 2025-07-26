import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#87CEEB', '#98D8E8']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Game Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🏎️</Text>
          <Text style={styles.gameTitle}>CARTOON</Text>
          <Text style={styles.gameTitle}>CAR RACING</Text>
          <Text style={styles.subtitle}>Твоя фотография - твой водитель!</Text>
        </View>

        {/* Decorative Cars */}
        <View style={styles.carsContainer}>
          <Text style={styles.decorativeCar}>🚗</Text>
          <Text style={styles.decorativeCar}>🏁</Text>
          <Text style={styles.decorativeCar}>🚙</Text>
        </View>

        {/* Play Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push('/car-selection')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.playButtonGradient}
          >
            <Text style={styles.playButtonText}>ИГРАТЬ</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary Buttons */}
        <View style={styles.secondaryButtons}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>🏆 РЕКОРДЫ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>⚙️ НАСТРОЙКИ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 80,
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  carsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 50,
  },
  decorativeCar: {
    fontSize: 40,
    transform: [{ rotate: '10deg' }],
  },
  playButton: {
    width: width * 0.7,
    height: 70,
    borderRadius: 35,
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonGradient: {
    flex: 1,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  secondaryButtons: {
    width: '100%',
    gap: 15,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});