export interface Health {
  status: string;
  components?: Record<string, HealthComponent>;
}

export interface HealthComponent {
  status: string;
  details: Record<string, unknown>;
}
