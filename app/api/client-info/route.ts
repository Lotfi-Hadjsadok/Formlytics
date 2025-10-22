import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get client IP from various headers
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('cf-connecting-ip') ||
                    request.headers.get('x-client-ip') ||
                    'unknown'

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get referrer
    const referrer = request.headers.get('referer') || 'direct'

    return NextResponse.json({
      ipAddress: clientIP.split(',')[0].trim(), // Take first IP if multiple
      userAgent,
      referrer,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error getting client info:", error)
    return NextResponse.json({ 
      error: "Failed to get client information" 
    }, { status: 500 })
  }
}
