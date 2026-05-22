import * as yup from "yup";
import { createContext } from "react";
import { ValidationContextDataProps } from "@/presentation/contexts/Validation";

export type SignUpFormData = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
};

export const SignUpValidationContext = createContext(
  {} as ValidationContextDataProps<SignUpFormData>
);

export const SignUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  password_confirm: "",
};

export const signUpSchema = yup.object().shape({
  name: yup.string().required("Informe o nome."),
  email: yup
    .string()
    .required("Informe o e-mail.")
    .email("Informe um e-mail válido."),
  password: yup
    .string()
    .required("Informe a senha.")
    .min(6, "A senha deve ter no mínimo 6 caracteres."),
  password_confirm: yup
    .string()
    .required("Informe a confirmação da senha.")
    .oneOf([yup.ref("password"), ""], "As senhas devem ser iguais."),
});
