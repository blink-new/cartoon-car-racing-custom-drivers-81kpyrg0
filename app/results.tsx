import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const cars = [
  { id: 1, emoji: '🚗', name: 'Спидстер' },
  { id: 2, emoji: '🚙', name: 'Внедорожник' },
  { id: 3, emoji: '🏎️', name: 'Формула' },
  { id: 4, emoji: '🚐', name: 'Фургон' },
  { id: 5, emoji: '🚕', name: 'Такси' },
  { id: 6, emoji: '🚓', name: 'Полиция' },
];

export default function ResultsScreen() {
  const { score, carId, driverPhoto } = useLocalSearchParams();
  const [bestScore, setBestScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  
  const selectedCar = cars.find(car => car.id === parseInt(carId as string));
  const currentScore = parseInt(score as string);
  
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadBestScore();
    
    // Animations
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadBestScore = async () => {
    try {
      const savedBestScore = await AsyncStorage.getItem('bestScore');
      const best = savedBestScore ? parseInt(savedBestScore) : 0;
      setBestScore(best);
      
      if (currentScore > best) {
        setIsNewRecord(true);
        await AsyncStorage.setItem('bestScore', currentScore.toString());
        setBestScore(currentScore);
      }
    } catch (error) {
      console.error('Error loading best score:', error);
    }
  };

  const getScoreRating = (score: number) => {
    if (score < 100) return { emoji: '🥉', text: 'Новичок', color: '#CD7F32' };
    if (score < 300) return { emoji: '🥈', text: 'Хорошо', color: '#C0C0C0' };
    if (score < 500) return { emoji: '🥇', text: 'Отлично', color: '#FFD700' };
    if (score < 1000) return { emoji: '🏆', text: 'Мастер', color: '#FF6B35' };
    return { emoji: '👑', text: 'Легенда', color: '#9C27B0' };
  };

  const rating = getScoreRating(currentScore);

  const playAgain = () => {
    router.push({
      pathname: '/race',
      params: { 
        carId: carId,
        driverPhoto: driverPhoto 
      }
    });
  };

  const goHome = () => {
    router.push('/');
  };

  const changeCar = () => {
    router.push('/car-selection');
  };

  return (
    <LinearGradient
      colors={['#87CEEB', '#98D8E8']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Results Header */}
        <Animated.View 
          style={[
            styles.headerSection,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.resultsTitle}>🏁 РЕЗУЛЬТАТЫ ГОНКИ</Text>
          
          {isNewRecord && (
            <View style={styles.newRecordBanner}>
              <Text style={styles.newRecordText}>🎉 НОВЫЙ РЕКОРД! 🎉</Text>
            </View>
          )}
        </Animated.View>

        {/* Score Section */}
        <Animated.View 
          style={[
            styles.scoreSection,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.mainScoreCard}>
            <Text style={styles.scoreLabel}>ТВОЙ СЧЕТ</Text>
            <Text style={styles.mainScore}>{currentScore}</Text>
            
            <View style={[styles.ratingBadge, { backgroundColor: rating.color }]}>
              <Text style={styles.ratingEmoji}>{rating.emoji}</Text>
              <Text style={styles.ratingText}>{rating.text}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>ЛУЧШИЙ СЧЕТ</Text>
              <Text style={styles.statValue}>{bestScore}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>ДИСТАНЦИЯ</Text>
              <Text style={styles.statValue}>{Math.floor(currentScore / 10)}м</Text>
            </View>
          </View>
        </Animated.View>

        {/* Player Summary */}
        <View style={styles.playerSummary}>
          <View style={styles.playerInfo}>
            <Text style={styles.carEmoji}>{selectedCar?.emoji}</Text>
            {driverPhoto && (
              <Image 
                source={{ uri: driverPhoto as string }} 
                style={styles.driverPhoto} 
              />
            )}
          </View>
          <Text style={styles.carName}>{selectedCar?.name}</Text>
          <Text style={styles.driverLabel}>Водитель: Ты!</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={playAgain}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>🔄 ИГРАТЬ СНОВА</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={changeCar}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>🚗 СМЕНИТЬ МАШИНУ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={goHome}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>🏠 ГЛАВНОЕ МЕНЮ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>ДОСТИЖЕНИЯ:</Text>
          <View style={styles.achievementsList}>
            {currentScore >= 100 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>🎯</Text>
                <Text style={styles.achievementText}>Первая сотня</Text>
              </View>
            )}
            {currentScore >= 300 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>🚀</Text>
                <Text style={styles.achievementText}>Скоростной</Text>
              </View>
            )}
            {currentScore >= 500 && (
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>⭐</Text>
                <Text style={styles.achievementText}>Звездный гонщик</Text>
              </View>
            )}
            {isNewRecord && (
              <View style={styles.achievement}>
                <Text style={styles.achievementEmoji}>🏆</Text>
                <Text style={styles.achievementText}>Рекордсмен</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  newRecordBanner: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
    borderWidth: 3,
    borderColor: '#FFA500',
  },
  newRecordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainScoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  mainScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  playerSummary: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  playerInfo: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  carEmoji: {
    fontSize: 60,
  },
  driverPhoto: {
    position: 'absolute',
    top: 10,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  driverLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  actionButtons: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  primaryButton: {
    width: '80%',
    height: 60,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  secondaryButtons: {
    width: '100%',
    gap: 10,
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
  achievementsSection: {
    width: '100%',
    alignItems: 'center',
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  achievementEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});