import { ExerciseModel } from "@/domain/models/exercise";
import { getExerciseThumbImage } from "@/domain/utils/get_server_image";
import { Entypo } from "@expo/vector-icons";
import { Heading, HStack, Icon, Image, Text, VStack } from "native-base";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

type Props = TouchableOpacityProps & {
  exercise: ExerciseModel;
};

export const ExerciseCard = ({ exercise, ...rest }: Props) => (
  <TouchableOpacity {...rest}>
    <HStack bg="gray.500" alignItems="center" p={2} pr={4} rounded="md" mb={3}>
      <Image
        alt="Imagem do exercício"
        w={16}
        h={16}
        rounded="md"
        mr={4}
        resizeMode="cover"
        source={{
          uri: getExerciseThumbImage(exercise.thumb),
        }}
      />

      <VStack flex={1}>
        <Heading color="white" fontSize="lg" fontFamily="heading">
          {exercise.name}
        </Heading>
        <Text color="gray.200" fontSize="sm" mt={1} numberOfLines={2}>
          {exercise.series} séries x {exercise.repetitions} repetições
        </Text>
      </VStack>

      <Icon as={Entypo} name="chevron-thin-right" color="gray.300" />
    </HStack>
  </TouchableOpacity>
);
