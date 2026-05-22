import { useStatefulContextUseCase } from "@/domain/hooks/use_stateful_context_uc";
import { UserModel } from "@/domain/models/User";
import {
  AuthContextUseCase,
  DEFAULT_STATE,
  State,
} from "@/domain/use_cases/contexts/auth";
import { SignInFormData } from "@/domain/validations/signIn";
import { SignUpFormData } from "@/domain/validations/signUp";
import { useToast } from "native-base";
import { createContext, ReactNode } from "react";

export interface AuthContextDataProps {
  user: UserModel;
  handleSignInSubmit: (data: SignInFormData) => Promise<void>;
  handleSignUpSubmit: (data: SignUpFormData) => Promise<void>;
  handleSignOut: () => Promise<void>;
  updatedUserProfile: (params: {
    name?: string;
    avatar?: string;
  }) => Promise<void>;
  isLoading: boolean;
  isLoadingUserFromStorage: boolean;
}

export const AuthContext = createContext({} as AuthContextDataProps);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const toast = useToast();

  const { state, useCase } = useStatefulContextUseCase<
    State,
    AuthContextUseCase
  >({
    UseCase: AuthContextUseCase,
    DEFAULT_STATE,
    INITIAL_STATE: {
      toast,
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        handleSignInSubmit: useCase?.handleSignInSubmit!,
        handleSignUpSubmit: useCase?.handleSignUpSubmit!,
        handleSignOut: useCase?.handleSignOut!,
        updatedUserProfile: useCase?.updatedUserProfile!,
        isLoading: state.isLoading,
        isLoadingUserFromStorage: state.isLoadingUserFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
