export interface Environment {
  activeProfiles: string[];
  propertySources: PropertySource[];
}

export interface PropertySource {
  name: string;
  properties: Record<string, Property>;
}

export interface Property {
  value: string | number | boolean;
  origin?: string;
}
