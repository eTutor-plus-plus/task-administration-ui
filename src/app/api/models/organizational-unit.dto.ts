import { Audited } from './audited.model';

export interface OrganizationalUnitDto extends Audited {
  /**
   * The unique identifier.
   */
  id: number;

  /**
   * The name.
   */
  name: string;

  /**
   * Whether the organizational unit is synced with moodle.
   */
  moodleSynced: boolean;
}
