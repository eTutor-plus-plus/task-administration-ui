import { TaskDto } from './task.dto';

export interface TaskDetailsDto {
  /**
   * The task group data.
   */
  dto: TaskDto;

  /**
   * The task type specific data.
   */
  additionalData?: Record<string, unknown>;
}
