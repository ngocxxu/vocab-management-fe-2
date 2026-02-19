export type PlanLimits = {
  vocabPerDay: number;
  languageFolders: number;
  subjects: number;
  requestsPerMinute: number;
};

export type TPlan = {
  role: string;
  name: string;
  price: number;
  priceLabel: string;
  limits: PlanLimits;
  features: string[];
};
