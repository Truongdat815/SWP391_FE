import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AddCustomer() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect ngay lập tức đến trang customer-management với query param
    navigate('/dealer-staff/customer-management?add=new', { replace: true });
  }, [navigate]);

  return null; // Không render gì vì sẽ redirect
}

export default AddCustomer;
