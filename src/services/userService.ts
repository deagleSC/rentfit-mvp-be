import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'tenant' | 'landlord' | 'admin';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  aadhaarNumber?: string;
  panNumber?: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'tenant' | 'landlord' | 'admin';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  profilePicture?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  dateOfBirth?: Date;
  aadhaarNumber?: string;
  panNumber?: string;
  isActive?: boolean;
}

export interface GetUsersFilters {
  role?: 'tenant' | 'landlord' | 'admin';
  isActive?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedUsers {
  users: IUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UserService {
  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<IUser> {
    // Check if user with email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      const error: any = new Error('User with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Check if phone is provided and already exists
    if (userData.phone) {
      const existingPhone = await User.findOne({ phone: userData.phone });
      if (existingPhone) {
        const error: any = new Error('User with this phone number already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    const user = new User(userData);
    await user.save();
    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(id);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(
    filters: GetUsersFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedUsers> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user by ID
   */
  async updateUser(id: string, updateData: UpdateUserData): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if email is being updated and already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        const error: any = new Error('User with this email already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    // Check if phone is being updated and already exists
    if (updateData.phone && updateData.phone !== user.phone) {
      const existingPhone = await User.findOne({ phone: updateData.phone });
      if (existingPhone) {
        const error: any = new Error('User with this phone number already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    // Update user
    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
  }

  /**
   * Soft delete user (set isActive to false)
   */
  async deactivateUser(id: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}

export default new UserService();
