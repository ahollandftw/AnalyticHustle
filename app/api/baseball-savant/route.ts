import { NextResponse } from 'next/server'
// @ts-ignore
import * as cheerio from 'cheerio'

interface PitchTrackingData {
  year: number
  pitch_type: string
  pitches: number
  pa: number
  ab: number
  hits: number
  avg: number
  slg: number
  woba: number
  xba: number
  xslg: number
  xwoba: number
  velocity: number
  spin: number
  extension: number
  vertical_movement: number
  horizontal_movement: number
}

async function fetchBaseballSavantData(playerId: string): Promise<PitchTrackingData[]> {
  try {
    const url = `https://baseballsavant.mlb.com/savant-player/${playerId}`
    const response = await fetch(url)
    const html = await response.text()
    // @ts-ignore
    const $ = cheerio.load(html)

    const pitchData: PitchTrackingData[] = []

    // Find the pitch tracking table
    const table = $('#pitch_type_table')
    if (!table.length) {
      console.error('Pitch tracking table not found')
      return []
    }

    // Parse each row of the table
    // @ts-ignore
    table.find('tbody tr').each((_, row) => {
      // @ts-ignore
      const cells = $(row).find('td')
      const data: PitchTrackingData = {
        // @ts-ignore
        year: parseInt($(cells[0]).text().trim(), 10),
        // @ts-ignore
        pitch_type: $(cells[1]).text().trim(),
        // @ts-ignore
        pitches: parseInt($(cells[2]).text().trim(), 10),
        // @ts-ignore
        pa: parseInt($(cells[3]).text().trim(), 10),
        // @ts-ignore
        ab: parseInt($(cells[4]).text().trim(), 10),
        // @ts-ignore
        hits: parseInt($(cells[5]).text().trim(), 10),
        // @ts-ignore
        avg: parseFloat($(cells[6]).text().trim()),
        // @ts-ignore
        slg: parseFloat($(cells[7]).text().trim()),
        // @ts-ignore
        woba: parseFloat($(cells[8]).text().trim()),
        // @ts-ignore
        xba: parseFloat($(cells[9]).text().trim()),
        // @ts-ignore
        xslg: parseFloat($(cells[10]).text().trim()),
        // @ts-ignore
        xwoba: parseFloat($(cells[11]).text().trim()),
        // @ts-ignore
        velocity: parseFloat($(cells[12]).text().trim()),
        // @ts-ignore
        spin: parseFloat($(cells[13]).text().trim()),
        // @ts-ignore
        extension: parseFloat($(cells[14]).text().trim()),
        // @ts-ignore
        vertical_movement: parseFloat($(cells[15]).text().trim()),
        // @ts-ignore
        horizontal_movement: parseFloat($(cells[16]).text().trim()),
      }
      pitchData.push(data)
    })

    return pitchData
  } catch (error) {
    console.error('Error fetching Baseball Savant data:', error)
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get('playerId')

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
  }

  const data = await fetchBaseballSavantData(playerId)
  return NextResponse.json({ data })
} 