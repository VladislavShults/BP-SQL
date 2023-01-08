import { UserDBType, ViewUserType } from '../types/users.types';

export const mapUserDBTypeToViewType = (user: UserDBType): ViewUserType => ({
  id: user._id.toString(),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
  banInfo: {
    isBanned: user.banInfo.isBanned,
    banDate: user.banInfo.banDate,
    banReason: user.banInfo.banReason,
  },
});
