import { HistorySectionModel } from "@/domain/models/history";
import { getHistorySectionListService } from "@/domain/services/history/get_section_list";
import { StatefulUseCase } from "@/domain/use_cases/index";
import { errorHandler } from "@/domain/utils/error_handler";
import { ToastProps } from "presentation/@types/toast";

export type State = {
  historySectionList: HistorySectionModel[];
  isLoading: boolean;
  toast: ToastProps;
};

export const DEFAULT_STATE: State = {
  historySectionList: [],
  isLoading: false,
  toast: {} as ToastProps,
};

export class HistoryScreenUseCase extends StatefulUseCase<State> {
  public init = async () => {
    await this.loadInitialState();
  };

  public onFocus = async () => {
    await this.loadInitialState();
  };

  private loadInitialState = async () => {
    await errorHandler({
      mainCb: async () => {
        this.startLoading();
        const historySectionList = await getHistorySectionListService.handle(
          null
        );
        this.updateHistorySectionList(historySectionList);
      },
      errorMessage: "Erro ao carregar o histórico.",
      finallyCb: async () => this.stopLoading(),
      toast: this.state.toast,
    });
  };

  private updateHistorySectionList(historySectionList: HistorySectionModel[]) {
    this.setState({ historySectionList });
  }

  private startLoading = () => {
    this.setState({ isLoading: true });
  };

  private stopLoading = () => {
    this.setState({ isLoading: false });
  };
}
