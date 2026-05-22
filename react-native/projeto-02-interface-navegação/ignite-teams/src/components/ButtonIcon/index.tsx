import { TouchableOpacityProps } from "react-native";
import { ButtonIconTypeStyleProps, Container, Icon } from "./styles";
import { MaterialIcons } from "@expo/vector-icons";

type Props = TouchableOpacityProps & {
  icon: keyof typeof MaterialIcons.glyphMap;
  type?: ButtonIconTypeStyleProps;
};

export const ButtonIcon = ({ icon, type = "PRIMARY", ...rest }: Props) => (
  <Container type={type} {...rest}>
    <Icon name={icon} type={type} />
  </Container>
);
