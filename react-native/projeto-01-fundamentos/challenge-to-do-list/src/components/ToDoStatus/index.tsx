import { StyleProp, Text, TextStyle, View } from "react-native";
import { styles } from "./styles";

type Props = {
  statusStyle?: StyleProp<TextStyle>;
  status: string;
  statusText: number;
};

export const ToDoStatus: React.FC<Props> = ({ statusStyle, status, statusText }) => {
  return (
    <View style={styles.container}>
      <Text style={[statusStyle, styles.status]}>{status}</Text>
      <View style={styles.statusTextWrapper}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    </View>
  );
};
