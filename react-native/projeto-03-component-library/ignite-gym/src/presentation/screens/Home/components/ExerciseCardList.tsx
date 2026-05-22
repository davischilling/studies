import { ExerciseModel } from "@/domain/models/exercise";
import { Loading } from "@/presentation/components/Loading";
import { AppNavigatorRoutesProps } from "@/presentation/navigation/app.routes";
import { FlatList } from "native-base";
import { ExerciseCard } from "./ExerciseCard";

type Props = {
  exercises: ExerciseModel[];
  loading: boolean;
  appNavigation: AppNavigatorRoutesProps;
};

export const ExerciseCardList = ({
  exercises,
  loading,
  appNavigation,
}: Props) => (
  <>
    {loading ? (
      <Loading />
    ) : (
      <FlatList
        data={exercises}
        keyExtractor={({ id }) => id.toString()}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onPress={() =>
              appNavigation.navigate("Exercise", {
                exerciseId: String(item.id),
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        _contentContainerStyle={{ pb: 4 }}
      />
    )}
  </>
);
