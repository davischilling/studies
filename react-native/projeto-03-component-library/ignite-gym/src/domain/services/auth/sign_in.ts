import { AuthTokenModel } from "@/domain/models/token";
import { UserModel } from "@/domain/models/user";
import { Service } from "@/domain/services/index";
import { AxiosInstance } from "axios";
import { SignInFormData } from "@/domain/validations/signIn";
import { api } from "../api";

type SignInResponse = {
  user: UserModel;
  token: AuthTokenModel;
  refresh_token: AuthTokenModel;
};

class SignInService extends Service<SignInFormData, SignInResponse> {
  constructor(private readonly api: AxiosInstance) {
    super();
  }
  async perform({ email, password }: SignInFormData): Promise<SignInResponse> {
    const { data } = await this.api.post("/sessions", {
      email,
      password,
    });
    return {
      user: data.user as UserModel,
      token: data.token as AuthTokenModel,
      refresh_token: data.refresh_token as AuthTokenModel,
    };
  }
}

const signInService = new SignInService(api);

export { signInService };
