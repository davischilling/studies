import { GroupModel } from "@/domain/models/group";
import { Service } from "@/domain/services/index";
import { AxiosInstance } from "axios";
import { api } from "../api";

type GetAllGroupsResponse = {
  groups: GroupModel[];
};

class GetAllGroupsService extends Service<any, GetAllGroupsResponse> {
  constructor(private readonly api: AxiosInstance) {
    super();
  }
  async perform(): Promise<GetAllGroupsResponse> {
    const { data } = await this.api.get("/groups");
    return {
      groups: data as GroupModel[],
    };
  }
}

const getAllGroupsService = new GetAllGroupsService(api);

export { getAllGroupsService };
