import AsyncStorage from "@react-native-async-storage/async-storage";
import { GROUP_STORAGE, PLAYER_STORAGE } from "@storage/config";
import { AppError } from "@utils/AppError";
import { getStorageGroups } from "./getAll";

export async function deleteStorageGroup(group: string) {
  try {
    const groups = await getStorageGroups();
    const groupExists = groups.some(
      (storageGroup) => storageGroup.toLowerCase() === group.toLowerCase()
    );
    if (!groupExists) {
      console.log("Group not found to delete");
      throw new AppError("Grupo não encontrado.");
    } else {
      const filteredGroups = groups.filter(
        (storageGroup) => storageGroup.toLowerCase() !== group.toLowerCase()
      );
      await AsyncStorage.setItem(GROUP_STORAGE, JSON.stringify(filteredGroups));
      await AsyncStorage.removeItem(`${PLAYER_STORAGE}:${group}`);
    }
  } catch (e) {
    console.log(e);
    throw new Error("Error deleting group");
  }
}
