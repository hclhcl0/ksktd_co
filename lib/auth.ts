// lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { findAccountByUsername } from '@/lib/accounts';
import { authConfig } from '@/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Đăng nhập',
      credentials: {
        username: { label: 'Tên đăng nhập', type: 'text' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;

        const account = await findAccountByUsername(username);
        if (!account) return null;

        // So sánh trực tiếp (plaintext) vì mật khẩu mặc định đơn giản
        // Khi nâng cấp: dùng bcrypt.compare(password, account.hashedPassword)
        if (password !== account.password) return null;

        if (account.status && account.status !== 'approved') {
          throw new Error(account.status === 'pending' ? 'Tài khoản đang chờ duyệt' : 'Tài khoản đã bị từ chối');
        }

        return {
          id: account.username,
          name: account.displayName,
          email: account.username + '@cdcdanang.vn',
          role: account.role,
          username: account.username,
        };
      },
    }),
  ],
});
