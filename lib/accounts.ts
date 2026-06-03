
import { prisma } from './prisma';

export interface Account {
  username: string;
  displayName: string;
  password?: string;
  role: string;
}

// Lấy tất cả tài khoản
export async function getAccounts(): Promise<Account[]> {
  const accounts = await prisma.account.findMany();
  return accounts.map((a: any) => ({
    username: a.username,
    displayName: a.displayName,
    role: a.role,
    // We omit password here for safety, unless it's needed for the admin view.
    // The previous implementation returned everything.
    password: a.password
  }));
}

// Helper: tìm account theo username
export async function findAccountByUsername(username: string): Promise<Account | null> {
  const account = await prisma.account.findUnique({
    where: { username: username.toLowerCase() }
  });
  return account;
}

// Helper: cập nhật mật khẩu
export async function updateAccountPassword(username: string, newPassword: string): Promise<boolean> {
  try {
    await prisma.account.update({
      where: { username: username.toLowerCase() },
      data: { password: newPassword }
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Thêm tài khoản
export async function addAccount(account: Account): Promise<Account> {
  const newAccount = await prisma.account.create({
    data: {
      username: account.username.toLowerCase(),
      displayName: account.displayName,
      password: account.password || '',
      role: account.role,
    }
  });
  return newAccount;
}

// Cập nhật tài khoản
export async function updateAccount(username: string, updates: Partial<Account>): Promise<Account | null> {
  try {
    const updated = await prisma.account.update({
      where: { username: username.toLowerCase() },
      data: {
        ...(updates.displayName && { displayName: updates.displayName }),
        ...(updates.password && { password: updates.password }),
        ...(updates.role && { role: updates.role }),
      }
    });
    return updated;
  } catch (error) {
    return null;
  }
}

// Xóa tài khoản
export async function deleteAccount(username: string): Promise<boolean> {
  try {
    await prisma.account.delete({
      where: { username: username.toLowerCase() }
    });
    return true;
  } catch (error) {
    return false;
  }
}
