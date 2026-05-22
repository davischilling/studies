import { useState, useCallback } from "react";

import { GroupCard } from "@components/GroupCard";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";

import { Button } from "@components/Button";
import { ListEmpty } from "@components/ListEmpty";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";
import { Container } from "./styles";
import { getStorageGroups } from "@storage/group";
import { Loading } from "@components/Loading";

export const Groups = () => {
  const navigation = useNavigation();

  const [groups, setGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNewGroup = () => {
    navigation.navigate("New");
  };

  const handleOpenGroup = (group: string) => {
    navigation.navigate("Players", {
      group,
    });
  };

  const fetchGroups = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await getStorageGroups();
      setGroups(data);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  return (
    <Container>
      <Header />
      <Highlight title="Turmas" subtitle="Jogue com a sua turma" />
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <GroupCard title={item} onPress={() => handleOpenGroup(item)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={groups.length === 0 && { flex: 1 }}
          ListEmptyComponent={() => (
            <ListEmpty message="Que tal cadastrar a primeira turma?" />
          )}
        />
      )}
      <Button title="Criar nova turma" onPress={handleNewGroup} />
    </Container>
  );
};
