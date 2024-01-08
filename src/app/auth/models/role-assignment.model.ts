import { Role } from './role.model';

/**
 * Role-Assignment of a user in an organizational unit.
 */
export interface RoleAssignment {
  /**
   * The organizational unit.
   */
  organizationalUnit: number;

  /**
   * The role.
   */
  role: Role;
}
