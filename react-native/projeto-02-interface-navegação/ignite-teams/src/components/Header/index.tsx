import logoImg from "@assets/images/logo/logo.png";
import { useNavigation } from "@react-navigation/native";
import { BackButton, BackIcon, Container, Logo } from "./styles";

type Props = {
  showBackBtn?: boolean;
};

export const Header = ({ showBackBtn = false }: Props) => {
  const navigation = useNavigation();
  const handleGoBack = () => {
    navigation.navigate('Groups');
  }
  return (
    <Container>
      {showBackBtn && (
        <BackButton onPress={handleGoBack}>
          <BackIcon />
        </BackButton>
      )}
      <Logo source={logoImg} />
    </Container>
  );
}
