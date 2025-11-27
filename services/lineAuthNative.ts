// LINE Authentication using @xmartlabs/react-native-line
import Line from '@xmartlabs/react-native-line';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LINE_CHANNEL_ID = '2008377867';
const API_BASE_ENDPOINT = 'https://open-api.dataslot.app/search/wfm/v1';

// Initialize LINE SDK
export const initializeLineSDK = async () => {
  try {
    await Line.setup({ channelId: LINE_CHANNEL_ID });
    console.log('LINE SDK initialized successfully');
    return { success: true };
  } catch (error) {
    console.log('Error initializing LINE SDK:', error);
    return { success: false, error: String(error) };
  }
};

// Handle Line login using native SDK
export const handleLineLogin = async () => {
  try {
    console.log('Starting Line login with native SDK...');
    
    // Login with LINE
    const loginResult = await Line.login({});
    
    if (!loginResult || !loginResult.accessToken) {
      console.error('LINE Login failed: No access token received');
      return { 
        success: false, 
        error: 'LINE_NO_TOKEN',
        errorMessage: 'ไม่ได้รับ Access Token จาก LINE'
      };
    }
    
    console.log('Login successful');
    console.log('Access Token:', loginResult.accessToken.accessToken);
    
    // Get user profile
    const profile = await Line.getProfile();
    
    if (!profile || !profile.userID) {
      console.error('LINE Profile fetch failed: No user ID');
      return { 
        success: false, 
        error: 'LINE_NO_PROFILE',
        errorMessage: 'ไม่สามารถดึงข้อมูลโปรไฟล์จาก LINE'
      };
    }
    
    console.log('User profile fetched');
    console.log('User ID:', profile.userID);
    console.log('Display Name:', profile.displayName);
    
    return {
      success: true,
      userId: profile.userID,
      accessToken: loginResult.accessToken.accessToken,
      profile: {
        userId: profile.userID,
        displayName: profile.displayName,
        pictureUrl: profile.pictureURL,
        statusMessage: profile.statusMessage,
      },
    };
  } catch (error) {
    console.error('Error during Line login:', error);
    
    // Check if user cancelled
    if (String(error).includes('CANCEL') || String(error).includes('cancel')) {
      return { 
        success: false, 
        error: 'USER_CANCELLED',
        errorMessage: 'ผู้ใช้ยกเลิกการเข้าสู่ระบบ'
      };
    }
    
    // Check for network errors
    if (String(error).includes('network') || String(error).includes('Network')) {
      return { 
        success: false, 
        error: 'NETWORK_ERROR',
        errorMessage: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย'
      };
    }
    
    // Generic error
    return { 
      success: false, 
      error: 'LINE_LOGIN_FAILED',
      errorMessage: `เข้าสู่ระบบ LINE ไม่สำเร็จ: ${String(error)}`,
      errorDetails: error
    };
  }
};

// Get current access token
export const getCurrentAccessToken = async () => {
  try {
    const token = await Line.getCurrentAccessToken();
    return { success: true, accessToken: token };
  } catch (error) {
    console.log('Error getting current access token:', error);
    return { success: false, error: String(error) };
  }
};

// Verify access token
export const verifyAccessToken = async () => {
  try {
    const result = await Line.verifyAccessToken();
    return { success: true, isValid: true, result };
  } catch (error) {
    console.log('Error verifying access token:', error);
    return { success: false, isValid: false, error: String(error) };
  }
};

// Refresh access token
export const refreshAccessToken = async () => {
  try {
    const token = await Line.refreshAccessToken();
    return { success: true, accessToken: token };
  } catch (error) {
    console.log('Error refreshing access token:', error);
    return { success: false, error: String(error) };
  }
};

// Get LINE profile
export const getLineProfile = async () => {
  try {
    const profile = await Line.getProfile();
    return {
      success: true,
      userId: profile.userID,
      profile: {
        userId: profile.userID,
        displayName: profile.displayName,
        pictureUrl: profile.pictureURL,
        statusMessage: profile.statusMessage,
      },
    };
  } catch (error) {
    console.log('Error getting LINE profile:', error);
    return { success: false, error: String(error) };
  }
};

