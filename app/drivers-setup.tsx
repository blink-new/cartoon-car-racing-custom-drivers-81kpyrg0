import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

interface Driver {
  id: number;
  name: string;
  photo: string | null;
  isPlayer: boolean;
  carEmoji: string;
  color: string;
}

const carOptions = [
  { emoji: '🚗', color: '#FF4444' },
  { emoji: '🏎️', color: '#4444FF' },
  { emoji: '🚙', color: '#44FF44' },
  { emoji: '🚕', color: '#FFFF44' },
];

export default function DriversSetupScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 1, name: 'Ты', photo: null, isPlayer: true, carEmoji: '🏎️', color: '#FF4444' },
    { id: 2, name: 'Соперник 1', photo: null, isPlayer: false, carEmoji: '🚗', color: '#4444FF' },
    { id: 3, name: 'Соперник 2', photo: null, isPlayer: false, carEmoji: '🚙', color: '#44FF44' },
    { id: 4, name: 'Соперник 3', photo: null, isPlayer: false, carEmoji: '🚕', color: '#FFFF44' },
  ]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Разрешение необходимо',
        'Нужно разрешение для доступа к галерее',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageForDriver = async (driverId: number) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, photo: result.assets[0].uri }
          : driver
      ));
    }
  };

  const takePhotoForDriver = async (driverId: number) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Разрешение необходимо',
        'Нужно разрешение для доступа к камере',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, photo: result.assets[0].uri }
          : driver
      ));
    }
  };

  const handleStartRace = () => {
    // Проверяем, что у игрока есть фото
    const playerDriver = drivers.find(d => d.isPlayer);
    if (!playerDriver?.photo) {
      Alert.alert('Добавь свое фото!', 'Нужно добавить фотографию для твоей машинки');
      return;
    }

    router.push({
      pathname: '/multiplayer-race',
      params: { 
        driversData: JSON.stringify(drivers)
      }
    });
  };

  const renderDriverCard = (driver: Driver) => (
    <View key={driver.id} style={styles.driverCard}>
      <LinearGradient
        colors={driver.isPlayer ? ['#FF6B35', '#F7931E'] : ['#FFFFFF', '#F0F0F0']}
        style={styles.driverCardGradient}
      >
        {/* Driver Info */}
        <View style={styles.driverHeader}>
          <Text style={[
            styles.driverName,
            driver.isPlayer && styles.playerDriverName
          ]}>
            {driver.name}
          </Text>
          {driver.isPlayer && (
            <View style={styles.playerBadge}>
              <Text style={styles.playerBadgeText}>👤</Text>
            </View>
          )}
        </View>

        {/* Car Preview */}
        <View style={styles.carPreview}>
          <Text style={styles.carEmoji}>{driver.carEmoji}</Text>
          {driver.photo && (
            <View style={styles.driverInCar}>
              <Image source={{ uri: driver.photo }} style={styles.driverPhoto} />
            </View>
          )}
        </View>

        {/* Photo Actions */}
        <View style={styles.photoActions}>
          {driver.photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: driver.photo }} style={styles.photoThumbnail} />
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={() => pickImageForDriver(driver.id)}
              >
                <Text style={styles.changePhotoText}>Изменить</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addPhotoContainer}>
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => pickImageForDriver(driver.id)}
              >
                <Text style={styles.addPhotoEmoji}>🖼️</Text>
                <Text style={styles.addPhotoText}>Галерея</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => takePhotoForDriver(driver.id)}
              >
                <Text style={styles.addPhotoEmoji}>📸</Text>
                <Text style={styles.addPhotoText}>Камера</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

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
        
        <Text style={styles.title}>Настройка водителей</Text>
        <Text style={styles.subtitle}>Добавь фото для всех участников гонки!</Text>
      </View>

      <ScrollView 
        style={styles.driversContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.driversGrid}>
          {drivers.map(renderDriverCard)}
        </View>
      </ScrollView>

      {/* Start Race Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartRace}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>
              🏁 НАЧАТЬ ГОНКУ 4 МАШИНКИ!
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
  },
  driversContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  driversGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  driverCard: {
    width: (width - 40) / 2,
    height: 280,
    marginBottom: 15,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  driverCardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  playerDriverName: {
    color: '#FFFFFF',
  },
  playerBadge: {
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  playerBadgeText: {
    fontSize: 12,
  },
  carPreview: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  carEmoji: {
    fontSize: 50,
  },
  driverInCar: {
    position: 'absolute',
    top: 5,
    left: 10,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverPhoto: {
    width: '100%',
    height: '100%',
  },
  photoActions: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  photoPreview: {
    alignItems: 'center',
  },
  photoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addPhotoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  addPhotoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 50,
  },
  addPhotoEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  addPhotoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  startButton: {
    width: '100%',
    height: 70,
    borderRadius: 35,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
});