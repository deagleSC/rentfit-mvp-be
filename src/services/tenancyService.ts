import Tenancy, { ITenancy, TenancyStatus } from '../models/Tenancy';
import Agreement from '../models/Agreement';
import mongoose from 'mongoose';

export interface CreateTenancyData {
  unitId: string;
  ownerId: string;
  tenantId: string;
  agreementId?: string;
  rent: {
    amount: number;
    cycle: 'monthly' | 'quarterly' | 'yearly' | string;
    dueDateDay?: number;
    utilitiesIncluded?: boolean;
  };
  deposit?: {
    amount?: number;
    status?: 'upcoming' | 'held' | 'returned' | 'disputed';
  };
  status?: TenancyStatus;
}

export interface UpdateTenancyData {
  agreement?: {
    agreementId?: string;
    pdfUrl?: string;
    version?: number;
    signedAt?: Date;
  };
  rent?: {
    amount?: number;
    cycle?: 'monthly' | 'quarterly' | 'yearly' | string;
    dueDateDay?: number;
    utilitiesIncluded?: boolean;
  };
  deposit?: {
    amount?: number;
    status?: 'upcoming' | 'held' | 'returned' | 'disputed';
  };
  payments?: Array<{
    paymentId?: string;
    amount: number;
    date: Date;
    method?: string;
    reference?: string;
    receiptUrl?: string;
  }>;
  evidence?: Array<{
    type: 'photo' | 'video' | 'document' | string;
    url: string;
    timestamp?: Date;
    uploaderId: string;
    meta?: Record<string, any>;
  }>;
  status?: TenancyStatus;
}

export interface GetTenanciesFilters {
  ownerId?: string;
  tenantId?: string;
  unitId?: string;
  status?: TenancyStatus;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedTenancies {
  tenancies: ITenancy[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class TenancyService {
  /**
   * Create a new tenancy
   */
  async createTenancy(tenancyData: CreateTenancyData): Promise<ITenancy> {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(tenancyData.unitId)) {
      const error: any = new Error('Invalid unit ID');
      error.statusCode = 400;
      throw error;
    }
    if (!mongoose.Types.ObjectId.isValid(tenancyData.ownerId)) {
      const error: any = new Error('Invalid owner ID');
      error.statusCode = 400;
      throw error;
    }
    if (!mongoose.Types.ObjectId.isValid(tenancyData.tenantId)) {
      const error: any = new Error('Invalid tenant ID');
      error.statusCode = 400;
      throw error;
    }

    // If an agreementId is provided, validate and populate agreement details from Agreement collection
    let agreementPayload: ITenancy['agreement'] | undefined;
    if (tenancyData.agreementId) {
      if (!mongoose.Types.ObjectId.isValid(tenancyData.agreementId)) {
        const error: any = new Error('Invalid agreement ID');
        error.statusCode = 400;
        throw error;
      }

      const agreement = await Agreement.findById(tenancyData.agreementId);
      if (!agreement) {
        const error: any = new Error('Agreement not found');
        error.statusCode = 404;
        throw error;
      }

      agreementPayload = {
        agreementId: agreement._id as any,
        pdfUrl: agreement.pdfUrl,
        version: agreement.version,
        signedAt: agreement.lastSignedAt,
      };
    }

    const { agreementId, ...rest } = tenancyData;
    const tenancy = new Tenancy({
      ...rest,
      ...(agreementPayload && { agreement: agreementPayload }),
    });
    await tenancy.save();

    // Update the agreement's tenancyId if it wasn't already set
    if (tenancyData.agreementId && tenancy._id) {
      const agreement = await Agreement.findById(tenancyData.agreementId);
      if (agreement && !agreement.tenancyId) {
        agreement.tenancyId = tenancy._id as any;
        await agreement.save();
      }
    }
    return tenancy.populate([
      { path: 'unitId', select: 'title address' },
      { path: 'ownerId', select: 'firstName lastName email' },
      { path: 'tenantId', select: 'firstName lastName email' },
    ]);
  }

  /**
   * Get tenancy by ID
   */
  async getTenancyById(id: string): Promise<ITenancy> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid tenancy ID');
      error.statusCode = 400;
      throw error;
    }

    const tenancy = await Tenancy.findById(id).populate([
      { path: 'unitId', select: 'title address' },
      { path: 'ownerId', select: 'firstName lastName email' },
      { path: 'tenantId', select: 'firstName lastName email' },
    ]);
    if (!tenancy) {
      const error: any = new Error('Tenancy not found');
      error.statusCode = 404;
      throw error;
    }

    return tenancy;
  }