// Check user authorization using Line ID and company name
export const checkUserAuthorization = async (lineId: string, companyName: string) => {
  try {
    console.log('=== Authorization Check Started ===');
    console.log('Line ID:', lineId);
    console.log('Company:', companyName);
    
    if (!lineId || !companyName) {
      console.error('Missing required parameters');
      return { 
        authorized: false, 
        data: null, 
        error: 'MISSING_PARAMETERS',
        errorMessage: 'ข้อมูลไม่ครบถ้วน (LINE ID หรือ Company Name)'
      };
    }
    
    const apiEndpoint = `${API_BASE_ENDPOINT}/${companyName}`;
    
    const requestBody = {
      hitsPerPage: 500,
      page: 1,
      filter: [
        `company = ${companyName}`,
        'workflowId IN [ "EMPLOYEE" ]',
        'type = TASK',
        `detail.userInfo.assignee.lUId = ${lineId}`
      ],
      sort: ['timestamp:desc']
    };
    
    console.log('API Endpoint:', apiEndpoint);
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      if (response.status === 401) {
        return { 
          authorized: false, 
          data: null, 
          error: 'API_UNAUTHORIZED',
          errorMessage: 'ไม่มีสิทธิ์เข้าถึง API (401)'
        };
      } else if (response.status === 403) {
        return { 
          authorized: false, 
          data: null, 
          error: 'API_FORBIDDEN',
          errorMessage: 'ไม่มีสิทธิ์เข้าถึงข้อมูลบริษัทนี้ (403)'
        };
      } else if (response.status === 404) {
        return { 
          authorized: false, 
          data: null, 
          error: 'API_NOT_FOUND',
          errorMessage: 'ไม่พบข้อมูลบริษัท (404)'
        };
      } else if (response.status >= 500) {
        return { 
          authorized: false, 
          data: null, 
          error: 'API_SERVER_ERROR',
          errorMessage: `เซิร์ฟเวอร์มีปัญหา (${response.status})`
        };
      }
      
      return { 
        authorized: false, 
        data: null, 
        error: 'API_ERROR',
        errorMessage: `API Error: ${response.status} - ${errorText}`
      };
    }
    
    const data = await response.json();
    console.log('API Response Data:', JSON.stringify(data, null, 2));
    
    // Check if user has records in the database
    if (data && data.hits && Array.isArray(data.hits) && data.hits.length > 0) {
      console.log('User authorized - found', data.hits.length, 'records');
      
      // Extract employee information from the response
      const employeeData = data.hits[0];
      const userInfo = employeeData.detail?.userInfo;
      const jobDescription = employeeData.detail?.jobDescription;
      const workLocation = employeeData.detail?.workLocation;
      
      console.log('Employee Number:', userInfo?.employeeNumber);
      console.log('Employee Name:', userInfo?.name);
      console.log('Department:', jobDescription?.department?.name);
      console.log('Position:', jobDescription?.position?.name);
      
      return { 
        authorized: true, 
        data: employeeData,
        employeeInfo: {
          employeeNumber: userInfo?.employeeNumber,
          name: userInfo?.name,
          phoneNumber: userInfo?.phoneNumber,
          email: userInfo?.assignee?.userInfo?.email,
          department: jobDescription?.department?.name,
          departmentCode: jobDescription?.department?.code,
          position: jobDescription?.position?.name,
          positionId: jobDescription?.position?.id,
          division: jobDescription?.division?.name,
          branch: jobDescription?.branch,
          basicWage: jobDescription?.basicWage,
          startDate: jobDescription?.startTimestamp,
          workLocation: workLocation?.alias,
          address: workLocation?.address,
          geoLocation: workLocation?.geoLocation,
        }
      };
    } else {
      console.error('=== USER NOT FOUND IN COMPANY ===');
      console.error('LINE ID:', lineId);
      console.error('Company:', companyName);
      console.error('Response:', data);
      
      return { 
        authorized: false, 
        data: null,
        error: 'USER_NOT_FOUND',
        errorMessage: `ไม่พบข้อมูลพนักงานในระบบบริษัท ${companyName}\nLINE ID: ${lineId.substring(0, 10)}...`
      };
    }
  } catch (error) {
    console.error('=== Authorization Check Error ===');
    console.error('Error:', error);
    
    // Check for network errors
    if (String(error).includes('network') || String(error).includes('Network') || String(error).includes('Failed to fetch')) {
      return { 
        authorized: false, 
        data: null, 
        error: 'NETWORK_ERROR',
        errorMessage: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบอินเทอร์เน็ต'
      };
    }
    
    return { 
      authorized: false, 
      data: null, 
      error: 'AUTHORIZATION_CHECK_FAILED',
      errorMessage: `เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์: ${String(error)}`
    };
  }
};

// Store Line user info with company information
export const storeLineUserInfo = async (lineId: string, userInfo: any, profile?: any, companyName?: string) => {
  try {
    const userData = {
      lineId,
      userInfo,
      profile,
      companyName,
      loginTime: new Date().toISOString(),
    };
    await AsyncStorage.setItem('lineUserInfo', JSON.stringify(userData));
    console.log('Line user info stored for company:', companyName);
  } catch (error) {
    console.log('Error storing Line user info:', error);
  }
};

// Get stored Line user info
export const getLineUserInfo = async () => {
  try {
    const userInfo = await AsyncStorage.getItem('lineUserInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.log('Error retrieving Line user info:', error);
    return null;
  }
};

// Logout
export const logout = async () => {
  try {
    await Line.logout();
    await AsyncStorage.removeItem('lineUserInfo');
    await AsyncStorage.removeItem('selectedCompany');
    await AsyncStorage.removeItem('tempCompanies');
    console.log('User logged out');
  } catch (error) {
    console.log('Error during logout:', error);
  }
};

