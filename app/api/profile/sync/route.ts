import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// API route to sync the client-side profile with the database
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get profile data from request body
    const profileData = await req.json();
    
    // Validate profile data
    if (!profileData) {
      return NextResponse.json({ error: 'No profile data provided' }, { status: 400 });
    }
    
    // Find or create profile
    const profile = await prisma.profile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        bagel_type: profileData.bagel_type,
        major_name: profileData.major_name,
        college_name: profileData.college_name,
        substance_events: JSON.stringify(profileData.substance_events || []),
        substance_clubs: JSON.stringify(profileData.substance_clubs || []),
        substance_goals: JSON.stringify(profileData.substance_goals || []),
        onboarding_completed: profileData.onboarding_completed,
        dashboard_tour_completed: profileData.dashboard_tour_completed,
      },
      create: {
        userId: session.user.id,
        bagel_type: profileData.bagel_type,
        major_name: profileData.major_name,
        college_name: profileData.college_name,
        substance_events: JSON.stringify(profileData.substance_events || []),
        substance_clubs: JSON.stringify(profileData.substance_clubs || []),
        substance_goals: JSON.stringify(profileData.substance_goals || []),
        onboarding_completed: profileData.onboarding_completed,
        dashboard_tour_completed: profileData.dashboard_tour_completed,
      },
    });
    
    return NextResponse.json({ 
      message: 'Profile synced successfully',
      profile 
    });
    
  } catch (error) {
    console.error('Profile sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync profile' },
      { status: 500 }
    );
  }
}

// API route to get the current user's profile from the database
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    
    if (!profile) {
      return NextResponse.json({ 
        message: 'Profile not found',
        profile: null
      });
    }
    
    // Parse JSON strings back to arrays
    const formattedProfile = {
      ...profile,
      substance_events: profile.substance_events ? JSON.parse(profile.substance_events) : [],
      substance_clubs: profile.substance_clubs ? JSON.parse(profile.substance_clubs) : [],
      substance_goals: profile.substance_goals ? JSON.parse(profile.substance_goals) : [],
    };
    
    return NextResponse.json({ profile: formattedProfile });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
} 