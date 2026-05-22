import { ExerciseModel } from "@/domain/models/exercise";
import { getExerciseByIdService } from "@/domain/services/exercise/get_by_id";
import { addExerciseToHistoryService } from "@/domain/services/history/add_exercise_to_history";
import { StatefulUseCase } from "@/domain/use_cases/index";
import { errorHandler } from "@/domain/utils/error_handler";
import { ToastProps } from "presentation/@types/toast";

export type State = {
  exerciseId: string;
  exercise: ExerciseModel;
  isLoading: boolean;
  isRegisterLoading: boolean;
  toast: ToastProps;
};

export const DEFAULT_STATE: State = {
  exerciseId: "",
  exercise: {} as ExerciseModel,
  isLoading: true,
  isRegisterLoading: false,
  toast: {} as ToastProps,
};

export class ExerciseScreenUseCase extends StatefulUseCase<State> {
  public init = async () => {
    await this.loadInitialState();
  };

  public onFocus = async () => {
    this.updateExerciseId(this.dependency, async () => {
      this.startLoading();
      const { exercise } = await getExerciseByIdService.handle(
        this.state.exerciseId
      );
      this.updateExercise(exercise);
      this.stopLoading();
    });
  };

  public handleExerciseHistoryRegister = async (cb: () => void) => {
    await errorHandler({
      mainCb: async () => {
        this.startRegisterLoading();
        await addExerciseToHistoryService.handle(this.state.exerciseId);
        this.state.toast.show({
          title: "Parabéns! Exercício registrado no seu histórico.",
          placement: "top",
          bgColor: "green.700",
        });
        cb();
      },
      errorMessage: "Erro ao registrar o exercício.",
      finallyCb: async () => this.stopRegisterLoading(),
      toast: this.state.toast,
    });
  };

  private loadInitialState = async () => {
    await errorHandler({
      mainCb: async () => {
        const { exercise } = await getExerciseByIdService.handle(
          this.state.exerciseId
        );
        this.updateExercise(exercise);
      },
      errorMessage: "Erro ao carregar o exercício.",
      finallyCb: async () => this.stopLoading(),
      toast: this.state.toast,
    });
  };

  private updateExerciseId(exerciseId: string, cb: () => Promise<void>) {
    this.setState({ exerciseId }, cb);
  }

  private updateExercise(exercise: ExerciseModel) {
    this.setState({ exercise });
  }

  private startLoading = () => {
    this.setState({ isLoading: true });
  };

  private stopLoading = () => {
    this.setState({ isLoading: false });
  };

  private startRegisterLoading = () => {
    this.setState({ isRegisterLoading: true });
  };

  private stopRegisterLoading = () => {
    this.setState({ isRegisterLoading: false });
  };
}
