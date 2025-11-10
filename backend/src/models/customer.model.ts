import { query } from '../config/database';
import { Customer, UUID } from '../types';

export const customerModel = {
  findById: async (id: UUID): Promise<Customer | null> => {
    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  findByDealerId: async (dealerId: UUID): Promise<Customer[]> => {
    const result = await query(
      'SELECT * FROM customers WHERE dealer_id = $1 ORDER BY created_at DESC',
      [dealerId],
    );
    return result.rows;
  },

  findByStatus: async (
    dealerId: UUID,
    status: 'active' | 'inactive',
  ): Promise<Customer[]> => {
    const result = await query(
      'SELECT * FROM customers WHERE dealer_id = $1 AND status = $2 ORDER BY created_at DESC',
      [dealerId, status],
    );
    return result.rows;
  },

  findByType: async (
    dealerId: UUID,
    type: 'private' | 'government',
  ): Promise<Customer[]> => {
    const result = await query(
      'SELECT * FROM customers WHERE dealer_id = $1 AND type = $2 ORDER BY created_at DESC',
      [dealerId, type],
    );
    return result.rows;
  },

  create: async (customerData: {
    dealer_id: UUID;
    type: 'private' | 'government';
    name_or_entity: string;
    contact_person?: string;
    phone: string;
    email: string;
    official_id: string;
    address: string;
  }): Promise<Customer> => {
    const result = await query(
      `INSERT INTO customers (dealer_id, type, name_or_entity, contact_person, phone, email, official_id, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        customerData.dealer_id,
        customerData.type,
        customerData.name_or_entity,
        customerData.contact_person || null,
        customerData.phone,
        customerData.email,
        customerData.official_id,
        customerData.address,
      ],
    );
    return result.rows[0];
  },

  update: async (
    id: UUID,
    updates: Partial<Omit<Customer, 'id' | 'dealer_id' | 'created_at'>>,
  ): Promise<Customer> => {
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
      `UPDATE customers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );

    return result.rows[0];
  },

  updateStatus: async (
    id: UUID,
    status: 'active' | 'inactive',
  ): Promise<Customer> => {
    const result = await query(
      `UPDATE customers SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id],
    );
    return result.rows[0];
  },

  delete: async (id: UUID): Promise<void> => {
    await query('DELETE FROM customers WHERE id = $1', [id]);
  },

  searchGlobal: async (searchTerm: string) => {
    const result = await query(
      `SELECT c.*, d.company_name as dealer_company_name
       FROM customers c
       JOIN dealers d ON c.dealer_id = d.id
       WHERE 
         LOWER(c.name_or_entity) LIKE LOWER($1) OR
         c.phone LIKE $1 OR
         c.official_id LIKE $1 OR
         c.email LIKE LOWER($1) OR
         LOWER(c.contact_person) LIKE LOWER($1)
       ORDER BY c.created_at DESC
       LIMIT 50`,
      [`%${searchTerm}%`],
    );
    return result.rows;
  },
};
