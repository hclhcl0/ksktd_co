import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateAccountPassword, findAccountByUsername } from '@/lib/accounts';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();
    const { action } = body;

    if (action === 'change') {
      const { oldPassword, newPassword } = body;
      if (!oldPassword || !newPassword) {
        return NextResponse.json({ error: 'Thiếu thông tin mật khẩu' }, { status: 400 });
      }

      // Find user to verify old password
      const account = await findAccountByUsername(user.name || '');
      if (!account) {
        return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });
      }

      if (account.password !== oldPassword) {
        return NextResponse.json({ error: 'Mật khẩu cũ không chính xác' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' }, { status: 400 });
      }

      await updateAccountPassword(account.username, newPassword);
      return NextResponse.json({ message: 'Đổi mật khẩu thành công' });
    } 
    
    if (action === 'reset') {
      // Only admin can reset
      const account = await findAccountByUsername(user.name || '');
      if (account?.role !== 'admin' && account?.role !== 'admin_cdc') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { targetUsername } = body;
      if (!targetUsername) {
        return NextResponse.json({ error: 'Thiếu tên tài khoản' }, { status: 400 });
      }

      const targetAccount = await findAccountByUsername(targetUsername);
      if (!targetAccount) {
        return NextResponse.json({ error: 'Không tìm thấy tài khoản cần reset' }, { status: 404 });
      }

      await updateAccountPassword(targetAccount.username, '118ldl');
      return NextResponse.json({ message: 'Khôi phục mật khẩu thành công' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Password API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
