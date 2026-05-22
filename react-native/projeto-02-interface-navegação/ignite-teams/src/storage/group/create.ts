import AsyncStorage from "@react-native-async-storage/async-storage";
import { GROUP_STORAGE } from "@storage/config";
import { AppError } from "@utils/AppError";
import { getStorageGroups } from "./getAll";

export async function setStorageGroup(group: string) {
  try {
    const groups = await getStorageGroups();
    const groupExists = groups.some(
      (storageGroup) => storageGroup.toLowerCase() === group.toLowerCase()
    );
    if (!groupExists) {
      await AsyncStorage.setItem(
        GROUP_STORAGE,
        JSON.stringify([...groups, group])
      );
    } else {
      console.log("Group already exists");
      throw new AppError("Turma já existe");
    }
  } catch (e) {
    console.log(e);
    throw new Error("Error creating group");
  }
}
