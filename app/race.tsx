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

const cars = [
  { id: 1, emoji: '🚗', name: 'Спидстер' },
  { id: 2, emoji: '🚙', name: 'Внедорожник' },
  { id: 3, emoji: '🏎️', name: 'Формула' },
  { id: 4, emoji: '🚐', name: 'Фургон' },
  { id: 5, emoji: '🚕', name: 'Такси' },
  { id: 6, emoji: '🚓', name: 'Полиция' },
];

const obstacles = ['🌳', '🪨', '🚧', '⛽', '🛑'];

export default function RaceScreen() {
  const { carId, driverPhoto } = useLocalSearchParams();
  const selectedCar = cars.find(car => car.id === parseInt(carId as string));
  
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [obstacleList, setObstacleList] = useState<Array<{id: number, x: number, y: number, emoji: string}>>([]);
  
  const carPosition = useRef(new Animated.ValueXY({ x: width / 2 - 40, y: height - 150 })).current;
  const roadOffset = useRef(new Animated.Value(0)).current;
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleIdRef = useRef(0);

  // Pan responder for car movement
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (!gameStarted || gameOver) return;
      
      const newX = Math.max(20, Math.min(width - 100, gestureState.moveX - 40));
      carPosition.setValue({ x: newX, y: height - 150 });
    },
  });

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSpeed(2);
    setObstacleList([]);
    
    // Start road animation
    Animated.loop(
      Animated.timing(roadOffset, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: false,
      })
    ).start();
    
    // Game loop
    gameLoopRef.current = setInterval(() => {
      updateGame();
    }, 50);
  };

  // Update game logic
  const updateGame = () => {
    setScore(prev => prev + 1);
    
    // Increase speed gradually
    setSpeed(prev => Math.min(prev + 0.01, 8));
    
    // Add obstacles randomly
    if (Math.random() < 0.02) {
      const newObstacle = {
        id: obstacleIdRef.current++,
        x: Math.random() * (width - 60) + 30,
        y: -50,
        emoji: obstacles[Math.floor(Math.random() * obstacles.length)]
      };
      setObstacleList(prev => [...prev, newObstacle]);
    }
    
    // Move obstacles down
    setObstacleList(prev => 
      prev.map(obstacle => ({
        ...obstacle,
        y: obstacle.y + speed * 3
      })).filter(obstacle => obstacle.y < height + 50)
    );
  };

  // Check collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const carX = carPosition.x._value;
    const carY = height - 150;
    
    obstacleList.forEach(obstacle => {
      const distance = Math.sqrt(
        Math.pow(carX - obstacle.x, 2) + Math.pow(carY - obstacle.y, 2)
      );
      
      if (distance < 50) {
        endGame();
      }
    });
  }, [obstacleList, gameStarted, gameOver]);

  // End game
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    roadOffset.stopAnimation();
    
    setTimeout(() => {
      router.push({
        pathname: '/results',
        params: { 
          score: score,
          carId: carId,
          driverPhoto: driverPhoto 
        }
      });
    }, 1500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Road Background */}
      <LinearGradient
        colors={['#90EE90', '#32CD32']}
        style={styles.road}
      >
        {/* Road Lines */}
        <Animated.View 
          style={[
            styles.roadLines,
            {
              transform: [{
                translateY: roadOffset.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, 100],
                })
              }]
            }
          ]}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <View key={i} style={[styles.roadLine, { top: i * 100 }]} />
          ))}
        </Animated.View>
        
        {/* Obstacles */}
        {obstacleList.map(obstacle => (
          <View
            key={obstacle.id}
            style={[
              styles.obstacle,
              { left: obstacle.x, top: obstacle.y }
            ]}
          >
            <Text style={styles.obstacleEmoji}>{obstacle.emoji}</Text>
          </View>
        ))}
        
        {/* Player Car */}
        <Animated.View
          style={[
            styles.playerCar,
            {
              transform: carPosition.getTranslateTransform()
            }
          ]}
          {...panResponder.panHandlers}
        >
          <Text style={styles.carEmoji}>{selectedCar?.emoji}</Text>
          {driverPhoto && (
            <Image 
              source={{ uri: driverPhoto as string }} 
              style={styles.driverPhotoInCar} 
            />
          )}
        </Animated.View>
      </LinearGradient>

      {/* UI Overlay */}
      <View style={styles.uiOverlay}>
        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>ОЧКИ: {score}</Text>
          <Text style={styles.speedText}>СКОРОСТЬ: {speed.toFixed(1)}</Text>
        </View>

        {/* Start Game Button */}
        {!gameStarted && !gameOver && (
          <View style={styles.startOverlay}>
            <Text style={styles.readyText}>ГОТОВ К ГОНКЕ?</Text>
            <TouchableOpacity
              style={styles.startGameButton}
              onPress={startGame}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.startGameButtonGradient}
              >
                <Text style={styles.startGameButtonText}>🏁 СТАРТ!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Game Over */}
        {gameOver && (
          <View style={styles.gameOverOverlay}>
            <Text style={styles.gameOverText}>💥 АВАРИЯ!</Text>
            <Text style={styles.finalScoreText}>Финальный счет: {score}</Text>
          </View>
        )}

        {/* Controls Hint */}
        {gameStarted && !gameOver && (
          <View style={styles.controlsHint}>
            <Text style={styles.controlsText}>👆 Перетаскивай машинку</Text>
          </View>
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← НАЗАД</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  road: {
    flex: 1,
    position: 'relative',
  },
  roadLines: {
    position: 'absolute',
    left: width / 2 - 2,
    width: 4,
    height: height * 2,
  },
  roadLine: {
    position: 'absolute',
    width: 4,
    height: 40,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  obstacle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obstacleEmoji: {
    fontSize: 40,
  },
  playerCar: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carEmoji: {
    fontSize: 60,
  },
  driverPhotoInCar: {
    position: 'absolute',
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  uiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  scoreContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  speedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  startOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  readyText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  startGameButton: {
    width: 200,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startGameButtonGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startGameButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 30,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 15,
  },
  finalScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  controlsHint: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});