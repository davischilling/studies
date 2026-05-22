import AsyncStorage from "@react-native-async-storage/async-storage";
import { GROUP_STORAGE } from "@storage/config";

export async function getStorageGroups(): Promise<string[]> {
  try {
    const storage = await AsyncStorage.getItem(GROUP_STORAGE);
    return storage ? JSON.parse(storage) : [];
  } catch (e) {
    console.log(e);
    throw new Error("Error getting groups");
  }
}
