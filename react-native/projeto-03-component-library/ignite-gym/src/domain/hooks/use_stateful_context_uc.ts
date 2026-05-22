import {
  SetState,
  StateCallback,
  StatefulUseCase,
} from "@/domain/use_cases/index";
import { useEffect, useRef, useState } from "react";

type StateFulContextUseCaseProps<
  State,
  UseCaseClass extends StatefulUseCase<State>
> = {
  UseCase: new (state: State, setStateCb: SetState<State>) => UseCaseClass;
  DEFAULT_STATE: State;
  INITIAL_STATE?: Partial<State>;
};

export function useStatefulContextUseCase<
  State,
  UseCaseClass extends StatefulUseCase<State>
>({
  UseCase,
  DEFAULT_STATE,
  INITIAL_STATE,
}: StateFulContextUseCaseProps<State, UseCaseClass>) {
  const [logicState, setLogicState] = useState<State>(
    Object.assign({}, DEFAULT_STATE, INITIAL_STATE)
  );
  const useCaseLogicRef = useRef<UseCaseClass>();
  const [useCase, setUseCase] = useState<UseCaseClass>();

  useEffect(() => {
    const setState = (newState: any, cb?: StateCallback) => {
      setLogicState((oldState) => Object.assign({}, oldState, newState));
      cb && cb();
    };

    useCaseLogicRef.current = new UseCase(logicState, (newState, cb) => {
      setState(newState, cb);
    });

    useCaseLogicRef.current.init();
  }, []);

  useEffect(
    () => {
      useCaseLogicRef.current?.initSubscriptions();
      return () => {
        useCaseLogicRef.current?.dispose();
      };
    },
    [
      useCaseLogicRef.current?.dependencies
        ? [...useCaseLogicRef.current?.dependencies]
        : null,
    ]
  );

  useEffect(() => {
    if (useCaseLogicRef.current){
      setUseCase(useCaseLogicRef.current);
    }
  }, [useCaseLogicRef.current]);

  return { state: logicState, useCase };
}
