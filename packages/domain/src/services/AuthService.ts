import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    const isValidPassword = await user.verifyPassword(password);
    
    if (!isValidPassword) {
      return null;
    }

    user.recordLogin();
    await this.userRepository.save(user);

    return user;
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.setPassword(password);
    await this.userRepository.save(user);

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await user.verifyPassword(currentPassword);
    
    if (!isValidPassword) {
      throw new Error('Invalid current password');
    }

    await user.setPassword(newPassword);
    await this.userRepository.save(user);
  }
}