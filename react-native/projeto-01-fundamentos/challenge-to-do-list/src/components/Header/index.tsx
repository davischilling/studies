import { View } from "react-native";

import { Logo } from "../../svg/Logo";
import { styles } from "./styles";

type Props = {};

export const Header: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Logo containersStyle={styles.logo} />
    </View>
  );
};
