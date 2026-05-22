import { TouchableOpacityProps } from "react-native";
import { Container, Name, Icon } from "./styles";
import { MaterialIcons } from "@expo/vector-icons";
import { ButtonIcon } from "@components/ButtonIcon";

type Props = TouchableOpacityProps & {
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  btnIcon: keyof typeof MaterialIcons.glyphMap;
  onRemove: () => void;
};

export const PlayerCard = ({ name, icon, btnIcon, onRemove, ...rest }: Props) => (
  <Container {...rest}>
    <Icon name={icon} />
    <Name>{name}</Name>
    <ButtonIcon icon={btnIcon} type="SECONDARY" onPress={onRemove} />
  </Container>
);
