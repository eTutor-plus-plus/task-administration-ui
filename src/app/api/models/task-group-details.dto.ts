import { TaskGroupDto } from './task-group.dto';

export interface TaskGroupDetailsDto {
  /**
   * The task group data.
   */
  dto: TaskGroupDto;

  /**
   * The task type specific data.
   */
  additionalData?: Record<string, unknown>;
}
