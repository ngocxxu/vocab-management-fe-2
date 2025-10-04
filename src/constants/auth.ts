export const UserRole = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};
export type TUserRole = (typeof UserRole)[keyof typeof UserRole];
