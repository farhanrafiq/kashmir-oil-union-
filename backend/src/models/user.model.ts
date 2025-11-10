import { query } from '../config/database';
import { User, UUID, UserRole } from '../types';

export const userModel = {
  findById: async (id: UUID): Promise<User | null> => {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  findByUsername: async (username: string): Promise<User | null> => {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  },

  create: async (userData: {
    role: UserRole;
    name: string;
    username: string;
    email: string;
    password_hash: string;
    temp_pass?: boolean;
    dealer_id?: UUID;
  }): Promise<User> => {
    const result = await query(
      `INSERT INTO users (role, name, username, email, password_hash, temp_pass, dealer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userData.role,
        userData.name,
        userData.username,
        userData.email,
        userData.password_hash,
        userData.temp_pass || false,
        userData.dealer_id || null,
      ],
    );
    return result.rows[0];
  },

  update: async (
    id: UUID,
    updates: Partial<Omit<User, 'id' | 'created_at'>>,
  ): Promise<User> => {
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
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );

    return result.rows[0];
  },

  updatePassword: async (id: UUID, passwordHash: string): Promise<User> => {
    const result = await query(
      `UPDATE users SET password_hash = $1, temp_pass = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [passwordHash, id],
    );
    return result.rows[0];
  },

  updateLastLogin: async (id: UUID): Promise<void> => {
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  },

  delete: async (id: UUID): Promise<void> => {
    await query('DELETE FROM users WHERE id = $1', [id]);
  },

  getAllByRole: async (role: UserRole): Promise<User[]> => {
    const result = await query('SELECT * FROM users WHERE role = $1', [role]);
    return result.rows;
  },
};
