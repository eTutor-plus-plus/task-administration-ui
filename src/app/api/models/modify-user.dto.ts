import { OrganizationalUnitRoleAssignmentDto } from './organizational-unit-role-assignment.dto';

export interface ModifyUserDto {
    /**
     * The username.
     */
    username: string;

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
     * Whether the user is active.
     */
    enabled: boolean;

    /**
     * The timestamp of the user activation.
     */
    activated?: Date;

    /**
     * Whether the user is full administrator.
     */
    fullAdmin: boolean;

    /**
     * The end of the user lock.
     */
    lockoutEnd?: Date;

    /**
     * The organizational units the user belongs to.
     */
    organizationalUnits: Array<OrganizationalUnitRoleAssignmentDto>;
}
