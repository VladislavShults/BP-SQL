export const extractExpiresDateFromRefreshToken = (
  refreshToken: string,
): string | undefined => {
  const splitRefreshToken = refreshToken.split('.');
  const splitPayloadToken = atob(splitRefreshToken[1]).split(',');
  const splitExp = splitPayloadToken[3].split(':');
  const expiresAt = splitExp[1]
    .replace('"', '')
    .replace('"', '')
    .replace('}', '');
  if (splitRefreshToken.length === 3 && expiresAt) {
    return expiresAt;
  }
};
