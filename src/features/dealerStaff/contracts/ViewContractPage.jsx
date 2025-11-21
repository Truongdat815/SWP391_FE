import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, Upload, FileText, X } from 'lucide-react';
import { useGetContractDetailQuery, useUploadSignedContractMutation } from '../../../api/dealerStaff/contractApi';
import { getAuthFromStorage, getRoleFromPath } from '../../../utils/roleUtils';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';

const ViewContractPage = () => {
  const { contractId } = useParams();
  const toast = useToast();
  const [uploadFile, setUploadFile] = useState(null);
  const [showSignedImage, setShowSignedImage] = useState(false);
  const [isLoadingHtml, setIsLoadingHtml] = useState(false);

  // Only fetch contract detail, not HTML (HTML will be fetched when clicking "Xem hợp đồng")
  const { data: contractDetailData, isLoading: isLoadingDetail, refetch: refetchContractDetail } = useGetContractDetailQuery(contractId, {
    skip: !contractId,
  });

  const [uploadSignedContract, { isLoading: isUploading }] = useUploadSignedContractMutation();

  const contractDetail = contractDetailData?.data || contractDetailData;
  // Check both contractFileUrl and signedContractFileUrl for compatibility
  const signedContractFileUrl = contractDetail?.contractFileUrl || contractDetail?.signedContractFileUrl;
  const hasSignedContract = signedContractFileUrl && 
                            typeof signedContractFileUrl === 'string' && 
                            signedContractFileUrl.trim().length > 0;
  const signedContractUrl = signedContractFileUrl;

  const handleViewContract = async () => {
    if (hasSignedContract) {
      // If has signed contract, show the signed image
      setShowSignedImage(true);
    } else {
      // Call API GET /contracts/{id} and open in new tab
      setIsLoadingHtml(true);
      try {
        // Get API base URL
        const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
        const apiUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        
        // Get auth token
        const currentPath = window.location.pathname;
        const roleFromPath = getRoleFromPath(currentPath);
        let token = null;
        
        if (roleFromPath) {
          const authData = getAuthFromStorage(roleFromPath);
          token = authData?.token;
        }
        
        // Fetch contract HTML using /contracts/contracts?contractId={contractId}
        const response = await fetch(`${apiUrl}/contracts/contracts?contractId=${contractId}`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch contract');
        }
        
        const htmlContent = await response.text();
        
        // Create blob URL and open in new tab
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        
        // Clean up blob URL after window opens
        if (newWindow) {
          newWindow.onload = () => {
            setTimeout(() => URL.revokeObjectURL(url), 100);
          };
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Error fetching contract HTML:', error);
        toast.error('Không thể tải hợp đồng');
      } finally {
        setIsLoadingHtml(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF or images)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Chỉ chấp nhận file PDF hoặc hình ảnh (JPG, PNG)');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 10MB');
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUploadContract = async () => {
    if (!uploadFile) {
      toast.error('Vui lòng chọn file');
      return;
    }

    try {
      await uploadSignedContract({
        contractId: contractId,
        file: uploadFile,
      }).unwrap();
      
      toast.success('Đã upload hợp đồng thành công!');
      setUploadFile(null);
      // Refetch contract detail to get the new signed contract URL
      await refetchContractDetail();
      // Show the signed image
      setShowSignedImage(true);
    } catch (error) {
      console.error('Error uploading contract:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi upload hợp đồng');
    }
  };

  if (isLoadingDetail) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSkeleton className="w-20 h-20 mx-auto mb-4" variant="circle" />
            <p className="text-slate-600">Đang tải thông tin hợp đồng...</p>
          </div>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with buttons */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-slate-900 text-3xl font-bold leading-tight">
              Hợp đồng #{contractId}
            </h1>
            <p className="text-slate-500 text-base font-normal leading-normal mt-1">
              {contractDetail?.contractCode || `HD-${contractId}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleViewContract}
              disabled={isLoadingHtml}
              className="flex items-center gap-2"
            >
              <Eye size={20} />
              <span>
                {isLoadingHtml 
                  ? 'Đang tải...'
                  : hasSignedContract 
                  ? 'Xem hợp đồng đã ký'
                  : 'Xem hợp đồng'
                }
              </span>
            </Button>
            {!hasSignedContract && (
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="contract-upload"
                />
                <label
                  htmlFor="contract-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <Upload size={20} />
                  <span>Upload hợp đồng đã ký</span>
                </label>
                {uploadFile && (
                  <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-lg shadow-lg p-4 min-w-[300px] z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">File đã chọn:</span>
                      <button
                        onClick={() => setUploadFile(null)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{uploadFile.name}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUploadContract}
                        disabled={isUploading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isUploading ? 'Đang upload...' : 'Xác nhận upload'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contract Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {showSignedImage && hasSignedContract ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Hợp đồng đã ký</h2>
                <button
                  onClick={() => setShowSignedImage(false)}
                  className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex justify-center bg-slate-50 rounded-lg p-4">
                <img
                  src={signedContractUrl}
                  alt="Hợp đồng đã ký"
                  className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 mb-2">Nhấn "Xem hợp đồng" để xem hợp đồng trong tab mới</p>
                {contractDetail && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold">Mã hợp đồng:</span> {contractDetail.contractCode || `HD-${contractId}`}
                    </p>
                    {contractDetail.customerName && (
                      <p className="text-sm text-slate-600 mt-1">
                        <span className="font-semibold">Khách hàng:</span> {contractDetail.customerName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DealerStaffLayout>
  );
};

export default ViewContractPage;

