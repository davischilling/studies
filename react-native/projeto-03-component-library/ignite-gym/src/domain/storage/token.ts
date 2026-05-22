import { AuthTokenModel } from "@/domain/models/token";
import { AUTH_TOKEN_STORAGE } from "@/domain/storage/index";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SetStorageAuthTokenProps = {
  authToken: AuthTokenModel;
  refreshToken: AuthTokenModel;
}

export async function setStorageAuthToken({
  authToken,
  refreshToken,
}: SetStorageAuthTokenProps) {
  await AsyncStorage.setItem(
    `${AUTH_TOKEN_STORAGE}`,
    JSON.stringify({ authToken, refreshToken })
  );
}

export async function getStorageAuthToken(): Promise<SetStorageAuthTokenProps> {
  const storage = await AsyncStorage.getItem(`${AUTH_TOKEN_STORAGE}`);
  const authToken: SetStorageAuthTokenProps = storage ? JSON.parse(storage) : {};
  return authToken;
}

export async function deleteStorageAuthToken() {
  await AsyncStorage.setItem(`${AUTH_TOKEN_STORAGE}`, JSON.stringify({}));
}
