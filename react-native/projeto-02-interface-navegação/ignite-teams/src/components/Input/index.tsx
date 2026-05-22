import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "styled-components/native";
import { Container } from "./styles";

type Props = TextInputProps & {
  inputRef?: React.RefObject<TextInput>;
};

export const Input = ({ inputRef, ...rest }: Props) => {
  const { COLORS } = useTheme();
  return (
    <Container
      {...rest}
      ref={inputRef}
      placeholderTextColor={COLORS.GRAY_300}
    />
  );
};
