import { Center, Spinner } from "native-base";

export const Loading = () => (
  <Center flex={1}>
    <Spinner color="green.500" size={32} />
  </Center>
);
