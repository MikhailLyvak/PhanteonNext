import axiosInterceptor from '@/interceptor/axiosClient'

export interface VerifyCertificateResponse {
  success: boolean
  valid: boolean
  certificate?: {
    certificate_id: string
    course_name: string
    module_name: string
    student_name: string
    nft_address: string
    image_url: string
    metadata_url: string
    network: string
    created_at: string
    verified_on?: string
  }
  error?: string
}

export async function verifyCertificate(
  certificateId: string
): Promise<VerifyCertificateResponse> {
  const response = await axiosInterceptor.get(`/api/certificates/verify/${certificateId}/`)
  return response.data
}
