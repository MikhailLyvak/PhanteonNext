import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Call Django backend to get vebinars list
    const response = await fetch('http://localhost:8000/api/vebinar/list/', {
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
    console.error('Error fetching vebinars list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vebinars list' },
      { status: 500 }
    );
  }
}
