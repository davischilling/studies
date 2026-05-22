import { useToast, VStack } from "native-base";

import { UserPhoto } from "@/presentation/components/UserPhoto";
import { ExerciseCounter, GroupList, Header } from "./components";
import { ExerciseCardList } from "./components/ExerciseCardList";

import { useAuth } from "@/domain/hooks/use_auth";
import { useStatefulUseCase } from "@/domain/hooks/use_stateful_uc";
import {
  DEFAULT_STATE,
  HomeScreenUseCase,
  State,
} from "@/domain/use_cases/screens/home";
import defaultUserAvatar from "@/presentation/assets/userPhotoDefault.png";
import { AppNavigatorRoutesProps } from "@/presentation/navigation/app.routes";
import { useNavigation } from "@react-navigation/native";
import { getAvatarImage } from "@/domain/utils/get_server_image";

export const Home = () => {
  const appNavigation = useNavigation<AppNavigatorRoutesProps>();
  const { user, handleSignOut } = useAuth();
  const toast = useToast();

  const { state, useCase } = useStatefulUseCase<State, HomeScreenUseCase>({
    UseCase: HomeScreenUseCase,
    DEFAULT_STATE,
    INITIAL_STATE: {
      toast,
    },
  });

  return (
    <VStack flex={1}>
      <Header greetings="Olá" name={user.name} onPress={handleSignOut}>
        <UserPhoto
          size={14}
          source={
            user.avatar
              ? {
                  uri: getAvatarImage(user.avatar),
                }
              : defaultUserAvatar
          }
          alt="Imagem do usuário"
        />
      </Header>
      <GroupList
        groups={state.groups}
        groupSelected={state.groupSelected}
        setGroupSelected={(t) => useCase!.updateGroupSelected(t)!}
        isDisabled={state.isExercisesLoading}
      />
      <VStack flex={1} px={4}>
        <ExerciseCounter title="Exercícios" counter={state.exercises.length} />
        <ExerciseCardList
          exercises={state.exercises}
          appNavigation={appNavigation}
          loading={state.isExercisesLoading}
        />
      </VStack>
    </VStack>
  );
};
