import { Loading } from "@components/Loading";
import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";
import theme from "@theme/index";
import { StatusBar, View } from "react-native";
import { ThemeProvider } from "styled-components";
import { Routes } from "./src/navigation";

export default function App() {
  const [loadFont] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  return (
    <ThemeProvider theme={theme}>
      <View style={{ flex: 1 }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        {!loadFont ? <Loading /> : <Routes />}
      </View>
    </ThemeProvider>
  );
}
