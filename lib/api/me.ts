import { apiFetch } from '@/lib/api';
import type { ApiDashboard } from '@/app/profile/api.types';

export function fetchDashboard() {
  return apiFetch<ApiDashboard>('/me/dashboard');
}
