import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import userService, { CreateUserData } from './userService';
import { JWTPayload } from '../middleware/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

export interface RegisterData extends CreateUserData {}

class AuthService {
  /**
   * Generate JWT token for user
   */
  private generateToken(payload: JWTPayload): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
      const error: any = new Error('JWT secret is not configured');
      error.statusCode = 500;
      throw error;
    }

    return jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiresIn || '7d',
    } as jwt.SignOptions);
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    // Create user using user service
    const user = await userService.createUser(userData);

    // Generate token
    const token = this.generateToken({
      id: (user._id as { toString: () => string }).toString(),
      email: user.email,
      role: user.role,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      user,
      token,
    };
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      const error: any = new Error('Your account has been deactivated');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove password from user object
    const userObject = user.toObject();
    if ('password' in userObject) {
      delete (userObject as { password?: string }).password;
    }

    // Generate token
    const token = this.generateToken({
      id: (user._id as { toString: () => string }).toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: userObject as IUser,
      token,
    };
  }

  /**
   * Refresh token - generate new token for existing user
   */
  async refreshToken(userId: string): Promise<{ token: string }> {
    const user = await User.findById(userId);

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.isActive) {
      const error: any = new Error('User account is deactivated');
      error.statusCode = 401;
      throw error;
    }

    // Generate new token
    const token = this.generateToken({
      id: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    });

    return { token };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      const error: any = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }

    // Update password
    user.password = newPassword;
    await user.save();
  }
}

export default new AuthService();
