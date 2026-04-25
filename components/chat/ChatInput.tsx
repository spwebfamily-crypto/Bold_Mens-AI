import { Camera, Image as ImageIcon, Send } from 'lucide-react-native';
import { useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { PromptCounter } from '@/components/ui/PromptCounter';

interface ChatInputProps {
  promptLabel: string;
  blocked?: boolean;
  onSendText: (text: string) => void;
  onImagePicked: (uri: string) => void;
  onUpgrade: () => void;
}

export function ChatInput({ promptLabel, blocked, onSendText, onImagePicked, onUpgrade }: ChatInputProps) {
  const [text, setText] = useState('');

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao necessaria', 'Ativa o acesso a galeria para escolher uma selfie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.75,
    });

    if (!result.canceled) {
      onImagePicked(result.assets[0].uri);
    }
  };

  const openCameraChoice = () => {
    if (blocked) {
      onUpgrade();
      return;
    }

    const options = ['Camara', 'Galeria', 'Cancelar'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          userInterfaceStyle: 'dark',
        },
        (index) => {
          if (index === 0) {
            router.push('/analysis/camera');
          }
          if (index === 1) {
            void openGallery();
          }
        },
      );
      return;
    }

    Alert.alert('Selfie', 'Escolhe a origem da foto.', [
      { text: 'Camara', onPress: () => router.push('/analysis/camera') },
      { text: 'Galeria', onPress: () => void openGallery() },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const send = () => {
    if (blocked) {
      onUpgrade();
      return;
    }

    const value = text.trim();
    if (!value) {
      return;
    }

    onSendText(value);
    setText('');
  };

  return (
    <View className="gap-2 border-t border-bmGold/10 bg-bmBlack px-4 pb-3 pt-2">
      <PromptCounter label={promptLabel} blocked={blocked} />
      {blocked ? (
        <Button title="Upgrade para PLUS" onPress={onUpgrade} />
      ) : (
        <View className="min-h-14 flex-row items-center gap-2 rounded-lg border border-bmGold/20 bg-bmDark px-2">
          <Pressable accessibilityRole="button" className="h-10 w-10 items-center justify-center" onPress={openCameraChoice}>
            <Camera size={22} color={colors.gold} />
          </Pressable>
          <Pressable accessibilityRole="button" className="h-10 w-10 items-center justify-center" onPress={openGallery}>
            <ImageIcon size={21} color={colors.whiteDim} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Envia uma foto ou faz uma pergunta..."
            placeholderTextColor={colors.whiteDim}
            className="min-h-12 flex-1 text-base text-bmWhite"
            multiline
          />
          <Pressable accessibilityRole="button" className="h-10 w-10 items-center justify-center" onPress={send}>
            <Send size={21} color={text.trim() ? colors.gold : colors.whiteDim} />
          </Pressable>
        </View>
      )}
    </View>
  );
}
