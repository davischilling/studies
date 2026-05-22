import {
  FormControl,
  IInputProps,
  Input as NativeBaseInput,
} from "native-base";

type Props = IInputProps & {
  error?: string;
};

export const Input = ({ error, isInvalid, ...rest }: Props) => {
  const invalid = isInvalid || !!error;
  return (
    <FormControl isInvalid={invalid} mb={4}>
      <NativeBaseInput
        bg="gray.700"
        h={14}
        px={4}
        borderWidth={0}
        fontSize="md"
        color="white"
        fontFamily="body"
        placeholderTextColor="gray.300"
        isInvalid={invalid}
        _disabled={{
          bg: "gray.600",
          opacity: 0.8,
        }}
        _invalid={{
          borderColor: "red.500",
          borderWidth: 1,
        }}
        _focus={{
          bg: "gray.700",
          borderWidth: 1,
          borderColor: "green.500",
        }}
        {...rest}
      />
      <FormControl.ErrorMessage _text={{ color: "red.500" }}>
        {error}
      </FormControl.ErrorMessage>
    </FormControl>
  );
};

// bg: backgroundColor
// h: height
// px: padding horizontal
// mb: margin bottom
