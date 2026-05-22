import { SetState, StatefulUseCase } from "@/domain/use_cases/index";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { useStatefulContextUseCase } from "./use_stateful_context_uc";

type StateFulUseCaseProps<
  State,
  UseCaseClass extends StatefulUseCase<State>
> = {
  UseCase: new (state: State, setStateCb: SetState<State>) => UseCaseClass;
  DEFAULT_STATE: State;
  INITIAL_STATE?: Partial<State>;
  dependency?: any;
};

export function useStatefulUseCase<
  State,
  UseCaseClass extends StatefulUseCase<State>
>({
  UseCase,
  DEFAULT_STATE,
  INITIAL_STATE,
  dependency,
}: StateFulUseCaseProps<State, UseCaseClass>) {
  const { state, useCase } = useStatefulContextUseCase<State, UseCaseClass>({
    UseCase,
    DEFAULT_STATE,
    INITIAL_STATE,
  });

  useFocusEffect(
    useCallback(() => {
      if (dependency && dependency !== useCase?.onFocusDependency) {
        useCase?.updateOnFocusDependency(dependency);
      }
      useCase?.onFocus();
    }, [useCase?.onFocusDependency ? useCase?.onFocusDependency : null])
  );

  return { state, useCase };
}
