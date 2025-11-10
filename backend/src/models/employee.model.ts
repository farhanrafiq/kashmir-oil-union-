import { query } from '../config/database';
import { Employee, UUID } from '../types';

export const employeeModel = {
  findById: async (id: UUID): Promise<Employee | null> => {
    const result = await query('SELECT * FROM employees WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  findByDealerId: async (dealerId: UUID): Promise<Employee[]> => {
    const result = await query(
      'SELECT * FROM employees WHERE dealer_id = $1 ORDER BY hire_date DESC',
      [dealerId],
    );
    return result.rows;
  },

  findByAadhar: async (aadhar: string): Promise<Employee | null> => {
    const result = await query('SELECT * FROM employees WHERE aadhar = $1', [aadhar]);
    return result.rows[0] || null;
  },

  findByStatus: async (
    dealerId: UUID,
    status: 'active' | 'terminated',
  ): Promise<Employee[]> => {
    const result = await query(
      'SELECT * FROM employees WHERE dealer_id = $1 AND status = $2 ORDER BY hire_date DESC',
      [dealerId, status],
    );
    return result.rows;
  },

  create: async (employeeData: {
    dealer_id: UUID;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    aadhar: string;
    position: string;
    hire_date: string;
  }): Promise<Employee> => {
    const result = await query(
      `INSERT INTO employees (dealer_id, first_name, last_name, phone, email, aadhar, position, hire_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        employeeData.dealer_id,
        employeeData.first_name,
        employeeData.last_name,
        employeeData.phone,
        employeeData.email,
        employeeData.aadhar,
        employeeData.position,
        employeeData.hire_date,
      ],
    );
    return result.rows[0];
  },

  update: async (
    id: UUID,
    updates: Partial<Omit<Employee, 'id' | 'dealer_id' | 'created_at'>>,
  ): Promise<Employee> => {
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
      `UPDATE employees SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );

    return result.rows[0];
  },

  terminate: async (
    id: UUID,
    terminationDate: string,
    terminationReason: string,
  ): Promise<Employee> => {
    const result = await query(
      `UPDATE employees 
       SET status = 'terminated', 
           termination_date = $1, 
           termination_reason = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [terminationDate, terminationReason, id],
    );
    return result.rows[0];
  },

  delete: async (id: UUID): Promise<void> => {
    await query('DELETE FROM employees WHERE id = $1', [id]);
  },

  searchGlobal: async (searchTerm: string) => {
    const result = await query(
      `SELECT e.*, d.company_name as dealer_company_name
       FROM employees e
       JOIN dealers d ON e.dealer_id = d.id
       WHERE 
         LOWER(e.first_name || ' ' || e.last_name) LIKE LOWER($1) OR
         e.phone LIKE $1 OR
         e.aadhar LIKE $1 OR
         e.email LIKE LOWER($1)
       ORDER BY e.created_at DESC
       LIMIT 50`,
      [`%${searchTerm}%`],
    );
    return result.rows;
  },
};
