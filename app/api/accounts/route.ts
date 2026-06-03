import { NextResponse } from 'next/server';
import { getAccounts, addAccount, updateAccount, deleteAccount, findAccountByUsername } from '@/lib/accounts';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const safeAccounts = (await getAccounts()).map(a => ({
      username: a.username,
      displayName: a.displayName,
      password: a.password,
      role: a.role
    }));

    return NextResponse.json(safeAccounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { username, displayName, password, role: accountRole } = body;

    if (!username || !displayName || !password || !accountRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (await findAccountByUsername(username)) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const newAcc = await addAccount({
      username: username.toLowerCase(),
      displayName,
      password,
      role: accountRole
    });

    return NextResponse.json({ success: true, account: { username: newAcc.username, displayName: newAcc.displayName, role: newAcc.role } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { username, displayName, password, role: accountRole } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const updates: any = {};
    if (displayName) updates.displayName = displayName;
    if (password) updates.password = password; // Only update if provided
    if (accountRole) updates.role = accountRole;

    const updated = await updateAccount(username, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, account: { username: updated.username, displayName: updated.displayName, role: updated.role } });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (username === 'admin') {
      return NextResponse.json({ error: 'Cannot delete super admin account' }, { status: 400 });
    }

    const success = await deleteAccount(username);
    if (!success) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
