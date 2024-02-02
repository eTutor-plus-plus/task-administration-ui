export interface SubmissionDto {
  /**
   * The submission id.
   */
  submissionId: string | null;

  /**
   * The grading.
   */
  grading: GradingDto;
}

export interface GradingDto {
  /**
   * The maximum reachable points.
   */
  maxPoints: number;

  /**
   * The achieved points.
   */
  points: number;

  /**
   * The general feedback (can be HTML).
   */
  generalFeedback: string | null;

  /**
   * The criteria containing the specific feedback.
   */
  criteria: CriterionDto[];
}

export interface CriterionDto {
  /**
   * The name of the criterion.
   */
  name:string;

  /**
   * The achieved points (just for information, not used for total grading, might be null).
   */
  points:number|null;

  /**
   * Whether the criterion was passed (might influence display, not used for anything else).
   */
  passed: boolean;

  /**
   * The feedback for the criterion (can be HTML).
   */
  feedback: string;
}
