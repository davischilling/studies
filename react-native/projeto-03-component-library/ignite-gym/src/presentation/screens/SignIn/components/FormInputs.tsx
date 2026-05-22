import { useContext } from "react";
import { Controller } from "react-hook-form";

import { SignInFormData, SignInValidationContext } from "@/domain/validations/signIn";
import { Button } from "@/presentation/components/Button";
import { Input } from "@/presentation/components/Input";

export type Props = {
  onSubmit: (data: SignInFormData) => void;
  isLoading: boolean;
};

export const FormInputs = ({ onSubmit, isLoading }: Props) => {
  const { control, errors, handleSubmit } = useContext(SignInValidationContext);

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            placeholder="Senha"
            secureTextEntry
            onChangeText={onChange}
            value={value}
            onSubmitEditing={handleSubmit(onSubmit)}
            returnKeyType="send"
            error={errors.password?.message}
          />
        )}
      />
      <Button title="Acessar" onPress={handleSubmit(onSubmit)} isLoading={isLoading} />
    </>
  );
};
