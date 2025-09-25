import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const paymentData = Object.fromEntries(formData.entries())
    
    console.log('Payment result data:', paymentData)
    
    const transactionStatus = paymentData.transactionStatus as string
    let status = 'pending'
    let message = 'Ваш платіж обробляється'
    
    if (transactionStatus === 'Approved') {
      status = 'success'
      message = 'Ваша підписка успішно активована!'
    } else if (transactionStatus === 'Declined') {
      status = 'error'
      message = 'Платіж було відхилено. Спробуйте ще раз.'
    }
    
    // Використовуємо абсолютний URL для перенаправлення
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`
    const redirectUrl = `${baseUrl}/payment-result?status=${encodeURIComponent(status)}&message=${encodeURIComponent(message)}`
    
    return NextResponse.redirect(redirectUrl, { status: 302 })
  } catch (error) {
    console.error('Error processing payment result:', error)
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`
    const redirectUrl = `${baseUrl}/payment-result?status=error&message=${encodeURIComponent('Сталася помилка при обробці платежу')}`
    return NextResponse.redirect(redirectUrl, { status: 302 })
  }
}

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  const baseUrl = `${protocol}://${host}`
  return NextResponse.redirect(`${baseUrl}/payment-result`, { status: 302 })
}
