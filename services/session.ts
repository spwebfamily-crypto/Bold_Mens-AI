import * as SecureStore from 'expo-secure-store';

export const sessionKeys = {
  accessToken: 'boldmens.accessToken',
  refreshToken: 'boldmens.refreshToken',
};

export async function saveSession(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(sessionKeys.accessToken, accessToken);
  await SecureStore.setItemAsync(sessionKeys.refreshToken, refreshToken);
}

export async function readSession() {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(sessionKeys.accessToken),
    SecureStore.getItemAsync(sessionKeys.refreshToken),
  ]);

  return { accessToken, refreshToken };
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(sessionKeys.accessToken),
    SecureStore.deleteItemAsync(sessionKeys.refreshToken),
  ]);
}
