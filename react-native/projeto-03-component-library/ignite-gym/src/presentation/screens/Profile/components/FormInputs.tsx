import {
  ProfileFormData,
  ProfileValidationContext,
} from "@/domain/validations/profile";
import { Button } from "@/presentation/components/Button";
import { Input } from "@/presentation/components/Input";
import { Heading } from "native-base";
import { useContext } from "react";
import { Controller } from "react-hook-form";

type Props = {
  onSubmit: (data: ProfileFormData) => void;
  isLoading: boolean;
  email: string;
};

export const FormInputs = ({ onSubmit, isLoading, email }: Props) => {
  const { control, errors, handleSubmit, reset } = useContext(
    ProfileValidationContext
  );

  return (
    <>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            bg="gray.600"
            placeholder="Nome"
            value={value}
            onChangeText={onChange}
            error={errors.name?.message}
          />
        )}
      />
      <Input bg="gray.600" placeholder={email} isDisabled />
      <Heading
        color="gray.200"
        fontSize="md"
        mb={2}
        alignSelf="flex-start"
        mt={8}
        fontFamily="heading"
      >
        Alterar senha
      </Heading>
      <Controller
        control={control}
        name="old_password"
        render={({ field: { onChange, value } }) => (
          <Input
            bg="gray.600"
            placeholder="Senha antiga"
            secureTextEntry
            onChangeText={onChange}
            value={value}
            error={errors.old_password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            bg="gray.600"
            placeholder="Nova senha"
            secureTextEntry
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password_confirm"
        render={({ field: { onChange, value } }) => (
          <Input
            bg="gray.600"
            placeholder="Confirme a senha"
            secureTextEntry
            onChangeText={onChange}
            value={value}
            onSubmitEditing={handleSubmit(onSubmit)}
            returnKeyType="send"
            error={errors.password_confirm?.message}
          />
        )}
      />
      <Button
        title="Atualizar"
        mt={4}
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
    </>
  );
};
