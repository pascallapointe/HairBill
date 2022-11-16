export type ErrorCode = 'unauthenticated' | 'database';

export type ErrorType = { code: ErrorCode; message: string };
