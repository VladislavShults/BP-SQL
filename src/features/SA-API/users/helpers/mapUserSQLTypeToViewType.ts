import { ViewUserType } from '../types/users.types';

export const mapUserSQLTypeToViewType = (user): ViewUserType => ({
  id: user.UserId.toString(),
  login: user.Login,
  email: user.Email,
  createdAt: user.CreatedAt,
  banInfo: {
    isBanned: user.IsBanned,
    banDate: user.BanDate,
    banReason: user.BanReason,
  },
});
