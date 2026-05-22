import * as yup from "yup";
import { createContext } from "react";
import { ValidationContextDataProps } from "@/presentation/contexts/Validation";

export type ProfileFormData = {
  name: string;
  old_password: string;
  password: string;
  password_confirm: string;
};

export const ProfileValidationContext = createContext(
  {} as ValidationContextDataProps<ProfileFormData>
);

export const profileSchema = yup.object().shape({
  name: yup.string().required("Informe o nome."),
  old_password: yup.string(),
  password: yup
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .nullable()
    .transform((value) => (!!value ? value : null)),
  password_confirm: yup
    .string()
    .nullable()
    .transform((value) => (!!value ? value : null))
    .oneOf([yup.ref("password"), ""], "As senhas devem ser iguais.")
    .when("password", {
      is: (Field: any) => Field,
      then: (schema) =>
        schema
          .nullable()
          .required("Informe a confirmação da senha.")
          .transform((value) => (!!value ? value : null)),
    }),
});
