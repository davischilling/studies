import { ExerciseModel } from "@/domain/models/exercise";
import { Service } from "@/domain/services/index";
import { AxiosInstance } from "axios";
import { api } from "../api";

type GetExerciseResponse = {
  exercise: ExerciseModel;
};

class GetExerciseByIdService extends Service<string, GetExerciseResponse> {
  constructor(private readonly api: AxiosInstance) {
    super();
  }
  async perform(exerciseId: string): Promise<GetExerciseResponse> {
    const { data } = await this.api.get(`/exercises/${exerciseId}`);
    return {
      exercise: data as ExerciseModel,
    };
  }
}

const getExerciseByIdService = new GetExerciseByIdService(api);

export { getExerciseByIdService };
