import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";

import { Exercise } from "@/presentation/screens/Exercise";
import { History } from "@/presentation/screens/History";
import { Home } from "@/presentation/screens/Home";
import { Profile } from "@/presentation/screens/Profile";

import HistorySVG from "@/presentation/assets/history.svg";
import HomeSVG from "@/presentation/assets/home.svg";
import ProfileSVG from "@/presentation/assets/profile.svg";
import { useTheme } from "native-base";

export type AppBottomTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
  Exercise: {
    exerciseId: string;
  };
};

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppBottomTabParamList>;

const { Navigator, Screen } = createBottomTabNavigator<AppBottomTabParamList>();

export const AppRoutes = () => {
  const { sizes, colors } = useTheme();
  const iconSize = sizes[6];
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.green[500],
        tabBarInactiveTintColor: colors.gray[200],
        tabBarStyle: {
          backgroundColor: colors.gray[600],
          borderTopWidth: 0,
          height: Platform.OS === "android" ? "auto" : 96,
          paddingBottom: sizes[10],
          paddingTop: sizes[6],
        },
      }}
    >
      <Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeSVG fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="History"
        component={History}
        options={{
          tabBarIcon: ({ color }) => (
            <HistorySVG fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <ProfileSVG fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="Exercise"
        component={Exercise}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Navigator>
  );
};
