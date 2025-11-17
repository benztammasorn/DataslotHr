import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_SEARCH_API = 'https://search.user.dataslot.app/indexes/users/search';
const SEARCH_API_TOKEN = 'Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi';

export interface CompanyInfo {
  id: string; // Full ID like "WFM_ATMBAY_92950a75-2d24-4c0b-b326-47c6ae7a3dd7"
  module: string; // e.g., "WFM"
  company: string; // e.g., "ATMBAY"
  gUId: string;
  lUId: string;
  role: string;
  status: string;
  employeeNumber: string;
  userInfo: {
    email: string;
    displayName: string;
    pictureUrl: string;
  };
  firstName: string;
  lastName: string;
  teamId: string;
}

/**
 * Fetch all companies associated with a LINE User ID
 */
export const fetchUserCompanies = async (lineUserId: string): Promise<CompanyInfo[]> => {
  try {
    console.log('Fetching companies for LINE User ID:', lineUserId);

    const requestBody = {
      limit: 10,
      filter: [`lUId = ${lineUserId}`],
      sort: []
    };

    console.log('Request to user search API:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(USER_SEARCH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SEARCH_API_TOKEN,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('User search API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('User search API error:', errorText);
      throw new Error(`Failed to fetch user companies: ${response.status}`);
    }

    const data = await response.json();
    console.log('User search API response:', JSON.stringify(data, null, 2));

    if (data && data.hits && Array.isArray(data.hits)) {
      console.log(`Found ${data.hits.length} company records`);
      return data.hits as CompanyInfo[];
    }

    console.log('No companies found for user');
    return [];
  } catch (error) {
    console.log('Error fetching user companies:', error);
    throw error;
  }
};

/**
 * Get unique companies from company info list
 * Filters out duplicates and inactive records
 */
export const getUniqueCompanies = (companyInfos: CompanyInfo[]): CompanyInfo[] => {
  const companyMap = new Map<string, CompanyInfo>();

  for (const info of companyInfos) {
    const companyName = info.company;
    
    // Skip if company already exists and current one is inactive
    if (companyMap.has(companyName)) {
      const existing = companyMap.get(companyName)!;
      // Prefer ACTIVE status over INACTIVE
      if (info.status === 'ACTIVE' && existing.status !== 'ACTIVE') {
        companyMap.set(companyName, info);
      }
    } else {
      companyMap.set(companyName, info);
    }
  }

  return Array.from(companyMap.values());
};

/**
 * Store selected company information
 */
export const storeSelectedCompany = async (companyInfo: CompanyInfo): Promise<void> => {
  try {
    await AsyncStorage.setItem('selectedCompany', JSON.stringify(companyInfo));
    console.log('Selected company stored:', companyInfo.company);
  } catch (error) {
    console.log('Error storing selected company:', error);
    throw error;
  }
};

/**
 * Get stored selected company
 */
export const getSelectedCompany = async (): Promise<CompanyInfo | null> => {
  try {
    const stored = await AsyncStorage.getItem('selectedCompany');
    if (stored) {
      const companyInfo = JSON.parse(stored) as CompanyInfo;
      console.log('Retrieved selected company:', companyInfo.company);
      return companyInfo;
    }
    return null;
  } catch (error) {
    console.log('Error retrieving selected company:', error);
    return null;
  }
};

/**
 * Clear selected company (useful for logout or company switching)
 */
export const clearSelectedCompany = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('selectedCompany');
    console.log('Selected company cleared');
  } catch (error) {
    console.log('Error clearing selected company:', error);
  }
};

/**
 * Get company name for API calls
 */
export const getCompanyNameForAPI = async (): Promise<string | null> => {
  const company = await getSelectedCompany();
  return company ? company.company : null;
};

