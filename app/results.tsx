import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function ResultsScreen() {
  const { score, carId, driverPhoto } = useLocalSearchParams();
  const [bestScore, setBestScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const currentScore = parseInt(score as string) || 0;

  useEffect(() => {
    loadBestScore();
    
    // Start celebration animation
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 1000,
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
    if (score < 100) return { emoji: '🥉', title: 'Новичок', message: 'Неплохо для начала!' };
    if (score < 300) return { emoji: '🥈', title: 'Гонщик', message: 'Отличная езда!' };
    if (score < 500) return { emoji: '🥇', title: 'Профи', message: 'Потрясающий результат!' };
    return { emoji: '👑', title: 'Чемпион', message: 'Невероятно!' };
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
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.celebrationContainer,
              {
                transform: [{
                  scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  })
                }]
              }
            ]}
          >
            <Text style={styles.celebrationEmoji}>{rating.emoji}</Text>
          </Animated.View>
          
          <Text style={styles.resultTitle}>
            {isNewRecord ? '🎉 НОВЫЙ РЕКОРД! 🎉' : 'Финиш!'}
          </Text>
          <Text style={styles.ratingTitle}>{rating.title}</Text>
          <Text style={styles.ratingMessage}>{rating.message}</Text>
        </View>

        {/* Score Display */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCard}>
            <LinearGradient
              colors={['#FFFFFF', '#F0F0F0']}
              style={styles.scoreCardGradient}
            >
              <Text style={styles.scoreLabel}>Твой результат</Text>
              <Text style={styles.currentScore}>{currentScore}</Text>
              <Text style={styles.scoreUnit}>очков</Text>
            </LinearGradient>
          </View>

          <View style={styles.bestScoreCard}>
            <LinearGradient
              colors={isNewRecord ? ['#FFD700', '#FFA500'] : ['#E0E0E0', '#C0C0C0']}
              style={styles.scoreCardGradient}
            >
              <Text style={styles.scoreLabel}>Лучший результат</Text>
              <Text style={styles.bestScoreText}>{bestScore}</Text>
              <Text style={styles.scoreUnit}>очков</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Driver & Car Display */}
        <View style={styles.driverSection}>
          <Text style={styles.driverTitle}>Твоя машинка:</Text>
          <View style={styles.carContainer}>
            <Text style={styles.carEmoji}>🏎️</Text>
            {driverPhoto && (
              <View style={styles.driverInCar}>
                <Image source={{ uri: driverPhoto as string }} style={styles.driverPhoto} />
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={playAgain}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>🔄 ИГРАТЬ ЕЩЁ</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={changeCar}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>🚗 Сменить машинку</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={goHome}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>🏠 Главное меню</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Achievement Badges */}
        <View style={styles.achievementSection}>
          <Text style={styles.achievementTitle}>Достижения:</Text>
          <View style={styles.badges}>
            {currentScore >= 100 && (
              <View style={styles.badge}>
                <Text style={styles.badgeEmoji}>🏁</Text>
                <Text style={styles.badgeText}>100+</Text>
              </View>
            )}
            {currentScore >= 300 && (
              <View style={styles.badge}>
                <Text style={styles.badgeEmoji}>⚡</Text>
                <Text style={styles.badgeText}>300+</Text>
              </View>
            )}
            {currentScore >= 500 && (
              <View style={styles.badge}>
                <Text style={styles.badgeEmoji}>🔥</Text>
                <Text style={styles.badgeText}>500+</Text>
              </View>
            )}
            {isNewRecord && (
              <View style={styles.badge}>
                <Text style={styles.badgeEmoji}>👑</Text>
                <Text style={styles.badgeText}>Рекорд</Text>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  celebrationContainer: {
    marginBottom: 15,
  },
  celebrationEmoji: {
    fontSize: 80,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 5,
  },
  ratingMessage: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '600',
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  scoreCard: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bestScoreCard: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scoreCardGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  currentScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  bestScoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scoreUnit: {
    fontSize: 12,
    color: '#666666',
    fontWeight: 'bold',
  },
  driverSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  driverTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  carContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carEmoji: {
    fontSize: 80,
  },
  driverInCar: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  driverPhoto: {
    width: '100%',
    height: '100%',
  },
  buttonSection: {
    marginBottom: 30,
  },
  primaryButton: {
    width: '100%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  secondaryButtons: {
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
  achievementSection: {
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  badgeEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});