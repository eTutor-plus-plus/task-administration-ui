/**
 * Model for audited entities.
 */
export interface Audited {
  /**
   * The creation user.
   */
  createdBy: string | null;

  /**
   * The creation date.
   */
  createdDate: string | null;

  /**
   * The modification user.
   */
  lastModifiedBy: string | null;

  /**
   * The modification date.
   */
  lastModifiedDate: string | null;
}
