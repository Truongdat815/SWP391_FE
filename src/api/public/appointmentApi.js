import { baseApi } from '../baseApi';

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: '/appointments/create',
        method: 'POST',
        body: appointmentData,
      }),
      invalidatesTags: ['TestDrive'],
    }),
    getAppointmentById: builder.query({
      query: (id) => `/appointments/${id}`,
      providesTags: ['TestDrive'],
    }),
    getAllAppointments: builder.query({
      query: () => '/appointments/all',
      providesTags: ['TestDrive'],
    }),
    getAppointmentsByCustomer: builder.query({
      query: (customerId) => `/appointments/customer/${customerId}`,
      providesTags: ['TestDrive'],
    }),
    getAppointmentsByStaff: builder.query({
      query: (staffId) => `/appointments/staff/${staffId}`,
      providesTags: ['TestDrive'],
    }),
    deleteAppointment: builder.mutation({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TestDrive'],
    }),
    updateAppointment: builder.mutation({
      query: ({ id, ...appointmentData }) => ({
        url: `/appointments/update/${id}`,
        method: 'PUT',
        body: appointmentData,
      }),
      invalidatesTags: ['TestDrive'],
    }),
    updateAppointmentStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/appointments/${id}/status`,
        method: 'PATCH',
        params: { status },
      }),
      invalidatesTags: ['TestDrive'],
    }),
    getAppointmentStatuses: builder.query({
      query: () => '/appointments/status',
      providesTags: ['TestDrive'],
    }),
  }),
});

export const {
  useCreateAppointmentMutation,
  useGetAppointmentByIdQuery,
  useGetAllAppointmentsQuery,
  useGetAppointmentsByCustomerQuery,
  useGetAppointmentsByStaffQuery,
  useDeleteAppointmentMutation,
  useUpdateAppointmentMutation,
  useUpdateAppointmentStatusMutation,
  useGetAppointmentStatusesQuery,
} = appointmentApi;

