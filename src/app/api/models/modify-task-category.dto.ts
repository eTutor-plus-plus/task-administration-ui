export interface ModifyTaskCategoryDto {
  /**
   * The Name of the category.
   */
  name: string;

  /**
   * The ID of the parent category.
   */
  parentId?: number;

  /**
   * The ID of the organizational unit.
   */
  organizationalUnitId: number;
}
