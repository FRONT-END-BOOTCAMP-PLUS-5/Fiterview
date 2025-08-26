import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'GET method not implemented' }, { status: 501 });
}
