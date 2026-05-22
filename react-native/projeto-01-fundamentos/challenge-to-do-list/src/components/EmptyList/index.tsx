import { Text, View } from "react-native";
import { Clipboard } from "../../svg/Clipboard";
import { styles } from "./styles";

type Props = {};

export const EmptyList: React.FC<Props> = () => (
  <View style={styles.container}>
    <Clipboard containersStyle={{ marginBottom: 16 }} />
    <View style={styles.textWrapper}>
      <Text style={styles.firstText}>
        Você ainda não tem tarefas cadastradas
      </Text>
      <Text style={styles.secondText}>
        Crie tarefas e organize seus itens a fazer
      </Text>
    </View>
  </View>
);
