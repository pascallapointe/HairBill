import Error from '@lib/error.exception';

class UnauthenticatedException extends Error {
  constructor() {
    super('unauthenticated', 'exception.unauthenticated');
  }
}

export default UnauthenticatedException;
