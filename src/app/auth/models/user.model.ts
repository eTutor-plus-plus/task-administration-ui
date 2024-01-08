import { Role } from './role.model';
import { RoleAssignment } from './role-assignment.model';

/**
 * The application user.
 */
export interface ApplicationUser {
  /**
   * The username.
   */
  userName: string;

  /**
   * The first name.
   */
  firstName: string;

  /**
   * The last name.
   */
  lastName: string;

  /**
   * The email address.
   */
  email: string;

  /**
   * Whether the user is full administrator.
   */
  isFullAdmin: boolean;

  /**
   * The highest role over all organizational units.
   */
  maxRole: Role;

  /**
   * The role assignments
   */
  roles: RoleAssignment[];
}
