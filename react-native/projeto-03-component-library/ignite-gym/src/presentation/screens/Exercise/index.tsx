import { useStatefulUseCase } from "@/domain/hooks/use_stateful_uc";
import {
  DEFAULT_STATE,
  ExerciseScreenUseCase,
  State
} from "@/domain/use_cases/screens/exercise";
import {
  AppBottomTabParamList, AppNavigatorRoutesProps
} from "@/presentation/navigation/app.routes";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ScrollView, useToast, VStack } from "native-base";
import { Loading } from "../../components";
import { BoxSeries } from "./components/BoxSeries";
import { Header } from "./components/Header";
import { ExerciseImage } from "./components/Image";

export const Exercise = () => {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();
  const {
    params: { exerciseId },
  } = useRoute<RouteProp<AppBottomTabParamList, "Exercise">>();

  const { state, useCase } = useStatefulUseCase<State, ExerciseScreenUseCase>({
    UseCase: ExerciseScreenUseCase,
    DEFAULT_STATE,
    INITIAL_STATE: {
      toast,
      exerciseId,
    },
    dependency: exerciseId,
  });

  const { group, name, demo, series, repetitions } = state.exercise;

  return (
    <VStack flex={1}>
      {state.isLoading ? (
        <Loading />
      ) : (
        <>
          <Header onPress={navigation.goBack} group={group} name={name} />
          <ScrollView>
            <VStack p={8}>
              <ExerciseImage demo={demo} />
              <BoxSeries
                series={series}
                repetitions={repetitions}
                isRegisterLoading={state.isRegisterLoading}
                onPress={() =>
                  useCase?.handleExerciseHistoryRegister(() =>
                    navigation.navigate("History")
                  )!
                }
              />
            </VStack>
          </ScrollView>
        </>
      )}
    </VStack>
  );
};
