import { query } from '../config/database';
import { AuditLog, UUID, AuditActionType } from '../types';

export const auditLogModel = {
  findById: async (id: number): Promise<AuditLog | null> => {
    const result = await query('SELECT * FROM audit_logs WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  findByUserId: async (userId: UUID, limit: number = 100): Promise<AuditLog[]> => {
    const result = await query(
      'SELECT * FROM audit_logs WHERE who_user_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [userId, limit],
    );
    return result.rows;
  },

  findByDealerId: async (dealerId: UUID, limit: number = 100): Promise<AuditLog[]> => {
    const result = await query(
      'SELECT * FROM audit_logs WHERE dealer_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [dealerId, limit],
    );
    return result.rows;
  },

  findByActionType: async (
    actionType: AuditActionType,
    limit: number = 100,
  ): Promise<AuditLog[]> => {
    const result = await query(
      'SELECT * FROM audit_logs WHERE action_type = $1 ORDER BY timestamp DESC LIMIT $2',
      [actionType, limit],
    );
    return result.rows;
  },

  findAll: async (limit: number = 100): Promise<AuditLog[]> => {
    const result = await query(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1',
      [limit],
    );
    return result.rows;
  },

  create: async (auditData: {
    who_user_id: UUID;
    who_user_name: string;
    dealer_id?: UUID;
    action_type: AuditActionType;
    details: string;
  }): Promise<AuditLog> => {
    const result = await query(
      `INSERT INTO audit_logs (who_user_id, who_user_name, dealer_id, action_type, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        auditData.who_user_id,
        auditData.who_user_name,
        auditData.dealer_id || null,
        auditData.action_type,
        auditData.details,
      ],
    );
    return result.rows[0];
  },

  findByDateRange: async (
    startDate: Date,
    endDate: Date,
    limit: number = 1000,
  ): Promise<AuditLog[]> => {
    const result = await query(
      `SELECT * FROM audit_logs 
       WHERE timestamp >= $1 AND timestamp <= $2 
       ORDER BY timestamp DESC 
       LIMIT $3`,
      [startDate, endDate, limit],
    );
    return result.rows;
  },

  delete: async (id: number): Promise<void> => {
    await query('DELETE FROM audit_logs WHERE id = $1', [id]);
  },

  deleteOlderThan: async (date: Date): Promise<number> => {
    const result = await query('DELETE FROM audit_logs WHERE timestamp < $1', [date]);
    return result.rowCount || 0;
  },
};
