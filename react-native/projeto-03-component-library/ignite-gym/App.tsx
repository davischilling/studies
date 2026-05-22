import { Loading } from "@/presentation/components/Loading";
import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";
import { Routes } from "@/presentation/navigation/index";
import { THEME } from "@/presentation/theme/index";
import { NativeBaseProvider, VStack } from "native-base";
import { StatusBar } from "react-native";
import { AuthProvider } from "@/presentation/contexts/Auth";

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });
  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {fontsLoaded ? (
        <AuthProvider>
          <Routes />
        </AuthProvider>
      ) : (
        <VStack flex={1} bg="gray.700">
          <Loading />
        </VStack>
      )}
    </NativeBaseProvider>
  );
}
