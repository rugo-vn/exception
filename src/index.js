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

export class AclError extends RugoException {
  constructor (msg) {
    super(msg);

    this.status = 403;
  }
}

export class NotFoundError extends RugoException {
  constructor (msg = 'Not found') {
    super(msg);

    this.status = 404;
  }
}

export class ForbiddenError extends RugoException {
  constructor (msg) {
    super(msg);

    this.status = 403;
  }
}

export const ajvError = function (err) {
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
};

const mongoDeepError = err => {
  switch (err.operatorName) {
    case '$jsonSchema':
      return mongoDeepError(err.schemaRulesNotSatisfied[0]);

    case 'properties':
      return mongoDeepError(err.propertiesNotSatisfied[0].details[0]);

    case 'minimum':
    case 'maximum':
      return new ValidationError(`Value ${err.consideredValue} is out of ${err.operatorName} range ${err.specifiedAs[err.operatorName]}`);

    default:
      return new ValidationError(`Document failed validation in operation "${err.operatorName}"`);
  }
};

export const mongoError = function (err) {
  // unique error
  if (err.code === 11000) {
    throw new ValidationError(`Duplicate unique value "${err.keyValue[Object.keys(err.keyValue)[0]]}"`);
  }

  // validate error
  if (err.code === 121) {
    throw mongoDeepError(err.errInfo.details);
  }
};
