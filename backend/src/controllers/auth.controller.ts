import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userModel } from '../models/user.model';
import { auditLogModel } from '../models/auditLog.model';
import { hashPassword, comparePassword, generateTempPassword } from '../utils/password';
import { generateToken, createTokenPayload } from '../utils/jwt';
import { AuditActionType, UserRole } from '../types';

export const authController = {
  // Admin Login
  adminLogin: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await userModel.findByEmail(email);

      if (!user || user.role !== UserRole.ADMIN) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }

      const isValidPassword = await comparePassword(password, user.password_hash!);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }

      await userModel.updateLastLogin(user.id);

      // Create audit log
      await auditLogModel.create({
        who_user_id: user.id,
        who_user_name: user.name,
        action_type: AuditActionType.LOGIN,
        details: 'Admin logged in',
      });

      const token = generateToken(
        createTokenPayload(user.id, user.role, user.email, user.dealer_id),
      );

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Login failed',
      });
    }
  },

  // Dealer Login
  dealerLogin: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await userModel.findByEmail(email);

      if (!user || user.role !== UserRole.DEALER) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }

      const isValidPassword = await comparePassword(password, user.password_hash!);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }

      await userModel.updateLastLogin(user.id);

      // Create audit log
      await auditLogModel.create({
        who_user_id: user.id,
        who_user_name: user.name,
        dealer_id: user.dealer_id,
        action_type: AuditActionType.LOGIN,
        details: `Dealer logged in: ${user.name}`,
      });

      const token = generateToken(
        createTokenPayload(user.id, user.role, user.email, user.dealer_id),
      );

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          requiresPasswordChange: user.temp_pass,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Login failed',
      });
    }
  },

  // Change Password
  changePassword: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      const user = await userModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, user.password_hash!);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Current password is incorrect',
        });
        return;
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      const updatedUser = await userModel.updatePassword(userId, newPasswordHash);

      // Create audit log
      await auditLogModel.create({
        who_user_id: userId,
        who_user_name: user.name,
        dealer_id: user.dealer_id,
        action_type: AuditActionType.CHANGE_PASSWORD,
        details: 'User changed their password',
      });

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        data: { user: userWithoutPassword },
        message: 'Password changed successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to change password',
      });
    }
  },

  // Get Current User Profile
  getCurrentUser: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const user = await userModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: { user: userWithoutPassword },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile',
      });
    }
  },

  // Update User Profile
  updateProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { name, username } = req.body;

      const user = await userModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Check if username is already taken by another user
      if (username && username !== user.username) {
        const existingUser = await userModel.findByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          res.status(400).json({
            success: false,
            error: 'Username already taken',
          });
          return;
        }
      }

      const updatedUser = await userModel.update(userId, { name, username });

      // Create audit log
      await auditLogModel.create({
        who_user_id: userId,
        who_user_name: user.name,
        dealer_id: user.dealer_id,
        action_type: AuditActionType.UPDATE_PROFILE,
        details: 'User updated their profile',
      });

      // Remove sensitive data
      const { password_hash, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        data: { user: userWithoutPassword },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  },

  // Forgot Password
  forgotPassword: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      // Always return success message (security best practice)
      // Don't reveal if email exists or not
      res.json({
        success: true,
        message: 'If a user with that email exists, a password reset link has been sent.',
      });

      // Find user by email
      const user = await userModel.findByEmail(email);

      if (!user) {
        return; // Exit silently
      }

      // Generate temporary password
      const tempPassword = generateTempPassword();
      const passwordHash = await hashPassword(tempPassword);

      // Update user with temp password
      await userModel.update(user.id, {
        password_hash: passwordHash,
        temp_pass: true,
      });

      // Create audit log
      await auditLogModel.create({
        who_user_id: user.id,
        who_user_name: user.name,
        dealer_id: user.dealer_id,
        action_type: AuditActionType.PASSWORD_RESET,
        details: 'Password reset requested',
      });

      // TODO: Send email with temporary password
      // In production, this would send an email to the user
      // For now, log it for admin to retrieve
      console.log(`Temporary password for ${email}: ${tempPassword}`);
    } catch (error) {
      // Even on error, return success to avoid user enumeration
      res.json({
        success: true,
        message: 'If a user with that email exists, a password reset link has been sent.',
      });
    }
  },

  // Logout
  logout: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // Create audit log
      await auditLogModel.create({
        who_user_id: userId,
        who_user_name: req.user!.email,
        action_type: AuditActionType.LOGOUT,
        details: 'User logged out',
      });

      res.json({
        success: true,
        message: 'Logged out successfully',
      });

      // Note: In production, implement token blacklisting with Redis
      // For JWT stateless approach, frontend should delete the token
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  },
};
