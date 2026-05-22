import { StatefulUseCase } from "@/domain/use_cases/index";
import { ExerciseModel } from "@/domain/models/exercise";
import { GroupModel } from "@/domain/models/group";
import { getExercisesByGroupService } from "@/domain/services/exercise/get_by_group";
import { getAllGroupsService } from "@/domain/services/group/get_all";
import { errorHandler } from "@/domain/utils/error_handler";
import { ToastProps } from "presentation/@types/toast";

export type State = {
  groups: GroupModel[];
  groupSelected: string;
  exercises: ExerciseModel[];
  isLoading: boolean;
  isExercisesLoading: boolean;
  toast: ToastProps;
};

export const DEFAULT_STATE: State = {
  groups: [],
  groupSelected: "",
  exercises: [],
  isLoading: true,
  isExercisesLoading: false,
  toast: {} as ToastProps,
};

export class HomeScreenUseCase extends StatefulUseCase<State> {
  init = async () => {
    await this.loadInitialState();
  };

  onFocus = async () => {
    const { exercises } = await getExercisesByGroupService.handle(this.state.groupSelected);
    this.updateExercises(exercises);
  };

  loadInitialState = async () => {
    await errorHandler({
      mainCb: async () => {
        const { groups } = await getAllGroupsService.handle(null);
        this.updateGroups(groups);
        const groupSelected = groups[0];
        this.updateGroupSelected(groupSelected);
        this.updateOnFocusDependency(groupSelected);
        this.stopLoading()
      },
      errorMessage: "Erro ao carregar os grupos.",
      toast: this.state.toast,
    });
  };

  public updateGroupSelected = async (groupSelected: string) => {
    if (groupSelected === this.state.groupSelected) return;
    await errorHandler({
      mainCb: async () => {
        this.setState({ groupSelected }, async () => {
          this.startExercisesLoading();
          const { exercises } = await getExercisesByGroupService.handle(groupSelected);
          this.updateExercises(exercises);
          this.updateOnFocusDependency(groupSelected);
          this.stopExercisesLoading()
        });
      },
      errorMessage: "Erro ao carregar os exercícios do grupo.",
      toast: this.state.toast,
    });
  }

  private updateGroups(groups: GroupModel[], cb?: () => Promise<void>) {
    this.setState({ groups }, cb);
  }

  private updateExercises(exercises: ExerciseModel[], cb?: () => Promise<void>) {
    this.setState({ exercises }, cb);
  }

  private startExercisesLoading = () => {
    this.setState({ isExercisesLoading: true });
  };

  private stopExercisesLoading = () => {
    this.setState({ isExercisesLoading: false });
  };

  private startLoading = () => {
    this.setState({ isLoading: true });
  };

  private stopLoading = () => {
    this.setState({ isLoading: false });
  };
}
