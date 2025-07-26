import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface RaceResult {
  position: number;
  driver: {
    id: number;
    name: string;
    photo: string | null;
    isPlayer: boolean;
    carEmoji: string;
    color: string;
  };
  distance: number;
}

export default function MultiplayerResultsScreen() {
  const { results, winner, playerWon } = useLocalSearchParams();
  const raceResults: RaceResult[] = JSON.parse(results as string);
  const winnerData = winner ? JSON.parse(winner as string) : null;
  const isPlayerWinner = playerWon === 'true';

  const getPositionEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏁';
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#CCCCCC';
    }
  };

  const handlePlayAgain = () => {
    router.push('/drivers-setup');
  };

  const handleMainMenu = () => {
    router.push('/');
  };

  return (
    <LinearGradient
      colors={['#87CEEB', '#98D8E8']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🏁 Результаты гонки</Text>
        
        {/* Победитель */}
        {winnerData && (
          <View style={styles.winnerSection}>
            <Text style={styles.winnerTitle}>
              {isPlayerWinner ? '🎉 Ты победил!' : '🏆 Победитель'}
            </Text>
            <View style={styles.winnerCard}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.winnerCardGradient}
              >
                <Text style={styles.winnerCarEmoji}>{winnerData.carEmoji}</Text>
                {winnerData.photo && (
                  <View style={styles.winnerPhoto}>
                    <Image source={{ uri: winnerData.photo }} style={styles.photoImage} />
                  </View>
                )}
                <Text style={styles.winnerName}>{winnerData.name}</Text>
                <Text style={styles.crownEmoji}>👑</Text>
              </LinearGradient>
            </View>
          </View>
        )}
      </View>

      {/* Таблица результатов */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsTitle}>Финальная таблица:</Text>
        
        {raceResults.map((result, index) => (
          <View key={result.driver.id} style={styles.resultRow}>
            <LinearGradient
              colors={
                result.driver.isPlayer 
                  ? ['#FF6B35', '#F7931E'] 
                  : ['#FFFFFF', '#F0F0F0']
              }
              style={styles.resultRowGradient}
            >
              {/* Позиция */}
              <View style={styles.positionContainer}>
                <Text style={styles.positionEmoji}>
                  {getPositionEmoji(result.position)}
                </Text>
                <Text style={[
                  styles.positionNumber,
                  { color: getPositionColor(result.position) }
                ]}>
                  {result.position}
                </Text>
              </View>

              {/* Водитель */}
              <View style={styles.driverContainer}>
                <View style={styles.carSection}>
                  <Text style={styles.resultCarEmoji}>{result.driver.carEmoji}</Text>
                  {result.driver.photo && (
                    <View style={styles.driverPhotoSmall}>
                      <Image source={{ uri: result.driver.photo }} style={styles.photoImage} />
                    </View>
                  )}
                </View>
                
                <View style={styles.driverInfo}>
                  <Text style={[
                    styles.driverName,
                    result.driver.isPlayer && styles.playerDriverName
                  ]}>
                    {result.driver.name}
                    {result.driver.isPlayer && ' (Ты)'}
                  </Text>
                  <Text style={[
                    styles.distanceText,
                    result.driver.isPlayer && styles.playerDistanceText
                  ]}>
                    Дистанция: {result.distance}м
                  </Text>
                </View>
              </View>

              {/* Индикатор игрока */}
              {result.driver.isPlayer && (
                <View style={styles.playerBadge}>
                  <Text style={styles.playerBadgeText}>👤</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>📊 Статистика:</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            🏁 Участников: {raceResults.length}
          </Text>
          <Text style={styles.statText}>
            🎯 Твое место: {raceResults.find(r => r.driver.isPlayer)?.position || 'N/A'}
          </Text>
        </View>
        <Text style={styles.statText}>
          🏆 {isPlayerWinner ? 'Отличная гонка!' : 'В следующий раз повезет больше!'}
        </Text>
      </View>

      {/* Кнопки действий */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePlayAgain}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonText}>🔄 ИГРАТЬ СНОВА</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleMainMenu}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonText}>🏠 ГЛАВНОЕ МЕНЮ</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 20,
  },
  winnerSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  winnerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  winnerCard: {
    width: 120,
    height: 120,
    borderRadius: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  winnerCardGradient: {
    flex: 1,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  winnerCarEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  winnerPhoto: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 5,
  },
  winnerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  crownEmoji: {
    position: 'absolute',
    top: -5,
    fontSize: 20,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultRow: {
    marginBottom: 12,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resultRowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    position: 'relative',
  },
  positionContainer: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 50,
  },
  positionEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  positionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  carSection: {
    position: 'relative',
    marginRight: 15,
  },
  resultCarEmoji: {
    fontSize: 35,
  },
  driverPhotoSmall: {
    position: 'absolute',
    top: 2,
    left: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  playerDriverName: {
    color: '#FFFFFF',
  },
  distanceText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  playerDistanceText: {
    color: '#FFFFFF',
  },
  playerBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerBadgeText: {
    fontSize: 12,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 15,
  },
  actionButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
});