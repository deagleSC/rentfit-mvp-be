import Unit, { IUnit } from '../models/Unit';
import mongoose from 'mongoose';

export interface CreateUnitData {
  ownerId: string;
  title: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  geo?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  photos?: string[];
  beds?: number;
  areaSqFt?: number;
  status?: 'vacant' | 'occupied' | 'maintenance';
}

export interface UpdateUnitData {
  title?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  geo?: {
    type: 'Point';
    coordinates: [number, number];
  };
  photos?: string[];
  beds?: number;
  areaSqFt?: number;
  status?: 'vacant' | 'occupied' | 'maintenance';
}

export interface GetUnitsFilters {
  ownerId?: string;
  status?: 'vacant' | 'occupied' | 'maintenance';
  city?: string;
  state?: string;
  minBeds?: number;
  maxBeds?: number;
  minArea?: number;
  maxArea?: number;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedUnits {
  units: IUnit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UnitService {
  /**
   * Create a new unit
   */
  async createUnit(unitData: CreateUnitData): Promise<IUnit> {
    // Validate ownerId
    if (!mongoose.Types.ObjectId.isValid(unitData.ownerId)) {
      const error: any = new Error('Invalid owner ID');
      error.statusCode = 400;
      throw error;
    }

    const unit = new Unit(unitData);
    await unit.save();
    return unit.populate('ownerId', 'firstName lastName email');
  }

  /**
   * Get unit by ID
   */
  async getUnitById(id: string): Promise<IUnit> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid unit ID');
      error.statusCode = 400;
      throw error;
    }

    const unit = await Unit.findById(id);
    if (!unit) {
      const error: any = new Error('Unit not found');
      error.statusCode = 404;
      throw error;
    }

    return unit;
  }

  /**
   * Get all units with pagination and filtering
   */
  async getUnits(
    filters: GetUnitsFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedUnits> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (filters.ownerId) {
      if (!mongoose.Types.ObjectId.isValid(filters.ownerId)) {
        const error: any = new Error('Invalid owner ID');
        error.statusCode = 400;
        throw error;
      }
      query.ownerId = filters.ownerId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.city) {
      query['address.city'] = { $regex: filters.city, $options: 'i' };
    }

    if (filters.state) {
      query['address.state'] = { $regex: filters.state, $options: 'i' };
    }

    if (filters.minBeds !== undefined || filters.maxBeds !== undefined) {
      query.beds = {};
      if (filters.minBeds !== undefined) {
        query.beds.$gte = filters.minBeds;
      }
      if (filters.maxBeds !== undefined) {
        query.beds.$lte = filters.maxBeds;
      }
    }

    if (filters.minArea !== undefined || filters.maxArea !== undefined) {
      query.areaSqFt = {};
      if (filters.minArea !== undefined) {
        query.areaSqFt.$gte = filters.minArea;
      }
      if (filters.maxArea !== undefined) {
        query.areaSqFt.$lte = filters.maxArea;
      }
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { 'address.line1': { $regex: filters.search, $options: 'i' } },
        { 'address.city': { $regex: filters.search, $options: 'i' } },
        { 'address.state': { $regex: filters.search, $options: 'i' } },
        { 'address.pincode': { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Execute query
    const [units, total] = await Promise.all([
      Unit.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Unit.countDocuments(query),
    ]);

    return {
      units,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update unit by ID
   */
  async updateUnit(id: string, updateData: UpdateUnitData): Promise<IUnit> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid unit ID');
      error.statusCode = 400;
      throw error;
    }

    const unit = await Unit.findById(id);
    if (!unit) {
      const error: any = new Error('Unit not found');
      error.statusCode = 404;
      throw error;
    }

    // Update unit
    Object.assign(unit, updateData);
    await unit.save();

    return unit.populate('ownerId', 'firstName lastName email');
  }

  /**
   * Delete unit by ID
   */
  async deleteUnit(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid unit ID');
      error.statusCode = 400;
      throw error;
    }

    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) {
      const error: any = new Error('Unit not found');
      error.statusCode = 404;
      throw error;
    }
  }
}

export default new UnitService();
