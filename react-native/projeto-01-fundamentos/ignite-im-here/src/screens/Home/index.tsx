import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";
import { Participant } from "../../components/Participant";
import { useState } from "react";

type Props = {};

type Participant = {
  id: string;
  name: string;
};

export const Home: React.FC<Props> = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participant, setParticipant] = useState<string>("");

  const onNameChange = (name: string) => {
    setParticipant(name);
  };

  const handleAddParticipant = (name: string) => {
    if (!name)
      return Alert.alert("Nome inválido", "O nome do participante é inválido.");
    if (participants.some((participant) => participant.name.toLowerCase() === name.toLowerCase())) {
      return Alert.alert(
        "Nome duplicado",
        "O nome do participante já existe na lista do evento."
      );
    }
    const newParticipant: Participant = {
      id: new Date().getTime().toString(),
      name,
    };
    setParticipants((prevState) => [...prevState, newParticipant]);
    setParticipant("");
  };

  const handleRemoveParticipant = ({ id, name }: Participant) => {
    Alert.alert(
      "Remover",
      `Tem certeza que deseja remover o participante ${name}?`,
      [
        {
          text: "Sim",
          onPress: () => {
            setParticipants((prevState) =>
              prevState.filter((participant) => participant.id !== id)
            );
            Alert.alert("Removido", `${name} foi removido com sucesso.`);
          },
        },
        {
          text: "Não",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eventName}>Nome do evento</Text>
      <Text style={styles.eventDate}>Sexta, 4 de novembro de 2022.</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome do participante"
          placeholderTextColor="#6B6B6B"
          value={participant}
          onChangeText={onNameChange}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleAddParticipant(participant)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      {
        // FlatList is a component that renders a list of items in a more performant way than ScrollView
      }
      <FlatList
        style={styles.participants}
        data={participants}
        keyExtractor={({ id }) => id}
        renderItem={({ item: { id, name } }) => (
          <Participant
            key={id}
            name={name}
            onRemove={() => handleRemoveParticipant({ id, name })}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={styles.emptyList}>
            Ninguém chegou no evento ainda? Adicione participantes a sua lista.
          </Text>
        )}
      />
      {/* <ScrollView style={styles.participants} showsVerticalScrollIndicator={false}>
        {
          PARTICIPANTS.map((participant) => (
            <Participant key={participant} name={participant} onRemove={handleRemoveParticipant} />
          ))
        }
      </ScrollView> */}
    </View>
  );
};
