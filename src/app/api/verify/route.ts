import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (code.length !== 6 || !/^\d+$/.test(code)) {
    return NextResponse.json(
      { message: 'Invalid code format' },
      { status: 400 }
    );
  }

  if (code[5] === '7') {
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: 'Verification successful' },
    { status: 200 }
  );
}

