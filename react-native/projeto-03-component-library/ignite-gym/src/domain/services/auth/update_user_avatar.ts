import { Service } from "@/domain/services/index";
import { AxiosInstance } from "axios";
import { api } from "../api";

class UpdateUserAvatarService extends Service<FormData, string> {
  constructor(private readonly api: AxiosInstance) {
    super();
  }
  async perform(params: FormData): Promise<string> {
    const { data } = await this.api.patch("/users/avatar", params, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.avatar;
  }
}

const updateUserAvatarService = new UpdateUserAvatarService(api);

export { updateUserAvatarService };
