import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { RotateCcw, X, Camera } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Image, Pressable, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Fonts, Radius } from '@/constants/tokens';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { runAnalysis, isAnalyzing } = useAnalysis();

  const capture = async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.85,
      skipProcessing: false,
    });

    if (!photo?.uri) {
      return;
    }

    const compressed = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 1280 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    setPreviewUri(compressed.uri);
  };

  const usePhoto = async () => {
    if (!previewUri) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await runAnalysis(previewUri);
    router.replace('/(tabs)');
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-bmBlack px-8">
        <View className="mb-8 h-20 w-20 items-center justify-center rounded-full bg-bmGold/10">
          <Camera size={40} color={colors.gold} />
        </View>
        <Text className="text-center text-2xl font-bold text-bmWhite" style={{ fontFamily: Fonts.headingBold }}>Permissão de Câmara</Text>
        <Text className="mt-4 text-center text-base text-bmDim leading-6" style={{ fontFamily: Fonts.body }}>
          Precisamos de acesso à tua câmara para analisar o teu rosto e sugerir o melhor corte.
        </Text>
        <Button className="mt-10 w-full" title="Permitir Acesso" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  if (previewUri) {
    return (
      <SafeAreaView className="flex-1 bg-bmBlack">
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Confirmar Foto</Text>
          <Pressable style={styles.closeButton} onPress={() => setPreviewUri(null)}>
            <X color={colors.white} size={24} />
          </Pressable>
        </View>
        <View style={styles.imageContainer}>
          <Image source={{ uri: previewUri }} style={styles.fullImage} resizeMode="cover" />
        </View>
        <View style={styles.previewFooter}>
          <Button title="Analisar esta Foto" loading={isAnalyzing} onPress={usePhoto} />
          <Button title="Tirar outra" variant="secondary" className="mt-2" onPress={() => setPreviewUri(null)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-bmBlack">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} flash="auto">
        <SafeAreaView className="flex-1">
          <View style={styles.cameraHeader}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <X color={colors.white} size={24} />
            </Pressable>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>Posiciona o teu rosto no centro</Text>
            </View>
            <Pressable
              style={styles.iconButton}
              onPress={() => {
                void Haptics.selectionAsync();
                setFacing((current) => (current === 'front' ? 'back' : 'front'));
              }}
            >
              <RotateCcw color={colors.gold} size={24} />
            </Pressable>
          </View>
          
          <View className="flex-1 items-center justify-center">
            <View style={styles.overlay} />
          </View>

          <View style={styles.cameraFooter}>
            <Pressable style={styles.captureButtonOuter} onPress={capture}>
              <View style={styles.captureButtonInner} />
            </Pressable>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    position: 'relative',
  },
  previewTitle: {
    fontSize: 20,
    fontFamily: Fonts.headingBold,
    color: colors.white,
  },
  closeButton: {
    position: 'absolute',
    right: 24,
    padding: 4,
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  fullImage: {
    flex: 1,
  },
  previewFooter: {
    padding: 24,
    gap: 8,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  iconButton: {
    height: 48,
    width: 48,
    itemsCenter: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  instructionContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: colors.white,
  },
  overlay: {
    height: 420,
    width: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderStyle: 'dashed',
  },
  cameraFooter: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButtonOuter: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  captureButtonInner: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
  }
});
