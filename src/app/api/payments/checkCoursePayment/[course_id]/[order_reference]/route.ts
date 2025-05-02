
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  context: { params: Promise<{ course_id: string; order_reference: string }> }
) {
  const { course_id, order_reference } = await context.params

  let base = process.env.NEXT_PUBLIC_APP_URL

  if (!base) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    base = `${proto}://${host}`
  }

  const redirectUrl = `${base}/payments/checkCoursePayment/${course_id}/${order_reference}`

  return NextResponse.redirect(redirectUrl, 303)
}
