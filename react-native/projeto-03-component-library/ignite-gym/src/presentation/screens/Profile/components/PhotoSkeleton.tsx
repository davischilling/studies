import { Skeleton } from "native-base";

type Props = {
  w: number;
  h: number;
};

export const PhotoSkeleton = ({ h, w }: Props) => (
  <Skeleton
    w={w}
    h={h}
    rounded="full"
    startColor="gray.500"
    endColor="gray.400"
  />
);
