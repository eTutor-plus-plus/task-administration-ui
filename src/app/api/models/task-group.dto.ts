import { Audited } from './audited.model';
import { StatusEnum } from './task-status.enum';

export interface TaskGroupDto extends Audited {
  /**
   * The ID of the task group.
   */
  id: number;

  /**
   * The name of the task group.
   */
  name: string;

  /**
   * The description of the task group in German.
   */
  descriptionDe: string;

  /**
   * The description of the task group in English.
   */
  descriptionEn: string;

  /**
   * The type of the task group.
   */
  taskGroupType: string;

  /**
   * The status of the task group.
   */
  status: StatusEnum;

  /**
   * The ID of the organizational unit.
   */
  organizationalUnitId: number;

  /**
   * The user who approved the task group.
   */
  approvedBy?: string;

  /**
   * The date when the task group was approved.
   */
  approvedDate?: string;

  /**
   * The additional data of the task group.
   */
  additionalData?: Record<string, unknown>;
}
