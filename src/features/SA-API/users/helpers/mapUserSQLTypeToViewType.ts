import { ViewUserType } from '../types/users.types';

export const mapUserSQLTypeToViewType = (user): ViewUserType => ({
  id: user.id.toString(),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
  banInfo: {
    isBanned: user.isBanned,
    banDate: user.banDate,
    banReason: user.banReason,
  },
});
