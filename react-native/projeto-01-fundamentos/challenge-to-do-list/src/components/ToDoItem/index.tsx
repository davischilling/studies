import { Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Checkbox from "expo-checkbox";
import { styles } from "./styles";
import { ToDoItem as ToDoItemType } from "../../screens/Home";
import { Trash } from "../../svg/Trash";
import { globalColors } from "../../styles/global-theme";

type Props = ToDoItemType & {
  toggleIsFinished: (id: string) => void;
  removeTask: (id: string, value: string) => void;
};

export const ToDoItem: React.FC<Props> = ({
  id,
  isFinished,
  text,
  toggleIsFinished,
  removeTask,
}) => (
  <View style={styles.container}>
    <View style={styles.wrapper}>
      <Checkbox
        style={[
          styles.checkbox,
          isFinished ? styles.checked : styles.unchecked,
        ]}
        value={isFinished}
        onValueChange={() => toggleIsFinished(id)}
        color={isFinished ? globalColors["purple"] : globalColors["blue"]}
      />
      <Text style={[styles.text, isFinished ? styles.checkedText : styles.uncheckedText,]}>{text}</Text>
    </View>
    <TouchableOpacity onPress={() => removeTask(id, text)}>
      <Trash containersStyle={styles.trashIcon} />
    </TouchableOpacity>
  </View>
);
