import { SUPERADMINMENUS } from "./SuperAdminMenu"
import { CLIENTADMINMENUS } from "./ClientAdminMenu"
import { EMPLOYEEMENUS } from "./EmployeeMenu";

// export enum Role {
//     ADMIN = 'ADMIN',
//     CLIENT = 'CLIENT',
//     BACKENDDEVELOPER = 'BACKEND DEVELOPER'
// }
export enum Role {
    SuperAdmin = 'SUPERADMIN',
    ClientAdmin = 'CLIENTADMIN',
    Employee = 'EMPLOYEE',
}

export const getRoleMenuItems: any = (role: any) => {

    if (!role) { // if role is undefined or falsy, return DEFAULTMENUS
        return [];
    }

    switch (role) {
        case Role.SuperAdmin:
            return SUPERADMINMENUS;
        case Role.ClientAdmin:
            return CLIENTADMINMENUS;
        case Role.Employee:
            return EMPLOYEEMENUS;
        default:
            return []
    }
}

