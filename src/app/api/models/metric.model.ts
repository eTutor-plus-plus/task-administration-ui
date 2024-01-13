export interface Metric {
  name: string;
  description: string;
  baseUnit?: string;
  measurements: MetricMeasurement[];
  availableTags: MetricTag[];
}

export interface MetricMeasurement {
  statistic: string;
  value: number;
}

export interface MetricTag {
  tag: string;
  values: string[];
}
