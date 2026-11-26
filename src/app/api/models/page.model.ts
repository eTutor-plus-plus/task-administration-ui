/**
 * Represents the result of a paging request.
 */
export interface PageResult<T> {
  /**
   * The entries of the current page.
   */
  content: T[];

  /**
   * The paging information.
   */
  page: {
    /**
     * The total amount of entries.
     */
    totalElements: number;

    /**
     * The total amount of pages.
     */
    totalPages: number;

    /**
     * The page size.
     */
    size: number;

    /**
     * The number of the current page.
     */
    number: number;
  };
}

/**
 * Empty result. DO NOT MODIFY PROPERTIES THIS OBJECT SOMEWHERE ELSE!
 */
export const EMPTY_PAGE: PageResult<any> = {
  content: [],
  page: {
    number: 0,
    size: 0,
    totalPages: 0,
    totalElements: 0,
  }
};
