import { baseApi } from '../baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ─────────── LOGIN ───────────
    login: build.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    // ─────────── REFRESH TOKEN ───────────
    refreshToken: build.mutation({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    // ─────────── GET CURRENT USER ───────────
    getMe: build.query({
      query: () => '/users/me',
    }),
    // ─────────── CHANGE PASSWORD ───────────
    changePassword: build.mutation({
      query: (passwords) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwords,
      }),
    }),
    // ─────────── LOGOUT ───────────
    logout: build.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useChangePasswordMutation,
  useLogoutMutation,
} = authApi;
