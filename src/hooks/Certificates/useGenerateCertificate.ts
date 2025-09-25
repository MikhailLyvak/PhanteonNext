import { useMutation } from '@tanstack/react-query'
import { generateCertificate, GenerateCertificateRequest } from '@/api/Certificates/generateCertificate'

export const useGenerateCertificate = () => {
  return useMutation({
    mutationFn: (data: GenerateCertificateRequest) => generateCertificate(data),
    onSuccess: (data) => {
      console.log('Certificate generated successfully:', data)
    },
    onError: (error) => {
      console.error('Certificate generation failed:', error)
    }
  })
}
