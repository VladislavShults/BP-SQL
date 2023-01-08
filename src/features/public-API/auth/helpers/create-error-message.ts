export const createErrorMessage = (err: string) => [
  {
    message: err + ' invalid',
    field: err,
  },
];
