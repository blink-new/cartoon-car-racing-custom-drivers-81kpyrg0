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

interface Driver {
  id: number;
  name: string;
  photo: string | null;
  isPlayer: boolean;
  carEmoji: string;
  color: string;
}

interface CarState {
  id: number;
  x: number;
  y: number;
  speed: number;
  distance: number;
  driver: Driver;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'rock' | 'oil' | 'cone';
}

export default function MultiplayerRaceScreen() {
  const { driversData } = useLocalSearchParams();
  const drivers: Driver[] = JSON.parse(driversData as string);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [cars, setCars] = useState<CarState[]>([]);
  const [winner, setWinner] = useState<Driver | null>(null);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleIdRef = useRef(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const raceDistance = 1000; // Дистанция гонки

  // Инициализация машинок
  useEffect(() => {
    const initialCars: CarState[] = drivers.map((driver, index) => ({
      id: driver.id,
      x: 20 + (index * (width - 80) / 4), // Распределяем по ширине экрана
      y: height - 150 - (index * 15), // Небольшое смещение по вертикали
      speed: driver.isPlayer ? 0 : Math.random() * 2 + 1, // ИИ имеет случайную скорость
      distance: 0,
      driver: driver
    }));
    setCars(initialCars);
  }, [drivers]);

  // Управление игроком
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (!gameStarted || gameOver || raceFinished) return;
      
      setCars(prev => prev.map(car => {
        if (car.driver.isPlayer) {
          const newX = Math.max(10, Math.min(width - 70, car.x + gestureState.dx));
          return { ...car, x: newX };
        }
        return car;
      }));
    },
  });

  // Генерация препятствий
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

  // Проверка столкновений
  const checkCollision = (carX: number, carY: number, obstacle: Obstacle) => {
    const carWidth = 50;
    const carHeight = 30;
    const obstacleSize = 30;
    
    return (
      carX < obstacle.x + obstacleSize &&
      carX + carWidth > obstacle.x &&
      carY < obstacle.y + obstacleSize &&
      carY + carHeight > obstacle.y
    );
  };

  // ИИ для управления машинками
  const updateAICars = () => {
    setCars(prev => prev.map(car => {
      if (!car.driver.isPlayer) {
        // Простая логика ИИ: избегать препятствий и двигаться вперед
        let newX = car.x;
        let newSpeed = car.speed;
        
        // Проверяем препятствия впереди
        const nearbyObstacles = obstacles.filter(obs => 
          obs.y > car.y - 100 && obs.y < car.y + 50 &&
          Math.abs(obs.x - car.x) < 60
        );
        
        if (nearbyObstacles.length > 0) {
          // Уклоняемся от препятствия
          const obstacle = nearbyObstacles[0];
          if (obstacle.x > car.x) {
            newX = Math.max(10, car.x - 3);
          } else {
            newX = Math.min(width - 70, car.x + 3);
          }
          newSpeed = Math.max(0.5, car.speed - 0.5); // Замедляемся
        } else {
          // Случайное движение и ускорение
          newX += (Math.random() - 0.5) * 2;
          newX = Math.max(10, Math.min(width - 70, newX));
          newSpeed = Math.min(car.speed + 0.1, 3);
        }
        
        return {
          ...car,
          x: newX,
          speed: newSpeed,
          distance: car.distance + newSpeed
        };
      }
      return {
        ...car,
        distance: car.distance + 2 // Игрок движется с постоянной скоростью
      };
    }));
  };

  // Основной игровой цикл
  useEffect(() => {
    if (gameStarted && !gameOver && !raceFinished) {
      gameLoopRef.current = setInterval(() => {
        // Обновляем препятствия
        setObstacles(prev => {
          const updated = prev.map(obstacle => ({
            ...obstacle,
            y: obstacle.y + 4
          })).filter(obstacle => obstacle.y < height + 50);

          // Проверяем столкновения
          cars.forEach(car => {
            updated.forEach(obstacle => {
              if (checkCollision(car.x, car.y, obstacle)) {
                if (car.driver.isPlayer) {
                  setGameOver(true);
                } else {
                  // ИИ замедляется при столкновении
                  setCars(prev => prev.map(c => 
                    c.id === car.id 
                      ? { ...c, speed: Math.max(0.2, c.speed - 1) }
                      : c
                  ));
                }
              }
            });
          });

          return updated;
        });

        // Обновляем ИИ машинки
        updateAICars();

        // Проверяем финиш
        const finishedCars = cars.filter(car => car.distance >= raceDistance);
        if (finishedCars.length > 0 && !raceFinished) {
          const winnerCar = finishedCars.sort((a, b) => b.distance - a.distance)[0];
          setWinner(winnerCar.driver);
          setRaceFinished(true);
        }

        // Генерируем препятствия
        if (Math.random() < 0.03) {
          generateObstacle();
        }
      }, 50);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, raceFinished, cars, obstacles]);

  // Обратный отсчет
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setGameStarted(true);
      // Анимация дороги
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [countdown]);

  // Завершение гонки
  const handleRaceEnd = () => {
    const playerCar = cars.find(car => car.driver.isPlayer);
    const finalResults = cars
      .sort((a, b) => b.distance - a.distance)
      .map((car, index) => ({
        position: index + 1,
        driver: car.driver,
        distance: Math.round(car.distance)
      }));

    router.push({
      pathname: '/multiplayer-results',
      params: { 
        results: JSON.stringify(finalResults),
        winner: winner ? JSON.stringify(winner) : null,
        playerWon: winner?.isPlayer ? 'true' : 'false'
      }
    });
  };

  // Получить эмодзи препятствия
  const getObstacleEmoji = (type: string) => {
    switch (type) {
      case 'rock': return '🪨';
      case 'oil': return '🛢️';
      case 'cone': return '🚧';
      default: return '🪨';
    }
  };

  // Экран обратного отсчета
  if (countdown > 0) {
    return (
      <LinearGradient
        colors={['#87CEEB', '#98D8E8']}
        style={styles.container}
      >
        <View style={styles.countdownScreen}>
          <Text style={styles.countdownTitle}>Приготовься!</Text>
          
          {/* Показываем всех участников */}
          <View style={styles.participantsPreview}>
            {drivers.map((driver, index) => (
              <View key={driver.id} style={styles.participantCard}>
                <Text style={styles.participantCar}>{driver.carEmoji}</Text>
                {driver.photo && (
                  <View style={styles.participantPhoto}>
                    <Image source={{ uri: driver.photo }} style={styles.photoImage} />
                  </View>
                )}
                <Text style={styles.participantName}>{driver.name}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownText}>Гонка начинается!</Text>
        </View>
      </LinearGradient>
    );
  }

  // Экран завершения гонки
  if (raceFinished || gameOver) {
    return (
      <LinearGradient
        colors={['#87CEEB', '#98D8E8']}
        style={styles.container}
      >
        <View style={styles.finishScreen}>
          {gameOver ? (
            <>
              <Text style={styles.gameOverTitle}>💥 Авария!</Text>
              <Text style={styles.gameOverText}>Ты врезался в препятствие!</Text>
            </>
          ) : (
            <>
              <Text style={styles.finishTitle}>🏁 Финиш!</Text>
              {winner && (
                <View style={styles.winnerCard}>
                  <Text style={styles.winnerEmoji}>{winner.carEmoji}</Text>
                  {winner.photo && (
                    <View style={styles.winnerPhoto}>
                      <Image source={{ uri: winner.photo }} style={styles.photoImage} />
                    </View>
                  )}
                  <Text style={styles.winnerText}>
                    Победитель: {winner.name}!
                  </Text>
                  {winner.isPlayer && (
                    <Text style={styles.congratsText}>🎉 Поздравляем!</Text>
                  )}
                </View>
              )}
            </>
          )}

          <TouchableOpacity
            style={styles.resultsButton}
            onPress={handleRaceEnd}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.resultsButtonGradient}
            >
              <Text style={styles.resultsButtonText}>
                📊 РЕЗУЛЬТАТЫ
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Основной игровой экран
  return (
    <View style={styles.gameContainer}>
      {/* Дорога */}
      <LinearGradient
        colors={['#4A4A4A', '#2A2A2A']}
        style={styles.road}
      >
        {/* Линии дороги */}
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

        {/* UI игры */}
        <View style={styles.gameUI}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Прогресс гонки</Text>
            <View style={styles.progressBar}>
              {cars.map(car => (
                <View
                  key={car.id}
                  style={[
                    styles.progressDot,
                    { 
                      left: `${(car.distance / raceDistance) * 100}%`,
                      backgroundColor: car.driver.color
                    }
                  ]}
                >
                  <Text style={styles.progressCarEmoji}>{car.driver.carEmoji}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.pauseButton}
            onPress={handleRaceEnd}
          >
            <Text style={styles.pauseButtonText}>⏸️</Text>
          </TouchableOpacity>
        </View>

        {/* Препятствия */}
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

        {/* Машинки */}
        {cars.map(car => (
          <View
            key={car.id}
            style={[
              styles.car,
              {
                left: car.x,
                top: car.y,
              }
            ]}
            {...(car.driver.isPlayer ? panResponder.panHandlers : {})}
          >
            <Text style={styles.carEmoji}>{car.driver.carEmoji}</Text>
            {car.driver.photo && (
              <View style={styles.driverInCar}>
                <Image source={{ uri: car.driver.photo }} style={styles.driverPhoto} />
              </View>
            )}
            {car.driver.isPlayer && (
              <View style={styles.playerIndicator}>
                <Text style={styles.playerIndicatorText}>👤</Text>
              </View>
            )}
          </View>
        ))}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  countdownScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  countdownTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
  },
  participantsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 15,
  },
  participantCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    borderRadius: 15,
    minWidth: 80,
  },
  participantCar: {
    fontSize: 30,
    marginBottom: 5,
  },
  participantPhoto: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    overflow: 'hidden',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  participantName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  countdownNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#FF6B35',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  countdownText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
  },
  finishScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4444',
    marginBottom: 20,
  },
  gameOverText: {
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 40,
  },
  finishTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
  },
  winnerCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
  },
  winnerEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  winnerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  winnerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  congratsText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginTop: 10,
  },
  resultsButton: {
    width: width * 0.7,
    height: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resultsButtonGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
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
  progressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBar: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    position: 'relative',
  },
  progressDot: {
    position: 'absolute',
    top: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  progressCarEmoji: {
    fontSize: 12,
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
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  obstacleEmoji: {
    fontSize: 25,
  },
  car: {
    position: 'absolute',
    width: 50,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  carEmoji: {
    fontSize: 40,
  },
  driverInCar: {
    position: 'absolute',
    top: 2,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  driverPhoto: {
    width: '100%',
    height: '100%',
  },
  playerIndicator: {
    position: 'absolute',
    top: -10,
    right: -5,
    backgroundColor: '#FF6B35',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerIndicatorText: {
    fontSize: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
});