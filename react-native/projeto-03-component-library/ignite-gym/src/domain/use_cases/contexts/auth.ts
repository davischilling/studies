import { AuthTokenModel } from "@/domain/models/token";
import { UserModel } from "@/domain/models/user";
import { api, Subscription } from "@/domain/services/api";
import { signInService } from "@/domain/services/auth/sign_in";
import { signOutService } from "@/domain/services/auth/sign_out";
import { signUpService } from "@/domain/services/auth/sign_up";
import {
  deleteStorageAuthToken,
  getStorageAuthToken,
  setStorageAuthToken,
  SetStorageAuthTokenProps,
} from "@/domain/storage/token";
import {
  deleteStorageUser,
  getStorageUser,
  setStorageUser,
} from "@/domain/storage/user";
import { StatefulUseCase, Subscriptions } from "@/domain/use_cases/index";
import { errorHandler } from "@/domain/utils/error_handler";
import { SignInFormData } from "@/domain/validations/signIn";
import { SignUpFormData } from "@/domain/validations/signUp";
import { ToastProps } from "presentation/@types/toast";

export type State = {
  user: UserModel;
  isLoading: boolean;
  isLoadingUserFromStorage: boolean;
  toast: ToastProps;
};

export const DEFAULT_STATE: State = {
  user: {} as UserModel,
  isLoading: false,
  isLoadingUserFromStorage: true,
  toast: {} as ToastProps,
};

export class AuthContextUseCase extends StatefulUseCase<State> {
  public initSubscriptions = async () => {
    this.subscriptionDependencies = {
      signOutSub: await signOutService.handle(this.handleSignOut),
    } as Subscriptions;
    this.dependencies = [this.handleSignOut];
  };

  public init = async () => {
    await this.loadInitialState();
  };

  public loadInitialState = async () => {
    await errorHandler({
      mainCb: async () => {
        const user = await getStorageUser();
        const authToken = await getStorageAuthToken();
        this.updateUser(user, () => {
          api.defaults.headers.authorization = `Bearer ${authToken.authToken}`;
        });
      },
      errorMessage:
        "Erro ao carregar dados do usuário. Tente novamente mais tarde.",
      finallyCb: async () => this.stopLoadingUserFromStorage(),
      toast: this.state.toast,
    });
  };

  public handleSignInSubmit = async (params: SignInFormData) => {
    await errorHandler({
      mainCb: async () => {
        this.startLoading();
        const { user, token, refresh_token } = await signInService.handle(
          params
        );
        await setStorageUser(user);
        await this.updateAuthToken({
          authToken: token,
          refreshToken: refresh_token,
        });
        this.updateUser(user);
      },
      errorMessage: "Erro ao fazer login. Tente novamente mais tarde.",
      finallyCb: async () => this.stopLoading(),
      toast: this.state.toast,
    });
  };

  public handleSignUpSubmit = async (params: SignUpFormData) => {
    await errorHandler({
      mainCb: async () => {
        this.startLoading();
        const { user, token, refresh_token } = await signUpService.handle(
          params
        );
        await setStorageUser(user);
        await this.updateAuthToken({
          authToken: token,
          refreshToken: refresh_token,
        });
        this.updateUser(user);
      },
      errorMessage:
        "Não foi possível criar a conta. Tente novamente mais tarde.",
      finallyCb: async () => this.stopLoading(),
      toast: this.state.toast,
    });
  };

  public handleSignOut = async () => {
    await errorHandler({
      mainCb: async () => {
        this.startLoadingUserFromStorage();
        await deleteStorageUser();
        await deleteStorageAuthToken();
        this.updateUser({} as UserModel);
      },
      errorMessage: "Não foi possível fazer logout.",
      finallyCb: async () => this.stopLoadingUserFromStorage(),
      toast: this.state.toast,
    });
  };

  public updatedUserProfile = async ({
    name,
    avatar,
  }: {
    name?: string;
    avatar?: string;
  }) => {
    const updatedUser = {
      ...this.state.user,
      name: name || this.state.user.name,
      avatar: avatar || this.state.user.avatar,
    };
    await setStorageUser(updatedUser);
    this.updateUser(updatedUser);
  };

  private updateUser(user: UserModel, cb?: () => void) {
    this.setState({ user }, cb);
  }

  private updateAuthToken = async ({
    authToken,
    refreshToken,
  }: SetStorageAuthTokenProps) => {
    await setStorageAuthToken({ authToken, refreshToken });
    api.defaults.headers.authorization = `Bearer ${authToken}`;
  };

  private startLoading = () => {
    this.setState({ isLoading: true });
  };

  private stopLoading = () => {
    this.setState({ isLoading: false });
  };

  private startLoadingUserFromStorage = () => {
    this.setState({ isLoadingUserFromStorage: true });
  };

  private stopLoadingUserFromStorage = () => {
    this.setState({ isLoadingUserFromStorage: false });
  };
}
