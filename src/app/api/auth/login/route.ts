import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comparePassword, signJwtToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim()) as any;

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
    }

    const isValid = comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signJwtToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    }, { status: 200 });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'threadly_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
