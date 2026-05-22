import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";

import { Button } from "@components/Button";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { Input } from "@components/Input";
import { setStorageGroup } from "@storage/group";
import { AppError } from "@utils/AppError";

import { Container, Content, Icon } from "./styles";

type Props = {};

export const NewGroup = ({}: Props) => {
  const [group, setGroup] = useState("");
  const navigation = useNavigation();
  const handleAddNewGroup = async () => {
    try {
      if (group.trim().length === 0) {
        setGroup("");
        throw new AppError("Informe o nome da turma");
      }
      await setStorageGroup(group);
    } catch (e) {
      if (e instanceof AppError) {
        return Alert.alert('Ops!', e.message);
      } else {
        console.log(e);
        return Alert.alert('Ops!', 'Ocorreu um erro ao criar a turma');
      }
    }
    navigation.navigate("Players", { group });
  };
  return (
    <Container>
      <Header showBackBtn />
      <Content>
        <Icon />
        <Highlight
          title="Nova turma"
          subtitle="Cire a turma para adicionar as pessoas"
        />
        <Input placeholder="Nome da turma" onChangeText={setGroup} value={group} />
        <Button title="Criar" style={{ marginTop: 20 }} onPress={handleAddNewGroup} />
      </Content>
    </Container>
  );
};
