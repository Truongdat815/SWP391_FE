import { useState, useMemo } from 'react';
import { Plus, Edit, CreditCard, Search, CheckCircle, Loader2 } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import { useToast } from '../../../components/ui/Toast';
import {
    useGetAllCompanyBankAccountsQuery,
    useCreateCompanyBankAccountMutation,
    useUpdateCompanyBankAccountMutation,
} from '../../../api/admin/companyBankAccountApi';
import { useGetAllBanksQuery, useLookupAccountMutation } from '../../../api/public/bankApi';

const CompanyBankAccountPage = () => {
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const { data: accountsResponse, isLoading, error, refetch } = useGetAllCompanyBankAccountsQuery();
    const { data: banksResponse } = useGetAllBanksQuery();
    const [lookupAccount, { isLoading: isLookingUp }] = useLookupAccountMutation();
    const [createAccount, { isLoading: isCreating }] = useCreateCompanyBankAccountMutation();
    const [updateAccount, { isLoading: isUpdating }] = useUpdateCompanyBankAccountMutation();

    const accounts = accountsResponse?.data || [];
    const banks = banksResponse?.data || [];

    const bankOptions = useMemo(() => {
        return banks.map(bank => ({
            value: bank.code, // Use code for BankLookup.net
            label: `${bank.short_name} - ${bank.name}`,
        }));
    }, [banks]);

    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        isActive: true,
    });

    const filteredAccounts = useMemo(() => {
        return accounts.filter((account) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                account.bankName?.toLowerCase().includes(searchLower) ||
                account.accountNumber?.includes(searchTerm) ||
                account.accountHolderName?.toLowerCase().includes(searchLower)
            );
        });
    }, [accounts, searchTerm]);

    const handleOpenModal = (account = null) => {
        if (account) {
            setSelectedAccount(account);
            setFormData({
                bankName: account.bankName,
                accountNumber: account.accountNumber,
                accountHolderName: account.accountHolderName,
                isActive: account.isActive,
            });
        } else {
            setSelectedAccount(null);
            setFormData({
                bankName: '',
                accountNumber: '',
                accountHolderName: '',
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAccount(null);
        setFormData({
            bankName: '',
            accountNumber: '',
            accountHolderName: '',
            isActive: true,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedAccount) {
                await updateAccount({
                    accountId: selectedAccount.accountId,
                    ...formData,
                }).unwrap();
                toast.success('Cập nhật tài khoản thành công');
            } else {
                await createAccount(formData).unwrap();
                toast.success('Tạo tài khoản thành công');
            }
            refetch();
            handleCloseModal();
        } catch (error) {
            toast.error(error?.data?.message || 'Có lỗi xảy ra');
            console.error(error);
        }
    };

    const handleLookupAccount = async () => {
        if (!formData.bankName || !formData.accountNumber) {
            return;
        }

        console.log('Looking up account:', { bank: formData.bankName, account: formData.accountNumber });

        try {
            const response = await lookupAccount({
                bank: formData.bankName,
                account: formData.accountNumber.replace(/[^0-9]/g, ''),
            }).unwrap();

            console.log('Lookup response:', response);

            if (response?.success && response?.data?.ownerName) {
                setFormData(prev => ({
                    ...prev,
                    accountHolderName: response.data.ownerName
                }));
                toast.success('Đã tìm thấy tên chủ tài khoản');
            } else {
                toast.error(response?.msg || 'Không tìm thấy thông tin tài khoản');
            }
        } catch (error) {
            console.error('Lookup error:', error);
            toast.error('Không thể tra cứu thông tin tài khoản. Vui lòng kiểm tra lại.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('vi-VN');
        } catch {
            return 'N/A';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài khoản Công ty</h1>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus size={20} className="mr-2" />
                        Thêm Tài khoản
                    </Button>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên ngân hàng, số tài khoản, tên chủ tài khoản..."
                        className="flex-1 outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Đang tải...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">
                            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
                        </div>
                    ) : filteredAccounts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
                    ) : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.Head>Ngân hàng</Table.Head>
                                    <Table.Head>Số tài khoản</Table.Head>
                                    <Table.Head>Chủ tài khoản</Table.Head>
                                    <Table.Head>Trạng thái</Table.Head>
                                    <Table.Head>Ngày tạo</Table.Head>
                                    <Table.Head className="text-center">Hành động</Table.Head>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {filteredAccounts.map((account) => (
                                    <Table.Row key={account.accountId}>
                                        <Table.Cell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={16} className="text-gray-400" />
                                                {account.bankName}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>{account.accountNumber}</Table.Cell>
                                        <Table.Cell>{account.accountHolderName}</Table.Cell>
                                        <Table.Cell>
                                            <Badge variant={account.isActive ? 'success' : 'error'}>
                                                {account.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>{formatDate(account.createdAt)}</Table.Cell>
                                        <Table.Cell className="text-center">
                                            <button
                                                onClick={() => handleOpenModal(account)}
                                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedAccount ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Tên ngân hàng <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            options={bankOptions}
                            value={formData.bankName}
                            onChange={(value) => {
                                setFormData(prev => {
                                    const newData = { ...prev, bankName: value };
                                    // Trigger lookup if account number exists
                                    if (newData.accountNumber) {
                                        // We need to use a timeout or useEffect to call handleLookupAccount with new state
                                        // But since handleLookupAccount reads from state, we can't call it immediately here with old state
                                        // So we pass the new value explicitly or use a different approach.
                                        // Actually, let's just update state here. The user can trigger lookup by clicking button or blurring account input.
                                        // Or better, we can define a helper that takes args.
                                        return newData;
                                    }
                                    return newData;
                                });
                            }}
                            placeholder="Chọn ngân hàng"
                            className="w-full"
                        />
                    </div>
                    <div className="relative">
                        <Input
                            label="Số tài khoản"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            onBlur={handleLookupAccount}
                            required
                            placeholder="Ví dụ: 0123456789"
                        />
                        <button
                            type="button"
                            onClick={handleLookupAccount}
                            disabled={isLookingUp || !formData.bankName || !formData.accountNumber}
                            className="absolute right-2 top-8 p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Kiểm tra tên chủ tài khoản"
                        >
                            {isLookingUp ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <CheckCircle size={20} />
                            )}
                        </button>
                    </div>
                    <Input
                        label="Tên chủ tài khoản"
                        value={formData.accountHolderName}
                        onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                        required
                        placeholder="Ví dụ: NGUYEN VAN A"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Kích hoạt
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isCreating || isUpdating}>
                            {isCreating || isUpdating ? 'Đang xử lý...' : (selectedAccount ? 'Cập nhật' : 'Tạo mới')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default CompanyBankAccountPage;
