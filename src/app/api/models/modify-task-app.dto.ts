/**
 * Modification-DTO for {@link at.jku.dke.etutor.task_administration.data.entities.TaskApp at.jku.dke.etutor.task_administration.data.entities.TaskApp}
 */
export interface ModifyTaskAppDto {
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

  /**
   * The task URL prefix;
   */
  taskPrefix?: string;

  /**
   * The task group URL prefix;
   */
  taskGroupPrefix?: string;

  /**
   * The submission URL prefix;
   */
  submissionPrefix?: string;
}
