import { HistorySectionModel } from "@/domain/models/history";
import { Service } from "@/domain/services/index";
import { AxiosInstance } from "axios";
import { api } from "../api";

class GetHistorySectionListService extends Service<any, HistorySectionModel[]> {
  constructor(private readonly api: AxiosInstance) {
    super();
  }
  async perform(): Promise<HistorySectionModel[]> {
    const { data } = await this.api.get("/history");
    return data;
  }
}

const getHistorySectionListService = new GetHistorySectionListService(api);

export { getHistorySectionListService };
