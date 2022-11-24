export class RugoException extends Error {
  constructor (message) {
    super(message);

    this.status = 400;
    this.title = this.constructor.name;
    this.detail = message || 'Something wrong.';
  }
}

export class ServiceError extends RugoException {
  constructor (message) {
    super(message);

    this.status = 500;
    this.source = { pointer: '' };
  }
}

export class ValidationError extends RugoException {
  constructor (msg) {
    super(msg);

    this.status = 400;
  }
}

export const ajvError = function(err) {
  switch (err.keyword) {
    // non-nested
    case 'required':
      return new ValidationError(`Required value for properties "${err.params.missingProperty}"`);

    case 'minimum':
    case 'maximum':
      return new ValidationError(`Value ${err.value} is out of ${err.keyword} range ${err.params.limit}`);

    default:
      return new ValidationError(`Document failed validation in operation "${err.keyword}"`);
  }
}