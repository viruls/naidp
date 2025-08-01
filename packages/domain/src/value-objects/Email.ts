import validator from 'validator';

export class Email {
  private readonly _value: string;

  constructor(email: string) {
    if (!email) {
      throw new Error('Email is required');
    }

    if (!validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }

    this._value = email.toLowerCase().trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  get localPart(): string {
    return this._value.split('@')[0];
  }
}