import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const cars = [
  { id: 1, emoji: '🚗', name: 'Спидстер', color: '#FF4444' },
  { id: 2, emoji: '🏎️', name: 'Формула', color: '#4444FF' },
  { id: 3, emoji: '🚙', name: 'Внедорожник', color: '#44FF44' },
  { id: 4, emoji: '🚕', name: 'Такси', color: '#FFFF44' },
  { id: 5, emoji: '🚐', name: 'Фургон', color: '#FF44FF' },
  { id: 6, emoji: '🏁', name: 'Гоночный', color: '#44FFFF' },
];

export default function CarSelectionScreen() {
  const [selectedCar, setSelectedCar] = useState<number | null>(null);

  const handleCarSelect = (carId: number) => {
    setSelectedCar(carId);
  };

  const handleContinue = () => {
    if (selectedCar) {
      router.push({
        pathname: '/photo-upload',
        params: { carId: selectedCar }
      });
    }
  };

  return (
    <LinearGradient
      colors={['#87CEEB', '#98D8E8']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Выбери свою машинку!</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.carsGrid}
        showsVerticalScrollIndicator={false}
      >
        {cars.map((car) => (
          <TouchableOpacity
            key={car.id}
            style={[
              styles.carCard,
              selectedCar === car.id && styles.selectedCarCard
            ]}
            onPress={() => handleCarSelect(car.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedCar === car.id ? ['#FF6B35', '#F7931E'] : ['#FFFFFF', '#F0F0F0']}
              style={styles.carCardGradient}
            >
              <Text style={styles.carEmoji}>{car.emoji}</Text>
              <Text style={[
                styles.carName,
                selectedCar === car.id && styles.selectedCarName
              ]}>
                {car.name}
              </Text>
              
              {/* Car color indicator */}
              <View style={[styles.colorIndicator, { backgroundColor: car.color }]} />
              
              {selectedCar === car.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedCar && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedCar}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedCar ? ['#FF6B35', '#F7931E'] : ['#CCCCCC', '#AAAAAA']}
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedCar && styles.disabledButtonText
            ]}>
              ПРОДОЛЖИТЬ
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 10,
  },
  carsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  carCard: {
    width: (width - 60) / 2,
    height: 140,
    marginBottom: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedCarCard: {
    elevation: 10,
    shadowOpacity: 0.4,
    transform: [{ scale: 1.05 }],
  },
  carCardGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  carEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  selectedCarName: {
    color: '#FFFFFF',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  continueButtonGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  disabledButtonText: {
    color: '#666666',
  },
});