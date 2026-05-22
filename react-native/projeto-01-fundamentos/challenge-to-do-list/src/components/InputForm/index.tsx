import { TextInput, TouchableOpacity, View } from "react-native";
import { globalColors } from "../../styles/global-theme";
import { Plus } from "../../svg/Plus";
import { styles } from "./styles";

type Props = {
  onChangeValue: (text: string) => void;
  value: string;
  addNewTask: (text: string) => void;
};

export const InputForm: React.FC<Props> = ({
  onChangeValue,
  value,
  addNewTask,
}) => (
  <View style={styles.formWrapper}>
    <TextInput
      style={styles.input}
      placeholder="Adicione uma nova tarefa"
      placeholderTextColor={globalColors["gray-300"]}
      multiline={false}
      maxLength={70}
      onChangeText={onChangeValue}
      value={value}
    />
    <TouchableOpacity style={styles.button} onPress={() => addNewTask(value)}>
      <Plus containersStyle={styles.plus} />
    </TouchableOpacity>
  </View>
);
