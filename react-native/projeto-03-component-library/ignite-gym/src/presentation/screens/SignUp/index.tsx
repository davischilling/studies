import { useAuth } from "@/domain/hooks/use_auth";
import {
  SignUpDefaultValues,
  signUpSchema,
  SignUpValidationContext,
} from "@/domain/validations/signUp";
import { Button } from "@/presentation/components/Button";
import { FormValidation } from "@/presentation/contexts/Validation";
import { AuthNavigatorRoutesProps } from "@/presentation/navigation/auth.routes";
import { useNavigation } from "@react-navigation/native";
import { ScrollView, VStack } from "native-base";
import { FormInputs } from "./components/FormInputs";
import { Header } from "./components/Header";

export const SignUp = () => {
  const authNavigation = useNavigation<AuthNavigatorRoutesProps>();
  const { isLoading, handleSignUpSubmit } = useAuth();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={5} pb={16}>
        <Header />
        <FormValidation
          ValidationContext={SignUpValidationContext}
          schema={signUpSchema}
          defaultValues={SignUpDefaultValues}
        >
          <FormInputs onSubmit={handleSignUpSubmit} isLoading={isLoading} />
        </FormValidation>
        <Button
          title="Voltar para o login"
          variant="outline"
          mt={12}
          onPress={() => authNavigation.goBack()}
        />
      </VStack>
    </ScrollView>
  );
};

// Text margin and padding props
// my: margin vertical
// mx: margin horizontal
// px: padding horizontal
// py: padding vertical
// mt: margin top
// mb: margin bottom
// pt: padding top
// pb: padding bottom
// ml: margin left
// mr: margin right
// pl: padding left
// pr: padding right
