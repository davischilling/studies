import AsyncStorage from "@react-native-async-storage/async-storage";
import { PLAYER_STORAGE } from "@storage/config";
import { PlayerStorage } from "./types";

export async function getStoragePlayersByGroup(
    group: string
  ): Promise<PlayerStorage[]> {
    try {
      const storage = await AsyncStorage.getItem(`${PLAYER_STORAGE}:${group}`);
      return storage ? JSON.parse(storage) : [];
    } catch (e) {
      console.log(e);
      throw new Error("Error getting players");
    }
  }