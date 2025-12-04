import mongoose from 'mongoose';
import Agreement, { IAgreement, AgreementStatus } from '../models/Agreement';
import Tenancy from '../models/Tenancy';
import Unit from '../models/Unit';
import User from '../models/User';
import { generateAgreementPDF, AgreementTemplateData } from '../utils/pdfGenerator';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

// Custom error type for API errors
interface ApiError extends Error {
  statusCode?: number;
}

export interface CreateAgreementData {
  templateName?: string;
  stateCode?: string;
  clauses?: Array<{ key?: string; text: string }>;
  version?: number;
  createdBy?: string;
  tenancyId?: string; // Optional - either tenancyId or tenancyData must be provided
  status?: AgreementStatus;
  signers?: Array<{
    userId: string;
    name?: string;
    method?: 'esign' | 'otp' | 'manual' | string;
    signedAt?: Date;
    meta?: Record<string, unknown>;
  }>;
  meta?: Record<string, unknown>;
  // When tenancyId is not provided, use this data directly
  tenancyData?: {
    ownerId: string;
    tenantId: string;
    unitId: string;
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
  };
}

export interface UpdateAgreementData {
  templateName?: string;
  stateCode?: string;
  clauses?: Array<{ key?: string; text: string }>;
  pdfUrl?: string;
  version?: number;
  status?: AgreementStatus;
  signers?: Array<{
    userId: string;
    name?: string;
    method?: 'esign' | 'otp' | 'manual' | string;
    signedAt?: Date;
    meta?: Record<string, unknown>;
  }>;
  meta?: Record<string, unknown>;
}

