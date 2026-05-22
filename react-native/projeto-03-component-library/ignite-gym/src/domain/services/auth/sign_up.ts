import { AuthTokenModel } from "@/domain/models/token";
import { UserModel } from "@/domain/models/user";
import { Service } from "@/domain/services/index";
import { SignUpFormData } from "@/domain/validations/signUp";
import { AxiosInstance } from "axios";
import { api } from "../api";

type SignUpResponse = {
  user: UserModel;
  token: AuthTokenModel;
  refresh_token: AuthTokenModel;
};

class SignUpService extends Service<SignUpFormData, SignUpResponse> {
  constructor(private readonly api: AxiosInstance) {
    super();
  }
  async perform({ email, password }: SignUpFormData): Promise<SignUpResponse> {
    await this.api.post("/users", {
      name,
      email,
      password,
    });
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

const signUpService = new SignUpService(api);

export { signUpService };