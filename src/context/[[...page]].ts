import { NextRequest, NextResponse } from 'next/server';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());

app.post('/api/verify', (req, res) => {
  const { code } = req.body;

  if (code.length !== 6 || !/^\d+$/.test(code)) {
    return res.status(400).json({ message: 'Invalid code format' });
  }

  if (code[5] === '7') {
    return res.status(400).json({ message: 'Verification failed' });
  }

  res.status(200).json({ message: 'Verification successful' });
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  return new Promise((resolve, reject) => {
    const expressReq = {
      body,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      url: request.url,
    } as unknown as express.Request;

    const expressRes = {
      status: (statusCode: number) => ({
        json: (data) => resolve(NextResponse.json(data, { status: statusCode })),
      }),
    } as express.Response;

    app(expressReq, expressRes, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
    });
  });
}