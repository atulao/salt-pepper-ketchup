import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  // Path to the JSON file
  const filePath = path.join(process.cwd(), 'scripts', 'njit_degrees.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const majors = JSON.parse(data);
    return NextResponse.json(majors);
  } catch (error) {
    return NextResponse.json({ error: 'Could not load majors' }, { status: 500 });
  }
} 