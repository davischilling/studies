import { IImageProps, Image } from "native-base";

type Props = IImageProps & {
  size: number;
};

export const UserPhoto = ({ size, ...rest }: Props) => (
  <Image
    w={size}
    h={size}
    rounded="full"
    borderWidth={2}
    borderColor="gray.400"
    {...rest}
  />
);
