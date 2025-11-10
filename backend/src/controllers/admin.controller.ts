import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dealerModel } from '../models/dealer.model';
import { userModel } from '../models/user.model';
import { auditLogModel } from '../models/auditLog.model';
import { hashPassword, generateTempPassword } from '../utils/password';
import { AuditActionType, UserRole } from '../types';

export const adminController = {
  // Get all dealers
  getAllDealers: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dealers = await dealerModel.getAllWithUserDetails();

      res.json({
        success: true,
        data: { dealers },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dealers',
      });
    }
  },

  // Get dealer by ID
  getDealerById: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const dealer = await dealerModel.getWithUserDetails(id);

      if (!dealer) {
        res.status(404).json({
          success: false,
          error: 'Dealer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: { dealer },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dealer',
      });
    }
  },

  // Create new dealer
  createDealer: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        name,
        username,
        email,
        company_name,
        primary_contact_name,
        primary_contact_phone,
        primary_contact_email,
        address,
      } = req.body;

      // Check if email or username already exists
      const existingEmail = await userModel.findByEmail(email);
      if (existingEmail) {
        res.status(400).json({
          success: false,
          error: 'Email already exists',
        });
        return;
      }

      const existingUsername = await userModel.findByUsername(username);
      if (existingUsername) {
        res.status(400).json({
          success: false,
          error: 'Username already exists',
        });
        return;
      }

      // Generate temporary password
      const tempPassword = generateTempPassword();
      const passwordHash = await hashPassword(tempPassword);

      // Create user account
      const user = await userModel.create({
        role: UserRole.DEALER,
        name,
        username,
        email,
        password_hash: passwordHash,
        temp_pass: true,
      });

      // Create dealer profile
      const dealer = await dealerModel.create({
        user_id: user.id,
        company_name,
        primary_contact_name,
        primary_contact_phone,
        primary_contact_email,
        address,
      });

      // Update user with dealer_id
      await userModel.update(user.id, { dealer_id: dealer.id });

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        action_type: AuditActionType.CREATE_DEALER,
        details: `Created dealer: ${company_name}`,
      });

      res.status(201).json({
        success: true,
        data: {
          dealer,
          tempPassword, // Send temp password to admin (should be sent via email in production)
        },
        message: 'Dealer created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create dealer',
      });
    }
  },

  // Update dealer
  updateDealer: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        company_name,
        primary_contact_name,
        primary_contact_phone,
        primary_contact_email,
        address,
        status,
      } = req.body;

      const dealer = await dealerModel.findById(id);

      if (!dealer) {
        res.status(404).json({
          success: false,
          error: 'Dealer not found',
        });
        return;
      }

      const updatedDealer = await dealerModel.update(id, {
        company_name,
        primary_contact_name,
        primary_contact_phone,
        primary_contact_email,
        address,
        status,
      });

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        dealer_id: id,
        action_type: AuditActionType.UPDATE_DEALER,
        details: `Updated dealer: ${updatedDealer.company_name}`,
      });

      res.json({
        success: true,
        data: { dealer: updatedDealer },
        message: 'Dealer updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update dealer',
      });
    }
  },

  // Delete dealer
  deleteDealer: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const dealer = await dealerModel.findById(id);

      if (!dealer) {
        res.status(404).json({
          success: false,
          error: 'Dealer not found',
        });
        return;
      }

      // Delete dealer (will cascade delete user due to foreign key)
      await dealerModel.delete(id);

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        action_type: AuditActionType.DELETE_DEALER,
        details: `Deleted dealer: ${dealer.company_name}`,
      });

      res.json({
        success: true,
        message: 'Dealer deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete dealer',
      });
    }
  },

  // Reset dealer password
  resetDealerPassword: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.body;

      const user = await userModel.findById(userId);

      if (!user || user.role !== UserRole.DEALER) {
        res.status(404).json({
          success: false,
          error: 'Dealer not found',
        });
        return;
      }

      // Generate temporary password
      const tempPassword = generateTempPassword();
      const passwordHash = await hashPassword(tempPassword);

      // Update password
      await userModel.update(userId, {
        password_hash: passwordHash,
        temp_pass: true,
      });

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        dealer_id: user.dealer_id,
        action_type: AuditActionType.RESET_PASSWORD,
        details: `Admin reset password for dealer: ${user.name}`,
      });

      res.json({
        success: true,
        data: { tempPass: tempPassword },
        message: 'Password reset successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to reset password',
      });
    }
  },

  // Get audit logs
  getAuditLogs: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;

      const logs = await auditLogModel.findAll(limit);

      res.json({
        success: true,
        data: { logs },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit logs',
      });
    }
  },
};
