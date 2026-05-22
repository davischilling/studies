export type HistorySectionModel = {
  title: string;
  data: HistoryModel[];
};

export type HistoryModel = {
  created_at: string;
  exercise_id: number;
  group: string;
  hour: string;
  id: number;
  name: string;
  user_id: number;
};
