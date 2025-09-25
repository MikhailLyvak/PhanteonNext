import useGetMyProfileData from './useGetMyProfileData'

export interface PersonalDataCheck {
  isComplete: boolean
  missingFields: string[]
  canGetCertificate: boolean
}

export const useCheckPersonalData = (): PersonalDataCheck => {
  const { data: profileData } = useGetMyProfileData()

  if (!profileData) {
    return {
      isComplete: false,
      missingFields: ['first_name', 'last_name', 'solana_wallet'],
      canGetCertificate: false
    }
  }

  const missingFields: string[] = []
  
  // Перевіряємо обов'язкові поля (крім телефону)
  if (!profileData.first_name || profileData.first_name.trim() === '') {
    missingFields.push('first_name')
  }
  
  if (!profileData.last_name || profileData.last_name.trim() === '') {
    missingFields.push('last_name')
  }
  
  if (!profileData.solana_wallet || profileData.solana_wallet.trim() === '') {
    missingFields.push('solana_wallet')
  }

  const isComplete = missingFields.length === 0
  const canGetCertificate = isComplete

  return {
    isComplete,
    missingFields,
    canGetCertificate
  }
}

export default useCheckPersonalData
