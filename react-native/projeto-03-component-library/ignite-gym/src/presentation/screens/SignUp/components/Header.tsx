import { Center, Image, Text, Heading } from "native-base";

import BGImg from "@/presentation/assets/background.png";
import LogoSVG from "@/presentation/assets/logo.svg";

export const Header = () => (
  <>
    <Image
      source={BGImg}
      defaultSource={BGImg}
      alt="Pessoas treinando"
      resizeMode="contain"
      position="absolute"
    />
    <Center my={24}>
      <LogoSVG />
      <Text color="gray.100" fontSize="sm">
        Treine a sua mente e o seu corpo
      </Text>
    </Center>
    <Heading
      color="gray.100"
      fontSize="xl"
      mb={6}
      textAlign="center"
      fontFamily="heading"
    >
      Crie sua conta
    </Heading>
  </>
);
