import Error from '@lib/error.exception';

class DatabaseException extends Error {
  constructor(message?: string) {
    super('database', message ?? 'exception.database');
  }
}

export default DatabaseException;
