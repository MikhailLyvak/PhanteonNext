import axiosInterceptor from '@/interceptor/axiosClient'

export interface GenerateCertificateRequest {
  course_id: number
  module_id: number
  course_name: string
  module_name: string
  student_wallet: string
  completion_date: string
}

export interface GenerateCertificateResponse {
  success: boolean
  certificate_id: string
  nft_address: string
  image_url: string
  metadata_url: string
  transaction_signature: string
  network: string
  verification_url: string
}

export async function generateCertificate(
  data: GenerateCertificateRequest
): Promise<GenerateCertificateResponse> {
  const response = await axiosInterceptor.post('/api/certificates/generate/', data)
  return response.data
}