export interface GetAgreementsFilters {
  tenancyId?: string;
  tenantId?: string;
  status?: AgreementStatus;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedAgreements {
  agreements: IAgreement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class AgreementService {
  async createAgreement(data: CreateAgreementData): Promise<IAgreement> {
    // Validate that either tenancyId or tenancyData is provided
    if (!data.tenancyId && !data.tenancyData) {
      const error = new Error('Either tenancyId or tenancyData must be provided') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (data.tenancyId && data.tenancyData) {
      const error = new Error(
        'Cannot provide both tenancyId and tenancyData. Provide only one.'
      ) as ApiError;
      error.statusCode = 400;
      throw error;
    }

    // Validate IDs
    if (data.tenancyId && !mongoose.Types.ObjectId.isValid(data.tenancyId)) {
      const error = new Error('Invalid tenancy ID') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (data.createdBy && !mongoose.Types.ObjectId.isValid(data.createdBy)) {
      const error = new Error('Invalid createdBy user ID') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (data.signers) {
      for (const signer of data.signers) {
        if (!mongoose.Types.ObjectId.isValid(signer.userId)) {
          const error = new Error('Invalid signer user ID') as ApiError;
          error.statusCode = 400;
          throw error;
        }
      }
    }

    let templateData: AgreementTemplateData;
    let agreementTenancyId: mongoose.Types.ObjectId | undefined;
    let agreementTenantId: mongoose.Types.ObjectId | undefined;

    if (data.tenancyId) {
      // Existing flow: Fetch tenancy with populated references
      const tenancy = await Tenancy.findById(data.tenancyId)
        .populate('unitId')
        .populate('ownerId', 'firstName lastName email')
        .populate('tenantId', 'firstName lastName email');

      if (!tenancy) {
        const error = new Error('Tenancy not found') as ApiError;
        error.statusCode = 404;
        throw error;
      }

      // Validate that required data exists
      if (!tenancy.ownerId || !tenancy.tenantId) {
        const error = new Error('Tenancy is missing owner or tenant information') as ApiError;
        error.statusCode = 400;
        throw error;
      }

      agreementTenancyId = new mongoose.Types.ObjectId(data.tenancyId);
      agreementTenantId = new mongoose.Types.ObjectId(tenancy.tenantId.toString());

      // Prepare template data from tenancy
      templateData = {
        templateName: data.templateName,
        stateCode: data.stateCode,
        clauses: data.clauses || [],
        version: data.version || 1,
        createdAt: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        tenancy: {
          rent: {
            amount: tenancy.rent.amount,
            cycle: tenancy.rent.cycle || 'monthly',
            dueDateDay: tenancy.rent.dueDateDay,
            utilitiesIncluded: tenancy.rent.utilitiesIncluded,
          },
          deposit: tenancy.deposit
            ? {
                amount: tenancy.deposit.amount,
                status: tenancy.deposit.status,
              }
            : undefined,
          unit: {
            title:
              (
                tenancy.unitId as {
                  title?: string;
                  address?: {
                    line1?: string;
                    line2?: string;
                    city?: string;
                    state?: string;
                    pincode?: string;
                  };
                  _id?: { toString: () => string };
                }
              )?.title || '',
            address: (
              tenancy.unitId as {
                address?: {
                  line1?: string;
                  line2?: string;
                  city?: string;
                  state?: string;
                  pincode?: string;
                };
              }
            )?.address,
            _id: (tenancy.unitId as { _id?: { toString: () => string } })?._id?.toString() || '',
          },
          owner: {
            firstName:
              (
                tenancy.ownerId as {
                  firstName?: string;
                  lastName?: string;
                  email?: string;
                  _id?: { toString: () => string };
                }
              )?.firstName || '',
            lastName: (tenancy.ownerId as { lastName?: string })?.lastName || '',
            email: (tenancy.ownerId as { email?: string })?.email || '',
            _id: (tenancy.ownerId as { _id?: { toString: () => string } })?._id?.toString() || '',
          },
          tenant: {
            firstName:
              (
                tenancy.tenantId as {
                  firstName?: string;
                  lastName?: string;
                  email?: string;
                  _id?: { toString: () => string };
                }
              )?.firstName || '',
            lastName: (tenancy.tenantId as { lastName?: string })?.lastName || '',
            email: (tenancy.tenantId as { email?: string })?.email || '',
            _id: (tenancy.tenantId as { _id?: { toString: () => string } })?._id?.toString() || '',
          },
        },
        signers: data.signers?.map(s => ({
          userId: s.userId,
          name: s.name,
          method: s.method,
          signedAt: s.signedAt ? new Date(s.signedAt).toLocaleDateString('en-IN') : undefined,
        })),
        meta: data.meta,
      };
    } else if (data.tenancyData) {
      // New flow: Fetch owner, tenant, and unit directly
      // Validate tenancyData IDs
      if (!mongoose.Types.ObjectId.isValid(data.tenancyData.ownerId)) {
        const error = new Error('Invalid owner ID in tenancyData') as ApiError;
        error.statusCode = 400;
        throw error;
      }
      if (!mongoose.Types.ObjectId.isValid(data.tenancyData.tenantId)) {
        const error = new Error('Invalid tenant ID in tenancyData') as ApiError;
        error.statusCode = 400;
        throw error;
      }
      if (!mongoose.Types.ObjectId.isValid(data.tenancyData.unitId)) {
        const error = new Error('Invalid unit ID in tenancyData') as ApiError;
        error.statusCode = 400;
        throw error;
      }

      // Fetch owner, tenant, and unit in parallel
      const [owner, tenant, unit] = await Promise.all([
        User.findById(data.tenancyData.ownerId).select('firstName lastName email'),
        User.findById(data.tenancyData.tenantId).select('firstName lastName email'),
        Unit.findById(data.tenancyData.unitId),
      ]);

      if (!owner) {
        const error = new Error('Owner not found') as ApiError;
        error.statusCode = 404;
        throw error;
      }
      if (!tenant) {
        const error = new Error('Tenant not found') as ApiError;
        error.statusCode = 404;
        throw error;
      }
      if (!unit) {
        const error = new Error('Unit not found') as ApiError;
        error.statusCode = 404;
        throw error;
      }

      // Extract tenantId from tenancyData
      agreementTenantId = new mongoose.Types.ObjectId(data.tenancyData.tenantId);

      // Prepare template data from provided data
      templateData = {
        templateName: data.templateName,
        stateCode: data.stateCode,
        clauses: data.clauses || [],
        version: data.version || 1,
        createdAt: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        tenancy: {
          rent: {
            amount: data.tenancyData.rent.amount,
            cycle: data.tenancyData.rent.cycle || 'monthly',
            dueDateDay: data.tenancyData.rent.dueDateDay,
            utilitiesIncluded: data.tenancyData.rent.utilitiesIncluded,
          },
          deposit: data.tenancyData.deposit
            ? {
                amount: data.tenancyData.deposit.amount,
                status: data.tenancyData.deposit.status,
              }
            : undefined,
          unit: {
            title: unit.title || '',
            address: unit.address,
            _id: (unit._id as mongoose.Types.ObjectId).toString(),
          },
          owner: {
            firstName: owner.firstName || '',
            lastName: owner.lastName || '',
            email: owner.email || '',
            _id: (owner._id as mongoose.Types.ObjectId).toString(),
          },
          tenant: {
            firstName: tenant.firstName || '',
            lastName: tenant.lastName || '',
            email: tenant.email || '',
            _id: (tenant._id as mongoose.Types.ObjectId).toString(),
          },
        },
        signers: data.signers?.map(s => ({
          userId: s.userId,
          name: s.name,
          method: s.method,
          signedAt: s.signedAt ? new Date(s.signedAt).toLocaleDateString('en-IN') : undefined,
        })),
        meta: data.meta,
      };
    } else {
      // This should never happen due to validation above, but TypeScript needs it
      const error = new Error('Either tenancyId or tenancyData must be provided') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    // Validate that tenantId was extracted
    if (!agreementTenantId) {
      const error = new Error('Tenant ID is required but could not be determined') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    // Prepare agreement data (without pdfUrl - will be generated)
    const agreementData = {
      templateName: data.templateName,
      stateCode: data.stateCode,
      clauses: data.clauses,
      version: data.version,
      createdBy: data.createdBy ? new mongoose.Types.ObjectId(data.createdBy) : undefined,
      tenancyId: agreementTenancyId,
      tenantId: agreementTenantId,
      status: data.status,
      signers: data.signers?.map(s => ({
        ...s,
        userId: new mongoose.Types.ObjectId(s.userId),
      })),
      meta: data.meta,
    };

    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateAgreementPDF(templateData);
    } catch (error) {
      const err = new Error(
        `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as ApiError;
      err.statusCode = 500;
      throw err;
    }

    // Upload PDF to Cloudinary
    let pdfUrl: string;
    try {
      const uploadResult = await uploadToCloudinary(pdfBuffer, {
        folder: 'rentfit/agreements',
        resourceType: 'raw',
        tags: ['agreement', 'pdf'],
      });
      pdfUrl = uploadResult.secureUrl;
    } catch (error) {
      const err = new Error(
        `Failed to upload PDF to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`
      ) as ApiError;
      err.statusCode = 500;
      throw err;
    }

    // Create agreement with generated pdfUrl
    const agreement = new Agreement({
      ...agreementData,
      pdfUrl,
    });

    await agreement.save();
    return agreement;
  }

  async getAgreementById(id: string): Promise<IAgreement> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid agreement ID') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    const agreement = await Agreement.findById(id).populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'tenancyId' },
      { path: 'signers.userId', select: 'firstName lastName email' },
    ]);

    if (!agreement) {
      const error = new Error('Agreement not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    return agreement;
  }

  async getAgreements(
    filters: GetAgreementsFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginatedAgreements> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filters.tenancyId) {
      if (!mongoose.Types.ObjectId.isValid(filters.tenancyId)) {
        const error = new Error('Invalid tenancy ID') as ApiError;
        error.statusCode = 400;
        throw error;
      }
      query.tenancyId = filters.tenancyId;
    }

    if (filters.tenantId) {
      if (!mongoose.Types.ObjectId.isValid(filters.tenantId)) {
        const error = new Error('Invalid tenant ID') as ApiError;
        error.statusCode = 400;
        throw error;
      }
      // Filter agreements directly by tenantId
      query.tenantId = filters.tenantId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const [agreements, total] = await Promise.all([
      Agreement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Agreement.countDocuments(query),
    ]);

    return {
      agreements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateAgreement(id: string, data: UpdateAgreementData): Promise<IAgreement> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid agreement ID') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (data.signers) {
      for (const signer of data.signers) {
        if (!mongoose.Types.ObjectId.isValid(signer.userId)) {
          const error = new Error('Invalid signer user ID') as ApiError;
          error.statusCode = 400;
          throw error;
        }
      }
    }

    const update: Record<string, unknown> = { ...data };
    if (data.signers) {
      update.signers = data.signers.map(s => ({
        ...s,
        userId: new mongoose.Types.ObjectId(s.userId),
      }));
    }

    const agreement = await Agreement.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!agreement) {
      const error = new Error('Agreement not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    return agreement;
  }

  async deleteAgreement(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid agreement ID') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    const deleted = await Agreement.findByIdAndDelete(id);
    if (!deleted) {
      const error = new Error('Agreement not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }
  }

  /**
   * Sign an agreement
   * Adds or updates a signature for a user and updates agreement status accordingly
   */
  async signAgreement(
    id: string,
    userId: string,
    signatureData?: {
      name?: string;
      method?: 'esign' | 'otp' | 'manual' | string;
      meta?: Record<string, unknown>;
    }
  ): Promise<IAgreement> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Invalid agreement ID') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user ID') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    const agreement = await Agreement.findById(id);
    if (!agreement) {
      const error = new Error('Agreement not found') as ApiError;
      error.statusCode = 404;
      throw error;
    }

    // Check if agreement is already fully signed (at least 2 signatures) or cancelled
    const currentSignedCount = agreement.signers?.filter(s => s.signedAt).length || 0;
    if (agreement.status === 'signed' && currentSignedCount >= 2) {
      const error = new Error('Agreement is already fully signed') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    if (agreement.status === 'cancelled') {
      const error = new Error('Cannot sign a cancelled agreement') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    // Initialize signers array if it doesn't exist
    if (!agreement.signers) {
      agreement.signers = [];
    }

    // Find existing signature for this user
    const existingSignatureIndex = agreement.signers.findIndex(s => s.userId.toString() === userId);

    const signatureEntry = {
      userId: userIdObjectId,
      name: signatureData?.name,
      method: signatureData?.method || 'manual',
      signedAt: now,
      meta: signatureData?.meta,
    };

    if (existingSignatureIndex >= 0) {
      // Update existing signature
      Object.assign(agreement.signers[existingSignatureIndex], signatureEntry);
    } else {
      // Add new signature - cast through unknown to handle ObjectId type difference
      agreement.signers.push(signatureEntry as unknown as (typeof agreement.signers)[0]);
    }

    // Update lastSignedAt
    agreement.lastSignedAt = now;

    // Update status based on signing progress
    if (agreement.status === 'draft') {
      // First signature moves from draft to pending_signature
      agreement.status = 'pending_signature';
    }

    // Count how many signers have signed (have signedAt)
    const signedCount = agreement.signers.filter(s => s.signedAt).length;

    // Only mark as "signed" if at least 2 signatures are present
    // Otherwise, keep it as "pending_signature"
    if (signedCount >= 2) {
      agreement.status = 'signed';

      // Update the corresponding tenancy status to 'active' if it exists
      let tenancyIdToUpdate: string | null = null;

      // First, try to get tenancyId from the agreement
      if (agreement.tenancyId) {
        tenancyIdToUpdate = agreement.tenancyId.toString();
      } else {
        // If agreement doesn't have tenancyId, find tenancy by agreementId
        const agreementId = (agreement._id as mongoose.Types.ObjectId).toString();
        const tenancy = await Tenancy.findOne({
          'agreement.agreementId': agreementId,
        });
        if (tenancy) {
          tenancyIdToUpdate = (tenancy._id as mongoose.Types.ObjectId).toString();
        }
      }

      // Update tenancy status if we found a tenancy
      if (tenancyIdToUpdate) {
        try {
          await Tenancy.findByIdAndUpdate(tenancyIdToUpdate, { status: 'active' }, { new: true });
        } catch (error) {
          // Log error but don't fail the agreement signing
          console.error('Failed to update tenancy status:', error);
        }
      }
    } else {
      // Ensure status is pending_signature if less than 2 signatures
      agreement.status = 'pending_signature';
    }

    await agreement.save();

    // Populate and return
    return agreement.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'tenancyId' },
      { path: 'signers.userId', select: 'firstName lastName email' },
    ]);
  }
}

export default new AgreementService();
