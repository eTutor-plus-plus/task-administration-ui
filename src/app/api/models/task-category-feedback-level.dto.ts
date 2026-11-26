/**
 * The feedback levels of a task in a task category.
 */
export interface TaskCategoryFeedbackLevelDto {
  /**
   * The task category identifier.
   */
  taskCategoryId: number;

  /**
   * The feedback level for mode "submit" (0-3).
   */
  submitFeedbackLevel: number;

  /**
   * The feedback level for mode "diagnose" (0-3).
   */
  diagnoseFeedbackLevel: number;
}
