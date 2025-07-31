import bcrypt from 'bcryptjs';
import { Entity } from './Entity';
import { Email } from '../value-objects/Email';

export interface UserProps {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: Date;
}

export class User extends Entity {
  private _email: Email;
  private _password: string;
  private _firstName: string;
  private _lastName: string;
  private _isActive: boolean;
  private _emailVerified: boolean;
  private _lastLoginAt?: Date;

  constructor(props: UserProps) {
    super(props.id);
    this._email = new Email(props.email);
    this._password = props.password;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._isActive = props.isActive ?? true;
    this._emailVerified = props.emailVerified ?? false;
    this._lastLoginAt = props.lastLoginAt;
  }

  get email(): string {
    return this._email.value;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  async setPassword(password: string): Promise<void> {
    this._password = await bcrypt.hash(password, 12);
    this.touch();
  }

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this._password);
  }

  activate(): void {
    this._isActive = true;
    this.touch();
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  verifyEmail(): void {
    this._emailVerified = true;
    this.touch();
  }

  recordLogin(): void {
    this._lastLoginAt = new Date();
    this.touch();
  }

  updateProfile(firstName: string, lastName: string): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this.touch();
  }
}