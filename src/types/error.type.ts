export type ErrorCode = 'unauthenticated' | 'database' | 'badRequest';

export type ErrorType = { code: ErrorCode; message: string };
