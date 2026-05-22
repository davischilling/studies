import {TouchableOpacityProps} from 'react-native';
import { ButtonTypeStyleProps, Container, Title } from "./styles";

type Props = TouchableOpacityProps & {
    title: string;
    type?: ButtonTypeStyleProps;
}

export const Button = ({title, type = 'PRIMARY', ...rest}: Props) => (
  <Container type={type} {...rest}>
    <Title>{title}</Title>
  </Container>
);
