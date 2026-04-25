import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { RotateCcw, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { runAnalysis, isAnalyzing } = useAnalysis();

  const capture = async () => {
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

    await runAnalysis(previewUri);
    router.replace('/(tabs)');
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-bmBlack px-5">
        <Text className="text-center text-xl font-bold text-bmWhite">Permissao de camara</Text>
        <Text className="mt-2 text-center text-base text-bmDim">Precisamos da camara para tirar a selfie.</Text>
        <Button className="mt-6 w-full" title="Permitir camara" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  if (previewUri) {
    return (
      <SafeAreaView className="flex-1 bg-bmBlack">
        <View className="flex-row items-center justify-between px-5 py-4">
          <Text className="text-xl font-bold text-bmWhite">Preview</Text>
          <Pressable onPress={() => router.back()}>
            <X color={colors.white} />
          </Pressable>
        </View>
        <Image source={{ uri: previewUri }} className="flex-1" resizeMode="cover" />
        <View className="gap-3 px-5 py-5">
          <Button title="Usar esta foto" loading={isAnalyzing} onPress={usePhoto} />
          <Button title="Tentar novamente" variant="secondary" onPress={() => setPreviewUri(null)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-bmBlack">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} flash="auto">
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between px-5 py-4">
            <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-bmBlack/70" onPress={() => router.back()}>
              <X color={colors.white} />
            </Pressable>
            <Text className="text-base font-semibold text-bmWhite">Posiciona o teu rosto dentro do oval</Text>
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full bg-bmBlack/70"
              onPress={() => setFacing((current) => (current === 'front' ? 'back' : 'front'))}
            >
              <RotateCcw color={colors.gold} />
            </Pressable>
          </View>
          <View className="flex-1 items-center justify-center">
            <View className="h-[440px] w-[290px] rounded-full border-2 border-bmGold/80 bg-transparent" />
          </View>
          <View className="items-center pb-10">
            <Pressable className="h-20 w-20 rounded-full border-4 border-bmGold bg-bmWhite" onPress={capture} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
