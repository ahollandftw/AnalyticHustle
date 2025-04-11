import { NextResponse } from 'next/server'

const SPORTRADAR_API_KEY = '7zxxvwDFf9bmpHvGxjSH6japLKygqmwQnPyypIJI'
const SPORTRADAR_BASE_URL = 'https://api.sportradar.us/oddscomparison-us/en/v4/en'

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    
    // Fetch markets data from Sportradar
    const response = await fetch(
      `${SPORTRADAR_BASE_URL}/sport_events/${eventId}/markets.json?api_key=${SPORTRADAR_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`Sportradar API error: ${response.status}`)
    }

    const data = await response.json()

    // Return the data
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching markets data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets data' },
      { status: 500 }
    )
  }
} 