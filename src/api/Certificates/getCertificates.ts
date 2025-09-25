import axiosInterceptor from '@/interceptor/axiosClient'

export interface Certificate {
  id: number
  certificate_id: string
  course_name: string
  module_name: string
  nft_address: string
  image_url: string
  metadata_url: string
  network: string
  status: string
  created_at: string
  verification_url: string
}

export interface GetCertificatesResponse {
  success: boolean
  certificates: Certificate[]
  count: number
}

export async function getCertificates(): Promise<GetCertificatesResponse> {
  const response = await axiosInterceptor.get('/api/certificates/list/')
  return response.data
}
