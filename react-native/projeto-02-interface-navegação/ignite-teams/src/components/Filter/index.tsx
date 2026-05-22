import { TouchableOpacityProps } from "react-native";
import { Container, Title } from "./styles";

type Props = TouchableOpacityProps & {
    title: string;
    isActive?: boolean;
  };

export const Filter = ({ title, isActive = false, ...rest }: Props) => (
  <Container isActive={isActive} {...rest}>
    <Title>{title}</Title>
  </Container>
);
