import { ButtonIcon } from "@components/ButtonIcon";
import { Input } from "@components/Input";
import { MaterialIcons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { Container } from "./styles";

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onIconPress: () => void;
  inputRef?: React.RefObject<TextInput>;
  onSubmitEditing?: () => void;
};

export const FormButtonIcon = ({
  icon,
  placeholder,
  value,
  onChangeText,
  onIconPress,
  inputRef,
  onSubmitEditing,
}: Props) => (
  <Container>
    <Input
      placeholder={placeholder}
      autoCorrect={false}
      value={value}
      onChangeText={onChangeText}
      inputRef={inputRef}
      onSubmitEditing={onSubmitEditing}
      returnKeyType="done"
    />
    <ButtonIcon icon={icon} onPress={onIconPress} />
  </Container>
);
