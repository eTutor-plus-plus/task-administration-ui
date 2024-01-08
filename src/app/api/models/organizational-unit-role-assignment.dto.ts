import { RoleEnum } from './role.enum';

export interface OrganizationalUnitRoleAssignmentDto {
  /**
   * The organizational unit.
   */
  organizationalUnit: number;

  /**
   * The role the user has assigned in the unit.
   */
  role: RoleEnum;
}
