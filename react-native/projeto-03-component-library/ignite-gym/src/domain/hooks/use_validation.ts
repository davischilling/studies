import {
    useForm,
    FieldValues,
  } from "react-hook-form";  
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

type Props = {
  defaultValues?: any;
  schema: yup.ObjectSchema<any>;
}

export function useValidation<T extends FieldValues>({defaultValues, schema}: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<T>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  return {control, handleSubmit, errors, reset}
};
