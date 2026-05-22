import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { SignIn } from "@/presentation/screens/SignIn";
import { SignUp } from "@/presentation/screens/SignUp";

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type AuthNavigatorRoutesProps = NativeStackNavigationProp<AuthStackParamList>;

const { Navigator, Screen } = createNativeStackNavigator<AuthStackParamList>();

export const AuthRoutes = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="SignIn" component={SignIn} />
    <Screen name="SignUp" component={SignUp} />
  </Navigator>
);
