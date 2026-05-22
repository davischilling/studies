import { getExerciseDemoImage } from "@/domain/utils/get_server_image";
import { Box, Image } from "native-base";

type Props = {
  demo: string;
};

export const ExerciseImage = ({ demo }: Props) => (
  <Box rounded="lg" overflow="hidden">
    <Image
      w="full"
      h={80}
      source={{
        uri: getExerciseDemoImage(demo),
      }}
      alt="Nome do exercício"
      mb={3}
      resizeMode="cover"
      rounded="lg"
    />
  </Box>
);
