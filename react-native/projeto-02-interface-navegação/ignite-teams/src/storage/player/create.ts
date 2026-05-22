import AsyncStorage from "@react-native-async-storage/async-storage";
import { PLAYER_STORAGE } from "@storage/config";
import { AppError } from "@utils/AppError";
import { getStoragePlayersByGroup } from "./getAll";
import { PlayerStorage } from "./types";

export async function setStoragePlayerByGroup(
  newPlayer: PlayerStorage,
  group: string
) {
  try {
    const players = await getStoragePlayersByGroup(group);
    const playerExists = players.some(
      (storagePlayer) =>
        storagePlayer.name.toLowerCase() === newPlayer.name.toLowerCase()
    );
    if (!playerExists) {
      await AsyncStorage.setItem(
        `${PLAYER_STORAGE}:${group}`,
        JSON.stringify([...players, newPlayer])
      );
    } else {
      console.log("Player already exists");
      throw new AppError("Jogador já está incluido neste grupo.");
    }
  } catch (e) {
    console.log(e);
    throw new Error("Error creating player");
  }
}
