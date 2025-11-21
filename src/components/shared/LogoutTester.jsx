import { useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import Button from '../ui/Button';
import Card from '../ui/Card';

const LogoutTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAppSelector((state) => state.auth.token);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';

  const addResult = (step, status, message, data = null) => {
    setTestResults(prev => [...prev, { 
      step, 
      status, 
      message, 
      data,
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testLogoutFlow = async () => {
    setTestResults([]);
    setIsLoading(true);

    try {
      // 1. Kiểm tra token
      if (!token) {
        addResult(1, 'error', 'Không tìm thấy access token. Vui lòng login trước.');
        setIsLoading(false);
        return;
      }
      addResult(1, 'success', `Token found: ${token.substring(0, 20)}...`);

      // 2. Test API call trước khi logout
      addResult(2, 'info', 'Testing API call with token (before logout)...');
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          addResult(2, 'success', `API call successful: ${data.data?.email || 'User data received'}`);
        } else {
          addResult(2, 'error', `API call failed: ${response.status} ${response.statusText}`);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        addResult(2, 'error', `API call error: ${error.message}`);
        setIsLoading(false);
        return;
      }

      // 3. Gọi logout API
      addResult(3, 'info', 'Calling logout API...');
      try {
        const logoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (logoutResponse.ok) {
          const logoutData = await logoutResponse.json();
          addResult(3, 'success', `Logout API successful: ${logoutData.message || 'Logged out'}`);
        } else {
          addResult(3, 'warning', `Logout API failed: ${logoutResponse.status} ${logoutResponse.statusText}`);
        }
      } catch (error) {
        addResult(3, 'warning', `Logout API error: ${error.message}`);
      }

      // 4. Test API call sau khi logout
      addResult(4, 'info', 'Testing API call with old token (after logout)...');
      try {
        const response2 = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response2.status === 401) {
          const errorData = await response2.json();
          addResult(4, 'success', `✅ Expected 401 Unauthorized - Token revoked! ${errorData.message || ''}`);
        } else if (response2.ok) {
          addResult(4, 'warning', '⚠️ Unexpected: API call still successful. Token might not be revoked.');
        } else {
          addResult(4, 'info', `API call failed with status ${response2.status} (not 401)`);
        }
      } catch (error) {
        addResult(4, 'error', `API call error: ${error.message}`);
      }

      addResult(5, 'success', '🏁 Test completed!');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  if (!token) {
    return (
      <Card className="p-4">
        <p className="text-gray-600">Vui lòng login để test logout flow.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🧪 Logout Flow Tester</h3>
        <p className="text-sm text-gray-600 mb-4">
          Test để kiểm tra xem logout có revoke token trên server không.
        </p>
        
        <Button 
          onClick={testLogoutFlow} 
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? 'Testing...' : 'Run Logout Test'}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Test Results:</h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border text-sm ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-2">
                  <span>{getStatusIcon(result.status)}</span>
                  <div className="flex-1">
                    <div className="font-medium">Step {result.step}: {result.message}</div>
                    <div className="text-xs opacity-75 mt-1">{result.timestamp}</div>
                    {result.data && (
                      <pre className="text-xs mt-2 p-2 bg-black bg-opacity-10 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <strong>Expected Flow:</strong>
        <ol className="list-decimal list-inside mt-1 space-y-1">
          <li>✅ Token found</li>
          <li>✅ API call successful (before logout)</li>
          <li>✅ Logout API successful</li>
          <li>✅ API call returns 401 (after logout)</li>
        </ol>
      </div>
    </Card>
  );
};

export default LogoutTester;

