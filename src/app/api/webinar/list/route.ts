import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Call Django backend to get webinars list
    const response = await fetch('http://localhost:8000/api/webinar/list/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching webinars list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webinars list' },
      { status: 500 }
    );
  }
}