  /**
   * Get all tenancies with pagination and filtering
   */
  async getTenancies(
    filters: GetTenanciesFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedTenancies> {
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

    if (filters.tenantId) {
      if (!mongoose.Types.ObjectId.isValid(filters.tenantId)) {
        const error: any = new Error('Invalid tenant ID');
        error.statusCode = 400;
        throw error;
      }
      query.tenantId = filters.tenantId;
    }

    if (filters.unitId) {
      if (!mongoose.Types.ObjectId.isValid(filters.unitId)) {
        const error: any = new Error('Invalid unit ID');
        error.statusCode = 400;
        throw error;
      }
      query.unitId = filters.unitId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    // Execute query
    const [tenancies, total] = await Promise.all([
      Tenancy.find(query)
        .populate([
          { path: 'unitId', select: 'title address' },
          { path: 'ownerId', select: 'firstName lastName email' },
          { path: 'tenantId', select: 'firstName lastName email' },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Tenancy.countDocuments(query),
    ]);

    return {
      tenancies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update tenancy by ID
   */
  async updateTenancy(id: string, updateData: UpdateTenancyData): Promise<ITenancy> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid tenancy ID');
      error.statusCode = 400;
      throw error;
    }

    const tenancy = await Tenancy.findById(id);
    if (!tenancy) {
      const error: any = new Error('Tenancy not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate agreementId if provided
    if (updateData.agreement?.agreementId) {
      if (!mongoose.Types.ObjectId.isValid(updateData.agreement.agreementId)) {
        const error: any = new Error('Invalid agreement ID');
        error.statusCode = 400;
        throw error;
      }
    }

    // Validate uploaderId in evidence if provided
    if (updateData.evidence) {
      for (const evidence of updateData.evidence) {
        if (evidence.uploaderId && !mongoose.Types.ObjectId.isValid(evidence.uploaderId)) {
          const error: any = new Error('Invalid uploader ID in evidence');
          error.statusCode = 400;
          throw error;
        }
      }
    }

    // Handle payments and evidence arrays - append to existing arrays
    if (updateData.payments) {
      tenancy.payments.push(...updateData.payments);
      delete updateData.payments;
    }

    if (updateData.evidence) {
      // Convert uploaderId strings to ObjectIds and ensure timestamp is set
      const evidenceWithObjectIds = updateData.evidence.map(ev => ({
        ...ev,
        uploaderId: new mongoose.Types.ObjectId(ev.uploaderId) as any,
        timestamp: ev.timestamp || new Date(),
      }));
      tenancy.evidence.push(...(evidenceWithObjectIds as any));
      delete updateData.evidence;
    }

    // Update tenancy
    Object.assign(tenancy, updateData);
    await tenancy.save();

    return tenancy.populate([
      { path: 'unitId', select: 'title address' },
      { path: 'ownerId', select: 'firstName lastName email' },
      { path: 'tenantId', select: 'firstName lastName email' },
    ]);
  }

  /**
   * Delete tenancy by ID
   */
  async deleteTenancy(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid tenancy ID');
      error.statusCode = 400;
      throw error;
    }

    const tenancy = await Tenancy.findByIdAndDelete(id);
    if (!tenancy) {
      const error: any = new Error('Tenancy not found');
      error.statusCode = 404;
      throw error;
    }
  }
}

export default new TenancyService();
