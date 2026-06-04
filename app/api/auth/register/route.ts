import { NextResponse } from 'next/server';
import { addAccount, findAccountByUsername } from '@/lib/accounts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, displayName, orgType } = body;

    if (!username || !password || !displayName) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin bắt buộc' }, { status: 400 });
    }

    if (username.length < 4) {
      return NextResponse.json({ error: 'Tên đăng nhập phải có ít nhất 4 ký tự' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 });
    }

    // Check if user exists
    const existing = await findAccountByUsername(username);
    if (existing) {
      return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại' }, { status: 400 });
    }

    // Create pending account
    const newAccount = await addAccount({
      username: username.toLowerCase().trim(),
      password,
      displayName: displayName.trim(),
      role: 'unit',
      status: 'pending',
      orgType: orgType || 'other',
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công. Tài khoản đang chờ Quản trị viên duyệt.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại sau.' }, { status: 500 });
  }
}
