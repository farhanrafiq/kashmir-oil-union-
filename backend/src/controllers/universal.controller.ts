import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { employeeModel } from '../models/employee.model';
import { customerModel } from '../models/customer.model';
import { UserRole } from '../types';

export const universalController = {
  // Universal Search - Search across employees and customers
  universalSearch: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { q: searchQuery } = req.query as { q?: string };
      const dealerId = req.user!.role === UserRole.DEALER ? req.user!.dealerId : undefined;

      if (!searchQuery || typeof searchQuery !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      // Get all results and filter by dealer if needed
      const allEmployees = await employeeModel.searchGlobal(searchQuery);
      const allCustomers = await customerModel.searchGlobal(searchQuery);

      // Filter by dealer if user is a dealer
      const employees = dealerId
        ? allEmployees.filter((emp: any) => emp.dealer_id === dealerId)
        : allEmployees;
      const customers = dealerId
        ? allCustomers.filter((cust: any) => cust.dealer_id === dealerId)
        : allCustomers;

      // Combine results
      const results = [
        ...employees.map((emp: any) => ({
          id: emp.id,
          type: 'employee' as const,
          name: `${emp.first_name} ${emp.last_name}`,
          email: emp.email,
          phone: emp.phone,
          status: emp.status,
          dealer_id: emp.dealer_id,
          additional: {
            aadhar: emp.aadhar,
            position: emp.position,
            hire_date: emp.hire_date,
          },
        })),
        ...customers.map((cust: any) => ({
          id: cust.id,
          type: 'customer' as const,
          name: cust.name_or_entity,
          email: cust.email,
          phone: cust.phone,
          status: cust.status,
          dealer_id: cust.dealer_id,
          additional: {
            customer_type: cust.type,
            official_id: cust.official_id,
            contact_person: cust.contact_person,
          },
        })),
      ];

      res.json({
        success: true,
        data: { results },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to perform search',
      });
    }
  },

  // Check if Aadhar exists - Returns employee info if found
  checkAadhar: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { aadhar } = req.query as { aadhar?: string };

      if (!aadhar || typeof aadhar !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Aadhar number is required',
        });
        return;
      }

      // Only check active employees
      const employee = await employeeModel.findByAadhar(aadhar);

      if (!employee || employee.status !== 'active') {
        res.json({
          success: true,
          data: null,
        });
        return;
      }

      // Return employee info
      res.json({
        success: true,
        data: {
          id: employee.id,
          type: 'employee',
          name: `${employee.first_name} ${employee.last_name}`,
          email: employee.email,
          phone: employee.phone,
          status: employee.status,
          dealer_id: employee.dealer_id,
          aadhar: employee.aadhar,
          position: employee.position,
          hire_date: employee.hire_date,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check aadhar',
      });
    }
  },
};
