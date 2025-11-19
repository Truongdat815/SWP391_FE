import { baseApi } from '../baseApi';

export const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo hợp đồng nháp
    createContract: builder.mutation({
      query: (contractData) => ({
        url: '/contracts/contracts',
        method: 'POST',
        body: contractData,
      }),
      invalidatesTags: ['Contract'],
    }),
    // Xem hợp đồng (HTML)
    getContract: builder.query({
      query: (id) => `/contracts/${id}`,
      providesTags: ['Contract'],
    }),
    // Upload hợp đồng đã ký
    uploadSignedContract: builder.mutation({
      query: ({ contractId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/contracts/${contractId}/upload-signed`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Contract'],
    }),
    // Lấy tất cả contracts
    getAllContracts: builder.query({
      query: () => '/contracts/all',
      providesTags: ['Contract'],
    }),
    // Lấy chi tiết contract
    getContractDetail: builder.query({
      query: (id) => `/contracts/detail/${id}`,
      providesTags: ['Contract'],
    }),
    // Lấy danh sách trạng thái contract
    getContractStatuses: builder.query({
      query: () => '/contracts/status',
      providesTags: ['Contract'],
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetContractQuery,
  useUploadSignedContractMutation,
  useGetAllContractsQuery,
  useGetContractDetailQuery,
  useGetContractStatusesQuery,
} = contractApi;

