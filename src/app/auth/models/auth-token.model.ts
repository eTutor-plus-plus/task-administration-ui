/**
 * Model for the authentication result.
 */
export interface AuthTokenModel {
  /**
   * The access token.
   */
  access_token: string;

  /**
   * The refresh token.
   */
  refresh_token: string;

  /**
   * The type of the access token (always Bearer).
   */
  token_type: string;

  /**
   * The amount of seconds until the token expires.
   */
  expires_in: number;
}
