import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // TODO: Replace with actual backend API call
    // For now, return mock data to prevent 502 errors
    const mockData = {
      id: 1,
      title: 'Latest Webinar',
      date: new Date().toISOString(),
      description: 'Mock webinar data'
    }
    
    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error fetching latest webinar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest webinar' },
      { status: 500 }
    )
  }
}