import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { login, logout } from '@/services/auth.service';
import queryClient from '@/lib/queryClient';

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Login mutation.
 * On success, the JWT is stored inside auth.service.js and the caller
 * can redirect the user programmatically via the returned `onSuccess`.
 *
 * Usage:
 * const { mutate: signIn, isPending } = useLogin();
 * signIn({ email, password }, { onSuccess: () => navigate('/') });
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};

/**
 * Logout helper.
 * Clears the token, resets the entire query cache (removes all cached
 * server data), and navigates to /login.
 *
 * Usage:
 * const handleLogout = useLogout();
 * handleLogout();
 */
export const useLogout = () => {
  const navigate = useNavigate();

  return () => {
    logout();
    // Clear all cached queries so the next user starts with a clean slate.
    queryClient.clear();
    navigate('/login');
  };
};
