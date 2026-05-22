import { Heading, HStack, Text } from "native-base";
import { InterfaceHStackProps } from "native-base/lib/typescript/components/primitives/Stack/HStack";

type Props = {
  title: string;
  counter: number;
} & InterfaceHStackProps;

export const ExerciseCounter = ({ title, counter, ...rest }: Props) => (
  <HStack justifyContent="space-between" mb={5} {...rest}>
    <Heading color="gray.200" fontSize="md" fontFamily="heading">
      {title}
    </Heading>
    <Text color="gray.200" fontSize="sm">
      {counter}
    </Text>
  </HStack>
);
