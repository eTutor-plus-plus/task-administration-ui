/**
 * Spring Boot Link
 */
export interface Link {
  /**
   * The link.
   */
  href: string;

  /**
   * Whether the link contains template variables.
   */
  templated: boolean;
}
