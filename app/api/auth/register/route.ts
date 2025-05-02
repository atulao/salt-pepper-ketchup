import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;
    
    // Basic validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password, // WARNING: In production, this should be hashed!
        name: name || email.split('@')[0], // Use part of email as name if not provided
        emailVerified: null,
      },
    });
    
    // Remove sensitive data before returning
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: userWithoutPassword 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to create user', error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 