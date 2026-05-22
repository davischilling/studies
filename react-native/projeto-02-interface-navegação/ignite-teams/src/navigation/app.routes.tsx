import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Groups } from "@screens/Groups";
import { NewGroup } from "@screens/NewGroup";
import { Players } from "@screens/Players";

export type RootStackParamList = {
  Groups: undefined;
  New: undefined;
  Players: {
    group: string;
  };
};

const { Navigator, Screen } = createNativeStackNavigator<RootStackParamList>();

export const AppRoutes = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="Groups" component={Groups} />
    <Screen name="New" component={NewGroup} />
    <Screen name="Players" component={Players} />
  </Navigator>
);
