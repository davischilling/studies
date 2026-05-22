import { UserModel } from "@/domain/models/user";
import { USER_STORAGE } from "@/domain/storage/index";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setStorageUser(user: UserModel) {
  await AsyncStorage.setItem(`${USER_STORAGE}`, JSON.stringify(user));
}

export async function getStorageUser(): Promise<UserModel> {
  const storage = await AsyncStorage.getItem(`${USER_STORAGE}`);
  const user: UserModel = storage ? JSON.parse(storage) : {};
  return user;
}

export async function deleteStorageUser() {
  await AsyncStorage.setItem(`${USER_STORAGE}`, JSON.stringify({}));
}
