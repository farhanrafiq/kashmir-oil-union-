import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { employeeModel } from '../models/employee.model';
import { customerModel } from '../models/customer.model';
import { auditLogModel } from '../models/auditLog.model';
import { dealerModel } from '../models/dealer.model';
import { AuditActionType } from '../types';

export const dealerController = {
  // Get dealer's own profile
  getProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dealerId = req.user!.dealerId;

      if (!dealerId) {
        res.status(404).json({
          success: false,
          error: 'Dealer profile not found',
        });
        return;
      }

      const dealer = await dealerModel.getWithUserDetails(dealerId);

      res.json({
        success: true,
        data: { dealer },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dealer profile',
      });
    }
  },

  // Get all employees for dealer
  getEmployees: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dealerId = req.user!.dealerId!;

      const employees = await employeeModel.findByDealerId(dealerId);

      res.json({
        success: true,
        data: { employees },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch employees',
      });
    }
  },

  // Create employee
  createEmployee: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dealerId = req.user!.dealerId!;
      const { first_name, last_name, phone, email, aadhar, position, hire_date } = req.body;

      // Check if aadhar already exists
      const existingEmployee = await employeeModel.findByAadhar(aadhar);
      if (existingEmployee) {
        res.status(400).json({
          success: false,
          error: 'Employee with this Aadhar number already exists',
        });
        return;
      }

      const employee = await employeeModel.create({
        dealer_id: dealerId,
        first_name,
        last_name,
        phone,
        email,
        aadhar,
        position,
        hire_date,
      });

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        dealer_id: dealerId,
        action_type: AuditActionType.CREATE_EMPLOYEE,
        details: `Created employee: ${first_name} ${last_name}`,
      });

      res.status(201).json({
        success: true,
        data: { employee },
        message: 'Employee created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create employee',
      });
    }
  },

  // Update employee
  updateEmployee: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dealerId = req.user!.dealerId!;
      const { first_name, last_name, phone, email, position } = req.body;

      const employee = await employeeModel.findById(id);

      if (!employee) {
        res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
        return;
      }

      // Verify employee belongs to dealer
      if (employee.dealer_id !== dealerId) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized to update this employee',
        });
        return;
      }

      const updatedEmployee = await employeeModel.update(id, {
        first_name,
        last_name,
        phone,
        email,
        position,
      });

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        dealer_id: dealerId,
        action_type: AuditActionType.UPDATE_EMPLOYEE,
        details: `Updated employee: ${first_name} ${last_name}`,
      });

      res.json({
        success: true,
        data: { employee: updatedEmployee },
        message: 'Employee updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update employee',
      });
    }
  },

  // Terminate employee
  terminateEmployee: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dealerId = req.user!.dealerId!;
      const { termination_date, termination_reason } = req.body;

      const employee = await employeeModel.findById(id);

      if (!employee) {
        res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
        return;
      }

      // Verify employee belongs to dealer
      if (employee.dealer_id !== dealerId) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized to terminate this employee',
        });
        return;
      }

      const terminatedEmployee = await employeeModel.terminate(
        id,
        termination_date,
        termination_reason,
      );

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        dealer_id: dealerId,
        action_type: AuditActionType.TERMINATE_EMPLOYEE,
        details: `Terminated employee: ${employee.first_name} ${employee.last_name}. Reason: ${termination_reason}`,
      });

      res.json({
        success: true,
        data: { employee: terminatedEmployee },
        message: 'Employee terminated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to terminate employee',
      });
    }
  },

  // Get all customers for dealer
  getCustomers: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dealerId = req.user!.dealerId!;

      const customers = await customerModel.findByDealerId(dealerId);

      res.json({
        success: true,
        data: { customers },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customers',
      });
    }
  },

  // Create customer
  createCustomer: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dealerId = req.user!.dealerId!;
      const {
        type,
        name_or_entity,
        contact_person,
        phone,
        email,
        official_id,
        address,
      } = req.body;

      const customer = await customerModel.create({
        dealer_id: dealerId,
        type,
        name_or_entity,
        contact_person,
        phone,
        email,
        official_id,
        address,
      });

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        dealer_id: dealerId,
        action_type: AuditActionType.CREATE_CUSTOMER,
        details: `Created customer: ${name_or_entity}`,
      });

      res.status(201).json({
        success: true,
        data: { customer },
        message: 'Customer created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create customer',
      });
    }
  },

  // Update customer
  updateCustomer: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dealerId = req.user!.dealerId!;
      const {
        type,
        name_or_entity,
        contact_person,
        phone,
        email,
        official_id,
        address,
        status,
      } = req.body;

      const customer = await customerModel.findById(id);

      if (!customer) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
        return;
      }

      // Verify customer belongs to dealer
      if (customer.dealer_id !== dealerId) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized to update this customer',
        });
        return;
      }

      const updatedCustomer = await customerModel.update(id, {
        type,
        name_or_entity,
        contact_person,
        phone,
        email,
        official_id,
        address,
        status,
      });

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        dealer_id: dealerId,
        action_type: AuditActionType.UPDATE_CUSTOMER,
        details: `Updated customer: ${name_or_entity}`,
      });

      res.json({
        success: true,
        data: { customer: updatedCustomer },
        message: 'Customer updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update customer',
      });
    }
  },

  // Universal search (employees and customers)
  // Get dealer's audit logs
  getDealerAuditLogs: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dealerId = req.user!.dealerId!;
      const limit = parseInt((req.query as any).limit as string) || 100;

      const logs = await auditLogModel.findByDealerId(dealerId, limit);

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

  universalSearch: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const [employees, customers] = await Promise.all([
        employeeModel.searchGlobal(query),
        customerModel.searchGlobal(query),
      ]);

      // Create audit log
      await auditLogModel.create({
        who_user_id: req.user!.userId,
        who_user_name: req.user!.email,
        dealer_id: req.user!.dealerId,
        action_type: AuditActionType.SEARCH,
        details: `Performed universal search: ${query}`,
      });

      res.json({
        success: true,
        data: {
          employees,
          customers,
          totalResults: employees.length + customers.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Search failed',
      });
    }
  },
};
