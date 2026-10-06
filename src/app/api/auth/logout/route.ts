import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });

  // Clear cookie
  response.cookies.set({
    name: 'threadly_token',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
