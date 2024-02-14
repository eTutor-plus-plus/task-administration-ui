import { Audited } from './audited.model';

export interface TaskCategoryDto extends Audited {
  /**
   * The id of the category.
   */
  id: number;

  /**
   * The name of the category.
   */
  name: string;

  /**
   * The id of the parent category.
   */
  parentId?: number;

  /**
   * The id of the organizational unit.
   */
  organizationalUnitId: number;

  /**
   * Whether the task category is synced with moodle.
   */
  moodleSynced: boolean;
}
