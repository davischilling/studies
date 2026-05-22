import AsyncStorage from "@react-native-async-storage/async-storage";
import { PLAYER_STORAGE } from "@storage/config";
import { AppError } from "@utils/AppError";
import { getStoragePlayersByGroup } from "./getAll";
import { PlayerStorage } from "./types";

export async function deleteStoragePlayerByGroup(
  playerToRemove: PlayerStorage,
  group: string
) {
  try {
    const players = await getStoragePlayersByGroup(group);
    const playerExists = players.some(
      (storagePlayer) =>
        storagePlayer.name.toLowerCase() === playerToRemove.name.toLowerCase()
    );
    if (!playerExists) {
      console.log("Player not found to delete");
      throw new AppError("Jogador não está incluso neste grupo.");
    } else {
      const filteredPlayers = players.filter(
        (storagePlayer) =>
          storagePlayer.name.toLowerCase() !== playerToRemove.name.toLowerCase()
      );
      await AsyncStorage.setItem(
        `${PLAYER_STORAGE}:${group}`,
        JSON.stringify(filteredPlayers)
      );
    }
  } catch (e) {
    console.log(e);
    throw new Error("Error deleting player");
  }
}
