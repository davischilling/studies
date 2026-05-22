import { api } from "@/domain/services/api";

export const getAvatarImage = (avatar: string) => {
  return `${api.defaults.baseURL}/avatar/${avatar}`;
};

export const getExerciseDemoImage = (demo: string) => {
  return `${api.defaults.baseURL}/exercise/demo/${demo}`;
};

export const getExerciseThumbImage = (thumb: string) => {
  return `${api.defaults.baseURL}/exercise/thumb/${thumb}`;
};
