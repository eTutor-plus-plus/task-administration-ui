import { Audited } from './audited.model';

export interface TaskAppDto extends Audited {
  /**
   * The identifier.
   */
  id: number;

  /**
   * The supported task type.
   */
  taskType: string;

  /**
   * The URL of the task app.
   */
  url: string;

  /**
   * The API key of the task app.
   */
  apiKey?: string;
}
