export type BudgetYear = {
  year: number;
  income: number;
  expenditure: number;
  drrf: number; // Disaster Risk Reduction Fund
  sef: number;  // Special Education Fund
};

export type Contract = {
  id: string;
  title: string;
  awardee: string;
  amount: number;
  category: string;
  date: string;
  status: "Active" | "Completed" | "Cancelled";
  sourceUrl?: string;
};

export type DpwhProject = {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  contractor: string;
  startDate: string;
  completionDate: string;
  infraYear: string;
  sourceOfFunds: string;
  latitude: number | null;
  longitude: number | null;
  sourceUrl?: string;
};

export type StatCard = {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
};
