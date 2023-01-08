export const extractUserIdFromRefreshToken = (
  refreshToken: string,
): string | undefined => {
  const splitRefreshToken = refreshToken.split('.');
  const splitPayloadToken = atob(splitRefreshToken[1]).split(',');
  const splitUserId = splitPayloadToken[0].split(':');
  const userId = splitUserId[1].replace('"', '').replace('"', '');
  if (splitRefreshToken.length === 3 && userId) {
    return userId;
  }
};
