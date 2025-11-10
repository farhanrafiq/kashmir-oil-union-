import { query } from '../config/database';
import { Dealer, UUID } from '../types';

export const dealerModel = {
  findById: async (id: UUID): Promise<Dealer | null> => {
    const result = await query('SELECT * FROM dealers WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  findByUserId: async (userId: UUID): Promise<Dealer | null> => {
    const result = await query('SELECT * FROM dealers WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  },

  findAll: async (): Promise<Dealer[]> => {
    const result = await query(
      'SELECT * FROM dealers ORDER BY created_at DESC',
    );
    return result.rows;
  },

  findByStatus: async (status: 'active' | 'suspended'): Promise<Dealer[]> => {
    const result = await query(
      'SELECT * FROM dealers WHERE status = $1 ORDER BY created_at DESC',
      [status],
    );
    return result.rows;
  },

  create: async (dealerData: {
    user_id: UUID;
    company_name: string;
    primary_contact_name: string;
    primary_contact_phone: string;
    primary_contact_email: string;
    address: string;
    status?: 'active' | 'suspended';
  }): Promise<Dealer> => {
    const result = await query(
      `INSERT INTO dealers (user_id, company_name, primary_contact_name, primary_contact_phone, 
       primary_contact_email, address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        dealerData.user_id,
        dealerData.company_name,
        dealerData.primary_contact_name,
        dealerData.primary_contact_phone,
        dealerData.primary_contact_email,
        dealerData.address,
        dealerData.status || 'active',
      ],
    );
    return result.rows[0];
  },

  update: async (
    id: UUID,
    updates: Partial<Omit<Dealer, 'id' | 'user_id' | 'created_at'>>,
  ): Promise<Dealer> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(id);

    const result = await query(
      `UPDATE dealers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );

    return result.rows[0];
  },

  updateStatus: async (
    id: UUID,
    status: 'active' | 'suspended',
  ): Promise<Dealer> => {
    const result = await query(
      `UPDATE dealers SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id],
    );
    return result.rows[0];
  },

  delete: async (id: UUID): Promise<void> => {
    await query('DELETE FROM dealers WHERE id = $1', [id]);
  },

  getWithUserDetails: async (id: UUID) => {
    const result = await query(
      `SELECT d.*, u.name as user_name, u.email as user_email, u.username
       FROM dealers d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  getAllWithUserDetails: async () => {
    const result = await query(
      `SELECT d.*, u.name as user_name, u.email as user_email, u.username
       FROM dealers d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`,
    );
    return result.rows;
  },
};
