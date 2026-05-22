import { Service } from "@/domain/services/index";
import { AxiosInstance } from "axios";
import { api } from "../api";

class AddExerciseToHistoryService extends Service<string, void> {
  constructor(private readonly api: AxiosInstance) {
    super();
  }
  async perform(exerciseId: string): Promise<void> {
    await this.api.post("/history", {
      exercise_id: exerciseId,
    });
  }
}

const addExerciseToHistoryService = new AddExerciseToHistoryService(api);

export { addExerciseToHistoryService };
