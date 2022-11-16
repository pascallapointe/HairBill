import { ErrorCode } from '@type/error.type';

class Error {
  constructor(code: ErrorCode, message: string) {
    this.code = code;
    this.message = message;
  }

  code: ErrorCode;
  message: string;
}

export default Error;
