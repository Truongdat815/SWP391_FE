import { useNavigate } from 'react-router-dom';
import CustomerManagement from './CustomerManagement';

function AddCustomer() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleSuccess = () => {
    // Customer was added successfully
    console.log('Customer added successfully');
  };

  return (
    <CustomerManagement 
      mode="add-only" 
      onBack={handleBack} 
      onSuccess={handleSuccess} 
    />
  );
}

export default AddCustomer;
