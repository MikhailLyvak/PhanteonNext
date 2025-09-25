import { useQuery } from '@tanstack/react-query'
import { getCertificates } from '@/api/Certificates/getCertificates'

export const useGetCertificates = () => {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: getCertificates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })
}
