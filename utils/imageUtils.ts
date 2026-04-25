import * as ImageManipulator from 'expo-image-manipulator';

export async function compressSelfie(uri: string) {
  return ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: false,
    },
  );
}

export function guessImageMime(uri: string) {
  return uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
}
