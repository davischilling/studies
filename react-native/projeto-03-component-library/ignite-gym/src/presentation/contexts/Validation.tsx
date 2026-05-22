import { useValidation } from "@/domain/hooks/use_validation";
import { ReactNode } from "react";
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormHandleSubmit,
  UseFormReset,
} from "react-hook-form";
import * as yup from "yup";

export interface ValidationContextDataProps<T extends FieldValues> {
  control: Control<T, any>;
  handleSubmit: UseFormHandleSubmit<T>;
  errors: FieldErrors<T>;
  reset: UseFormReset<T>;
}

interface ValidationProviderProps<T extends FieldValues> {
  children: ReactNode;
  defaultValues?: any;
  schema: yup.ObjectSchema<any>;
  ValidationContext: React.Context<ValidationContextDataProps<T>>;
}

function ValidationProvider<T extends FieldValues>({
  children,
  defaultValues,
  schema,
  ValidationContext,
}: ValidationProviderProps<T>) {
  const { control, errors, handleSubmit, reset } = useValidation<T>({
    defaultValues,
    schema,
  });

  return (
    <ValidationContext.Provider
      value={{
        control,
        errors,
        handleSubmit,
        reset,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
}

export function FormValidation<T extends FieldValues>({
  ValidationContext,
  schema,
  defaultValues,
  children,
}: ValidationProviderProps<T>) {
  return (
    <ValidationProvider
      ValidationContext={ValidationContext}
      schema={schema}
      defaultValues={defaultValues}
    >
      {children}
    </ValidationProvider>
  );
}
