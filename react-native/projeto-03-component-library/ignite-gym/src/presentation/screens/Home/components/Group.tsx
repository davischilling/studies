import { Text, Pressable, IPressableProps } from "native-base";

type Props = IPressableProps & {
  name: string;
  isActive: boolean;
  onPress: () => void;
};

export const Group = ({ name, isActive, onPress, ...rest }: Props) => (
  <Pressable
    mr={3}
    w={24}
    h={10}
    bg="gray.600"
    rounded="md"
    justifyContent="center"
    alignItems="center"
    overflow="hidden"
    onPress={onPress}
    isPressed={isActive}
    _pressed={{
      borderColor: "green.500",
      borderWidth: 1,
    }}
    {...rest}
  >
    <Text
      color={isActive ? "green.500" : "gray.200"}
      fontSize="xs"
      textTransform="uppercase"
      fontWeight="bold"
    >
      {name}
    </Text>
  </Pressable>
);
