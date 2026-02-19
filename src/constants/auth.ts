export const UserRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
};
export type TUserRole = (typeof UserRole)[keyof typeof UserRole];
