import { TouchableOpacityProps } from "react-native";
import { Container, Title, Icon } from "./styles";

type Props = TouchableOpacityProps & {
  title: string;
};

export const GroupCard = ({ title, ...rest }: Props) => (
  <Container {...rest}>
    <Icon />
    <Title>{title}</Title>
  </Container>
);
