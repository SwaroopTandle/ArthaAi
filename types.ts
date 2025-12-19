
export enum InvestmentAction {
  BUY = 'BUY',
  HOLD = 'HOLD',
  SELL = 'SELL',
  AVOID = 'AVOID'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface StockMetric {
  label: string;
  value: string | number;
  description?: string;
}

export interface StockAnalysis {
  symbol: string;
  companyName: string;
  currentPrice: number;
  currency: string;
  action: InvestmentAction;
  riskLevel: RiskLevel;
  confidenceScore: number;
  summary: string;
  suggestedEntryRange: string;
  fundamentals: {
    peRatio: number;
    pbRatio: number;
    roe: number;
    roce: number;
    debtToEquity: number;
    operatingMargin: number;
    promoterHolding: number;
    institutionalHolding: number;
  };
  technicals: {
    supportLevels: number[];
    resistanceLevels: number[];
    trend: string;
    rsi?: number;
  };
  pros: string[];
  cons: string[];
  longTermOutlook: string;
  shortTermOutlook: string;
  sources: { title: string; url: string }[];
}

export interface SearchHistoryItem {
  symbol: string;
  companyName: string;
  timestamp: number;
  action: InvestmentAction;
}
