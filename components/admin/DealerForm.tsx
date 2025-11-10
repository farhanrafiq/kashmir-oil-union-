import React, { useState, useEffect } from 'react';
import { Dealer } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';

interface DealerFormProps {
  dealer: Dealer | null;
  onSave: (data: Omit<Dealer, 'id' | 'status' | 'created_at' | 'user_id'> & { username: string }) => Promise<void>;
  onCancel: () => void;
  formError: string | null;
}

const DealerForm: React.FC<DealerFormProps> = ({ dealer, onSave, onCancel, formError }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    address: '',
    username: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dealer) {
        setFormData({
            company_name: dealer.company_name,
            primary_contact_name: dealer.primary_contact_name,
            primary_contact_email: dealer.primary_contact_email,
            primary_contact_phone: dealer.primary_contact_phone,
            address: dealer.address,
            username: dealer.primary_contact_email.split('@')[0], // Default username from email
        });
    } else {
        setFormData({
            company_name: '',
            primary_contact_name: '',
            primary_contact_email: '',
            primary_contact_phone: '',
            address: '',
            username: '',
        });
    }
  }, [dealer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'primary_contact_phone') {
        const sanitizedValue = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await onSave(formData);
    } catch (e) {
        // Parent component handles showing the error.
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Company Name"
        name="company_name"
        value={formData.company_name}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />
      <Input
        label="Contact Name"
        name="primary_contact_name"
        value={formData.primary_contact_name}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />
      <Input
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
        disabled={isSubmitting || !!dealer} // Cannot change username after creation
      />
      <Input
        label="Contact Email (will be used for login)"
        name="primary_contact_email"
        type="email"
        value={formData.primary_contact_email}
        onChange={handleChange}
        required
        disabled={isSubmitting || !!dealer} // Cannot change email after creation
      />
      <Input
        label="Contact Phone"
        name="primary_contact_phone"
        type="tel"
        value={formData.primary_contact_phone}
        onChange={handleChange}
        required
        maxLength={10}
        disabled={isSubmitting}
      />
      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />

      {formError && <p className="text-sm text-red-600">{formError}</p>}
      
      <div className="flex justify-end pt-4 gap-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (dealer ? 'Save Changes' : 'Create Dealer')}
        </Button>
      </div>
    </form>
  );
};

export default DealerForm;