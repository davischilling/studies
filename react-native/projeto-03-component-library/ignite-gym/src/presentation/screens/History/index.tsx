import { useStatefulUseCase } from "@/domain/hooks/use_stateful_uc";
import {
  DEFAULT_STATE,
  HistoryScreenUseCase,
  State,
} from "@/domain/use_cases/screens/history";
import { Header, Loading } from "@/presentation/components/index";
import { Heading, SectionList, Text, useToast, VStack } from "native-base";
import { HistoryCard } from "./components";

export const History = () => {
  const toast = useToast();

  const { state, useCase } = useStatefulUseCase<State, HistoryScreenUseCase>({
    UseCase: HistoryScreenUseCase,
    DEFAULT_STATE,
    INITIAL_STATE: {
      toast,
    },
  });

  return (
    <VStack flex={1}>
      <Header title="Histórico de Exercícios" />
      {state.isLoading ? (
        <Loading />
      ) : (
        <SectionList
          sections={state.historySectionList}
          keyExtractor={({ exercise_id }) => String(exercise_id)}
          renderItem={({ item }) => (
            <HistoryCard data={item} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Heading
              color="gray.200"
              fontSize="md"
              mt={10}
              mb={3}
              fontFamily="heading"
            >
              {title}
            </Heading>
          )}
          contentContainerStyle={
            state.historySectionList.length === 0 && {
              flex: 1,
              justifyContent: "center",
            }
          }
          ListEmptyComponent={() => (
            <Text color="gray.100" textAlign="center">
              Nenhum há exercícios registrados ainda.{"\n"} Vamos fazer
              exercícios hoje?
            </Text>
          )}
          showsVerticalScrollIndicator={false}
          px={4}
        />
      )}
    </VStack>
  );
};
