import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Image, 
  Animated,
  PanResponder,
  Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'rock' | 'oil' | 'cone';
}

export default function RaceScreen() {
  const { carId, driverPhoto } = useLocalSearchParams();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(2);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [carPosition, setCarPosition] = useState(width / 2 - 30);
  
  const carY = height - 150;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleIdRef = useRef(0);

  // Car movement with pan responder
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (!gameStarted || gameOver) return;
      
      const newX = Math.max(20, Math.min(width - 80, carPosition + gestureState.dx));
      setCarPosition(newX);
    },
  });

  // Generate obstacles
  const generateObstacle = () => {
    const types: ('rock' | 'oil' | 'cone')[] = ['rock', 'oil', 'cone'];
    const newObstacle: Obstacle = {
      id: obstacleIdRef.current++,
      x: Math.random() * (width - 60) + 20,
      y: -50,
      type: types[Math.floor(Math.random() * types.length)],
    };
    setObstacles(prev => [...prev, newObstacle]);
  };

  // Check collision
  const checkCollision = (carX: number, carY: number, obstacle: Obstacle) => {
    const carWidth = 60;
    const carHeight = 40;
    const obstacleSize = 40;
    
    return (
      carX < obstacle.x + obstacleSize &&
      carX + carWidth > obstacle.x &&
      carY < obstacle.y + obstacleSize &&
      carY + carHeight > obstacle.y
    );
  };

  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        // Move obstacles
        setObstacles(prev => {
          const updated = prev.map(obstacle => ({
            ...obstacle,
            y: obstacle.y + speed
          })).filter(obstacle => obstacle.y < height + 50);

          // Check collisions
          updated.forEach(obstacle => {
            if (checkCollision(carPosition, carY, obstacle)) {
              setGameOver(true);
            }
          });

          return updated;
        });

        // Increase score
        setScore(prev => prev + 1);

        // Increase speed gradually
        setSpeed(prev => Math.min(prev + 0.01, 8));

        // Generate new obstacles
        if (Math.random() < 0.02) {
          generateObstacle();
        }
      }, 50);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, carPosition, speed]);

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSpeed(2);
    setObstacles([]);
    setCarPosition(width / 2 - 30);
    
    // Start road animation
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  // End game
  const endGame = () => {
    setGameOver(true);
    router.push({
      pathname: '/results',
      params: { 
        score: score.toString(),
        carId: carId,
        driverPhoto: driverPhoto 
      }
    });
  };

  // Get obstacle emoji
  const getObstacleEmoji = (type: string) => {
    switch (type) {
      case 'rock': return '🪨';
      case 'oil': return '🛢️';
      case 'cone': return '🚧';
      default: return '🪨';
    }
  };

  if (!gameStarted) {
    return (
      <LinearGradient
        colors={['#87CEEB', '#98D8E8']}
        style={styles.container}
      >
        <View style={styles.startScreen}>
          <Text style={styles.readyTitle}>Готов к гонке?</Text>
          
          <View style={styles.carPreview}>
            <Text style={styles.carEmoji}>🏎️</Text>
            {driverPhoto && (
              <View style={styles.driverInCar}>
                <Image source={{ uri: driverPhoto as string }} style={styles.driverPhoto} />
              </View>
            )}
          </View>

          <Text style={styles.instructions}>
            Управляй машинкой, избегай препятствий!
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={startGame}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>🏁 СТАРТ!</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.gameContainer}>
      {/* Road Background */}
      <LinearGradient
        colors={['#4A4A4A', '#2A2A2A']}
        style={styles.road}
      >
        {/* Road lines */}
        <Animated.View
          style={[
            styles.roadLines,
            {
              transform: [{
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100],
                })
              }]
            }
          ]}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <View key={index} style={styles.roadLine} />
          ))}
        </Animated.View>

        {/* Game UI */}
        <View style={styles.gameUI}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Очки: {score}</Text>
            <Text style={styles.speedText}>Скорость: {speed.toFixed(1)}</Text>
          </View>

          <TouchableOpacity
            style={styles.pauseButton}
            onPress={endGame}
          >
            <Text style={styles.pauseButtonText}>⏸️</Text>
          </TouchableOpacity>
        </View>

        {/* Obstacles */}
        {obstacles.map(obstacle => (
          <View
            key={obstacle.id}
            style={[
              styles.obstacle,
              {
                left: obstacle.x,
                top: obstacle.y,
              }
            ]}
          >
            <Text style={styles.obstacleEmoji}>
              {getObstacleEmoji(obstacle.type)}
            </Text>
          </View>
        ))}

        {/* Player Car */}
        <View
          style={[
            styles.playerCar,
            {
              left: carPosition,
              top: carY,
            }
          ]}
          {...panResponder.panHandlers}
        >
          <Text style={styles.carEmoji}>🏎️</Text>
          {driverPhoto && (
            <View style={styles.driverInCar}>
              <Image source={{ uri: driverPhoto as string }} style={styles.driverPhoto} />
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  startScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  readyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  carPreview: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  carEmoji: {
    fontSize: 100,
  },
  driverInCar: {
    position: 'absolute',
    top: 15,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  driverPhoto: {
    width: '100%',
    height: '100%',
  },
  instructions: {
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '600',
  },
  startButton: {
    width: width * 0.7,
    height: 70,
    borderRadius: 35,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonGradient: {
    flex: 1,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  gameContainer: {
    flex: 1,
  },
  road: {
    flex: 1,
    position: 'relative',
  },
  roadLines: {
    position: 'absolute',
    left: width / 2 - 2,
    top: 0,
    width: 4,
    height: height,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  roadLine: {
    width: 4,
    height: 30,
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
  },
  gameUI: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  scoreContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButtonText: {
    fontSize: 20,
  },
  obstacle: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  obstacleEmoji: {
    fontSize: 30,
  },
  playerCar: {
    position: 'absolute',
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});