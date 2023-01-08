export const extractIssueAtFromRefreshToken = (
  refreshToken: string,
): string | undefined => {
  const splitRefreshToken = refreshToken.split('.');
  const splitPayloadToken = atob(splitRefreshToken[1]).split(',');
  const splitIat = splitPayloadToken[2].split(':');
  const issueAt = splitIat[1].replace('"', '').replace('"', '');
  if (splitRefreshToken.length === 3 && issueAt) {
    return issueAt;
  }
};
