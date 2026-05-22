import { ExerciseModel } from "@/domain/models/exercise";
import { Service } from "@/domain/services/index";
import { AxiosInstance } from "axios";
import { api } from "../api";

type GetExercisesByGroupResponse = {
  exercises: ExerciseModel[];
};

class GetExercisesByGroupService extends Service<string, GetExercisesByGroupResponse> {
  constructor(private readonly api: AxiosInstance) {
    super();
  }
  async perform(group: string): Promise<GetExercisesByGroupResponse> {
    const { data } = await this.api.get(`/exercises/bygroup/${group}`);
    return {
      exercises: data as ExerciseModel[],
    };
  }
}

const getExercisesByGroupService = new GetExercisesByGroupService(api);

export { getExercisesByGroupService };
