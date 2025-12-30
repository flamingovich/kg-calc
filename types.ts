
export type WeightUnit = 'g' | 'kg' | 'ml' | 'l';

export interface CalculationResult {
  id: string;
  name: string;
  price: number;
  weight: number;
  unit: WeightUnit;
  pricePerKg: number;
  timestamp: number;
}

export interface ComparisonInsight {
  bestValueId: string;
  advice: string;
}
