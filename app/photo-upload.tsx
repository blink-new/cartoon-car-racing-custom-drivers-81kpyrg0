import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function PhotoUploadScreen() {
  const { carId } = useLocalSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
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
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleStartRace = () => {
    if (selectedImage) {
      router.push({
        pathname: '/race',
        params: { 
          carId: carId,
          driverPhoto: selectedImage 
        }
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
        
        <Text style={styles.title}>Добавь свое фото!</Text>
        <Text style={styles.subtitle}>Ты станешь водителем машинки</Text>
      </View>

      <View style={styles.content}>
        {/* Photo Preview */}
        <View style={styles.photoContainer}>
          {selectedImage ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: selectedImage }} style={styles.photoImage} />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoOverlayText}>Твое фото</Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <LinearGradient
                colors={['#FFFFFF', '#F0F0F0']}
                style={styles.placeholder}
              >
                <Text style={styles.placeholderEmoji}>📷</Text>
                <Text style={styles.placeholderText}>Выбери фото</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Upload Options */}
        <View style={styles.uploadOptions}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImageFromGallery}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.uploadButtonGradient}
            >
              <Text style={styles.uploadButtonEmoji}>🖼️</Text>
              <Text style={styles.uploadButtonText}>Из галереи</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={takePhoto}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.uploadButtonGradient}
            >
              <Text style={styles.uploadButtonEmoji}>📸</Text>
              <Text style={styles.uploadButtonText}>Сделать фото</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Car Preview */}
        <View style={styles.carPreview}>
          <Text style={styles.carPreviewTitle}>Твоя машинка:</Text>
          <View style={styles.carContainer}>
            <Text style={styles.carEmoji}>🏎️</Text>
            {selectedImage && (
              <View style={styles.driverInCar}>
                <Image source={{ uri: selectedImage }} style={styles.driverPhoto} />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Start Race Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !selectedImage && styles.disabledButton
          ]}
          onPress={handleStartRace}
          disabled={!selectedImage}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedImage ? ['#FF6B35', '#F7931E'] : ['#CCCCCC', '#AAAAAA']}
            style={styles.startButtonGradient}
          >
            <Text style={[
              styles.startButtonText,
              !selectedImage && styles.disabledButtonText
            ]}>
              🏁 НАЧАТЬ ГОНКУ!
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
  subtitle: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  photoContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  photoOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholderContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  uploadButton: {
    width: (width - 80) / 2,
    height: 80,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  uploadButtonGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  carPreview: {
    alignItems: 'center',
  },
  carPreviewTitle: {
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
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverPhoto: {
    width: '100%',
    height: '100%',
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
  disabledButton: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  startButtonGradient: {
    flex: 1,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  disabledButtonText: {
    color: '#666666',
  },
});