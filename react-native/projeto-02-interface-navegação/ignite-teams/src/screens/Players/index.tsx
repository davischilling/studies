import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  deleteStoragePlayerByGroup,
  getStoragePlayersByGroup,
  PlayerStorage,
  setStoragePlayerByGroup,
} from "@storage/player";
import { RootStackParamList } from "navigation/types";
import { useEffect, useState, useRef } from "react";
import { Alert, FlatList, TextInput } from "react-native";

import { Button } from "@components/Button";
import { Filter } from "@components/Filter";
import { FormButtonIcon } from "@components/FormButtonIcon";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { ListEmpty } from "@components/ListEmpty";
import { PlayerCard } from "@components/PlayerCard";
import { AppError } from "@utils/AppError";
import { Container, HeaderList, NumberOfPlayers } from "./styles";
import { deleteStorageGroup } from "@storage/group";
import { Loading } from "@components/Loading";

type Props = {};

export const Players = ({}: Props) => {
  const navigation = useNavigation();
  const {
    params: { group },
  } = useRoute<RouteProp<RootStackParamList, "Players">>();

  const [player, setPlayer] = useState("" as string);
  const [team, setTeam] = useState("Time A" as string);
  const [groupPlayers, setGroupPlayers] = useState<PlayerStorage[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<PlayerStorage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const playerRef = useRef<TextInput>(null);

  const handleAddNewPlayer = async () => {
    try {
      if (player.trim().length === 0) {
        setPlayer("");
        throw new AppError("Informe o nome do jogador");
      }
      const newPlayer: PlayerStorage = {
        name: player,
        team,
      };
      await setStoragePlayerByGroup(newPlayer, group);
      playerRef.current?.blur();
      setPlayer("");
      const newGroupPlayers = [...groupPlayers, newPlayer];
      filterPlayersByTeam(newGroupPlayers);
    } catch (e) {
      if (e instanceof AppError) {
        return Alert.alert("Ops!", e.message);
      } else {
        console.log(e);
        return Alert.alert("Ops!", "Ocorreu um erro ao criar um jogador");
      }
    }
  };

  const handleRemovePlayer = async (player: PlayerStorage) => {
    try {
      await deleteStoragePlayerByGroup(player, group);
      const filteredGroupPlayers = groupPlayers.filter(groupPlayer => groupPlayer.name !== player.name);
      filterPlayersByTeam(filteredGroupPlayers);
    } catch (e) {
      console.log(e);
      return Alert.alert("Ops!", "Ocorreu um erro ao remover o jogador");
    }
  };

  const handleRemoveGroup = (group: string) => {
    Alert.alert("Remover", "Deseja remover o grupo?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        onPress: () => groupRemove(group),
      },
    ]);
  };

  const groupRemove = async (group: string) => {
    try {
      await deleteStorageGroup(group);
      navigation.navigate("Groups");
    } catch (e) {
      console.log(e);
      return Alert.alert("Ops!", "Ocorreu um erro ao remover o grupo");
    }
  };

  const fetchPlayers = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await getStoragePlayersByGroup(group);
      filterPlayersByTeam(data);
    } catch (e) {
      console.log(e);
      return Alert.alert(
        "Ops!",
        "Ocorreu um erro ao buscar por jogadores desse time"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlayersByTeam = (groupPlayers: PlayerStorage[]) => {
    const filteredPlayers = groupPlayers.filter((player) => player.team === team);
    setGroupPlayers(groupPlayers);
    setTeamPlayers(filteredPlayers);
  }

  useEffect(() => {
    if (groupPlayers.length === 0) {
      fetchPlayers();
    } else {
      filterPlayersByTeam(groupPlayers);
    }
  }, [team]);

  return (
    <Container>
      <Header showBackBtn />
      <Highlight title={group} subtitle="Adicione os jogadores" />
      <FormButtonIcon
        icon="add"
        placeholder="Nome do jogador"
        value={player}
        onChangeText={setPlayer}
        onIconPress={handleAddNewPlayer}
        inputRef={playerRef}
        onSubmitEditing={handleAddNewPlayer}
      />
      <HeaderList>
        <FlatList
          data={["Time A", "Time B"]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Filter
              title={item}
              isActive={item === team}
              onPress={() => setTeam(item)}
            />
          )}
          horizontal
        />
        <NumberOfPlayers>{teamPlayers.length}</NumberOfPlayers>
      </HeaderList>
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={teamPlayers}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <PlayerCard
              name={item.name}
              icon="person"
              btnIcon="close"
              onRemove={() => handleRemovePlayer(item)}
            />
          )}
          ListEmptyComponent={() => (
            <ListEmpty message="Não há pessoas nesse time." />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingBottom: 24 },
            teamPlayers.length === 0 && { flex: 1 },
          ]}
        />
      )}
      <Button
        title="Remover turma"
        type="SECONDARY"
        style={{ marginTop: 16 }}
        onPress={() => handleRemoveGroup(group)}
      />
    </Container>
  );
};
