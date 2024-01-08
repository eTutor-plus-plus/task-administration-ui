/**
 * Represents the result of a paging request.
 */
export interface PageResult<T> {
  /**
   * The entries of the current page.
   */
  content: T[];

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
   * The number of entries of the current page.
   */
  numberOfElements: number;

  /**
   * The number of the current page.
   */
  number: number;

  /**
   * Whether this is the first page.
   */
  first: boolean;

  /**
   * Whether this is the last page.
   */
  last: boolean;

  /**
   * Whether the page is empty.
   */
  empty: boolean;

  /**
   * The sort options.
   */
  sort: SortObject;

  /**
   * Paging information that has been used to request the current page.
   */
  pageable: {
    /**
     * The requested offset.
     */
    offset: number;

    /**
     * The requested sorting.
     */
    sort: SortObject;

    /**
     * The requested page number.
     */
    pageNumber: number;

    /**
     * The requested page size.
     */
    pageSize: number;

    /**
     * Whether the request was paged.
     */
    paged: boolean;

    /**
     * Whether the request was unpaged.
     */
    unpaged: boolean;
  };
}

/**
 * Sorting information
 */
export interface SortObject {
  /**
   * Whether the result is empty.
   */
  empty: boolean;

  /**
   * Whether the result is sorted.
   */
  sorted: boolean;

  /**
   * Whether the result is unsorted.
   */
  unsorted: boolean;
}

/**
 * Empty result. DO NOT MODIFY PROPERTIES THIS OBJECT SOMEWHERE ELSE!
 */
export const EMPTY_PAGE: PageResult<any> = {
  empty: true,
  content: [],
  first: true,
  last: true,
  number: 0,
  numberOfElements: 0,
  size: 0,
  totalPages: 0,
  totalElements: 0,
  sort: {sorted: false, empty: true, unsorted: false},
  pageable: {
    paged: false,
    offset: 0,
    pageNumber: 0,
    pageSize: 0,
    unpaged: true,
    sort: {sorted: false, empty: true, unsorted: false},
  }
};
