import BodySVG from "@/presentation/assets/body.svg";
import { Feather } from "@expo/vector-icons";
import { Heading, HStack, Icon, Text, VStack } from "native-base";
import { TouchableOpacity } from "react-native";

type Props = {
  name: string;
  group: string;
  onPress: () => void;
};

export const Header = ({ onPress, name, group }: Props) => (
  <VStack px={8} bg="gray.600" pt={12}>
    <TouchableOpacity onPress={onPress}>
      <Icon as={Feather} name="arrow-left" color="green.500" size={6} />
    </TouchableOpacity>
    <HStack justifyContent="space-between" mt={4} mb={8} alignItems="center">
      <Heading color="gray.100" fontSize="lg" flexShrink={1} fontFamily="heading">
        {name}
      </Heading>
      <HStack>
        <BodySVG />
        <Text color="gray.200" ml={1} textTransform="capitalize">
          {group}
        </Text>
      </HStack>
    </HStack>
  </VStack>
);
