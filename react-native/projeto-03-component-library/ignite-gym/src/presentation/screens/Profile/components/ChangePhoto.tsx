import { Text } from "native-base";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

type Props = TouchableOpacityProps & {
  text: string;
};

export const ChangePhoto = ({ text, ...rest }: Props) => (
  <TouchableOpacity {...rest}>
    <Text color="green.500" fontWeight="bold" fontSize="md" mt={2} mb={8}>
      {text}
    </Text>
  </TouchableOpacity>
);
