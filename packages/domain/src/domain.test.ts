import { User, Email, AuthService } from '../src/index';
import { InMemoryUserRepository, TestDataFactory } from '@naidp/test-utils';

describe('Domain Layer', () => {
  describe('User Entity', () => {
    it('should create a user with valid data', () => {
      const user = TestDataFactory.createUser({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.fullName).toBe('John Doe');
      expect(user.isActive).toBe(true);
    });

    it('should update user profile', () => {
      const user = TestDataFactory.createUser();
      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure different timestamp
      setTimeout(() => {
        user.updateProfile('Jane', 'Smith');
        
        expect(user.firstName).toBe('Jane');
        expect(user.lastName).toBe('Smith');
        expect(user.fullName).toBe('Jane Smith');
        expect(user.updatedAt).not.toEqual(originalUpdatedAt);
      }, 1);
    });

    it('should activate and deactivate user', () => {
      const user = TestDataFactory.createUser({ isActive: false });
      
      expect(user.isActive).toBe(false);
      
      user.activate();
      expect(user.isActive).toBe(true);
      
      user.deactivate();
      expect(user.isActive).toBe(false);
    });
  });

  describe('Email Value Object', () => {
    it('should create valid email', () => {
      const email = new Email('test@example.com');
      expect(email.value).toBe('test@example.com');
      expect(email.domain).toBe('example.com');
      expect(email.localPart).toBe('test');
    });

    it('should normalize email to lowercase', () => {
      const email = new Email('TEST@Example.COM');
      expect(email.value).toBe('test@example.com');
    });

    it('should throw error for invalid email', () => {
      expect(() => new Email('invalid-email')).toThrow('Invalid email format');
      expect(() => new Email('')).toThrow('Email is required');
    });
  });

  describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: InMemoryUserRepository;

    beforeEach(() => {
      userRepository = new InMemoryUserRepository();
      authService = new AuthService(userRepository);
    });

    it('should register a new user', async () => {
      const user = await authService.register(
        'test@example.com',
        'password123',
        'John',
        'Doe'
      );

      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.isActive).toBe(true);
      expect(user.emailVerified).toBe(false);
    });

    it('should not allow duplicate email registration', async () => {
      await authService.register('test@example.com', 'password123', 'John', 'Doe');
      
      await expect(
        authService.register('test@example.com', 'password456', 'Jane', 'Smith')
      ).rejects.toThrow('User with this email already exists');
    });

    it('should authenticate user with valid credentials', async () => {
      const registeredUser = await authService.register(
        'test@example.com',
        'password123',
        'John',
        'Doe'
      );

      const authenticatedUser = await authService.authenticate(
        'test@example.com',
        'password123'
      );

      expect(authenticatedUser).toBeTruthy();
      expect(authenticatedUser!.id).toBe(registeredUser.id);
    });

    it('should return null for invalid credentials', async () => {
      await authService.register('test@example.com', 'password123', 'John', 'Doe');

      const result = await authService.authenticate('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should throw error for inactive user', async () => {
      const user = await authService.register('test@example.com', 'password123', 'John', 'Doe');
      user.deactivate();
      await userRepository.save(user);

      await expect(
        authService.authenticate('test@example.com', 'password123')
      ).rejects.toThrow('User account is inactive');
    });
  });
});