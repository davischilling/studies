import SeriesSVG from "@/presentation/assets/series.svg";
import { Button } from "@/presentation/components/Button";
import { Box, HStack, Text } from "native-base";

type Props = {
  series: number;
  repetitions: number;
  isRegisterLoading: boolean;
  onPress: () => Promise<void>;
};

export const BoxSeries = ({
  series,
  repetitions,
  isRegisterLoading,
  onPress,
}: Props) => (
  <Box bg="gray.600" rounded="md" pb={4} px={4}>
    <HStack alignItems="center" justifyContent="space-around" mb={6} mt={5}>
      <HStack>
        <SeriesSVG />
        <Text color="gray.200" ml={2}>
          {series} séries
        </Text>
      </HStack>
      <HStack>
        <SeriesSVG />
        <Text color="gray.200" ml={2}>
          {repetitions} séries
        </Text>
      </HStack>
    </HStack>
    <Button
      title="Marcar como realizado"
      isLoading={isRegisterLoading}
      onPress={onPress}
    />
  </Box>
);
