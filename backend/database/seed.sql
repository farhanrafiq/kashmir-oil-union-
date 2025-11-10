-- Seed data for Kashmir Oil Union Database

-- Insert Admin User (password: admin123)
INSERT INTO users (id, role, name, username, email, password_hash, temp_pass)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin',
    'System Administrator',
    'admin',
    'admin@kashmiroil.com',
    '$2b$10$rWGvK8YvH8BvKqQXqQWy3.KJ0i9vz/8Jvu8lB.3s6WZwEXvUKSLki', -- hashed: admin123
    false
);

-- Insert Sample Dealer User (password: dealer123)
INSERT INTO users (id, role, name, username, email, password_hash, temp_pass, dealer_id)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'dealer',
    'Kashmir Petroleum Depot',
    'kpd_dealer',
    'dealer@kashmirpetroleum.com',
    '$2b$10$x8NU.mzYm4HVlvP1pKK6Ue7XJ7e7XJ7e7XJ7e7XJ7e7XJ7e7XJ7e', -- hashed: dealer123
    false,
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'
);

-- Insert Sample Dealer
INSERT INTO dealers (id, user_id, company_name, primary_contact_name, primary_contact_phone, primary_contact_email, address, status)
VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Kashmir Petroleum Depot',
    'Ravi Kumar',
    '+91-9876543210',
    'dealer@kashmirpetroleum.com',
    '123 Main Street, Srinagar, Jammu & Kashmir 190001',
    'active'
);

-- Update dealer_id in user record
UPDATE users 
SET dealer_id = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'
WHERE id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

-- Insert Sample Employees
INSERT INTO employees (dealer_id, first_name, last_name, phone, email, aadhar, position, hire_date, status)
VALUES 
    (
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'Arjun',
        'Singh',
        '+91-9876543211',
        'arjun.singh@example.com',
        '123456789012',
        'Sales Manager',
        '2023-01-15',
        'active'
    ),
    (
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'Priya',
        'Sharma',
        '+91-9876543212',
        'priya.sharma@example.com',
        '234567890123',
        'Accountant',
        '2023-03-20',
        'active'
    );

-- Insert Sample Customers
INSERT INTO customers (dealer_id, type, name_or_entity, contact_person, phone, email, official_id, address, status)
VALUES 
    (
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'government',
        'Municipal Corporation of Srinagar',
        'Amit Verma',
        '+91-9876543213',
        'amit.verma@srinagarmunicipal.gov',
        'GST123456789',
        '456 Government Complex, Srinagar, J&K 190002',
        'active'
    ),
    (
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'private',
        'Valley Transport Services',
        'Neha Kapoor',
        '+91-9876543214',
        'neha@valleytransport.com',
        'PAN987654321',
        '789 Transport Nagar, Srinagar, J&K 190003',
        'active'
    );
