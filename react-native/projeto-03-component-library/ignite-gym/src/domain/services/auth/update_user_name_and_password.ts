import { Service } from "@/domain/services/index";
import { AxiosInstance } from "axios";
import { api } from "../api";

export type UpdateProfileProps = {
  name: string;
  password: string;
  old_password: string;
};

class UpdateUserNameAndPasswordService extends Service<UpdateProfileProps, void> {
  constructor(private readonly api: AxiosInstance) {
    super();
  }
  async perform(params: UpdateProfileProps): Promise<void> {
    await this.api.put("/users", params);
  }
}

const updateUserNameAndPasswordService = new UpdateUserNameAndPasswordService(api);

export { updateUserNameAndPasswordService };
