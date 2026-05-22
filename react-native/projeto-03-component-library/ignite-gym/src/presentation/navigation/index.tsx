import { useAuth } from "@/domain/hooks/use_auth";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { Box, useTheme } from "native-base";
import { Loading } from "../components";
import { AppRoutes } from "./app.routes";
import { AuthRoutes } from "./auth.routes";

export const Routes = () => {
  const { colors } = useTheme();
  const { user, isLoadingUserFromStorage } = useAuth();

  const theme = DefaultTheme;
  theme.colors.background = colors.gray[700];

  return (
    <Box flex={1} bg="gray.700">
      {isLoadingUserFromStorage ? (
        <Loading />
      ) : (
        <NavigationContainer theme={theme}>
          {user.id ? <AppRoutes /> : <AuthRoutes />}
        </NavigationContainer>
      )}
    </Box>
  );
};
