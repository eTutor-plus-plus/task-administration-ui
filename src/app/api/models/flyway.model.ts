export interface FlywayContexts {
  contexts: Record<string, FlywayContext>;
}

export interface FlywayContext {
  flywayBeans: FlywayBeans;
}

export interface FlywayBeans {
  flyway: FlywayBean;
}

export interface FlywayBean {
  migrations: FlywayMigration[];
}

export interface FlywayMigration {
  type: string;
  checksum: number;
  version: string;
  description: string;
  script: string;
  state: string;
  installedBy: string;
  installedOn: string;
  installedRank: number;
  executionTime: number;
}
