
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

const LINE_CHANNEL_ID = '2008377867';
const LINE_CHANNEL_SECRET = '7834db6ad03d6459ff7b79aa52d46ec0';
const API_BASE_ENDPOINT = 'https://open-api.dataslot.app/search/wfm/v1';

// Line OAuth endpoints
const LINE_AUTH_ENDPOINT = 'https://access.line.me/oauth2/v2.1/authorize';
const LINE_TOKEN_ENDPOINT = 'https://api.line.me/oauth2/v2.1/token';
const LINE_PROFILE_ENDPOINT = 'https://api.line.me/v2/profile';

// Generate redirect URI using expo-auth-session
const getRedirectUri = () => {
  // For production iOS/Android builds, use a fixed redirect URI
  // For development, use makeRedirectUri
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // Use fixed redirect URI for production builds
    const redirectUri = 'natively://line-callback';
    console.log('Redirect URI (fixed):', redirectUri);
    return redirectUri;
  }
  
  // For development/web
  const redirectUri = makeRedirectUri({
    scheme: 'natively',
    path: 'line-callback',
  });
  console.log('Redirect URI (dynamic):', redirectUri);
  return redirectUri;
};

// Generate a random state for CSRF protection
const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Handle Line login using expo-auth-session pattern
export const handleLineLogin = async () => {
  try {
    const redirectUri = getRedirectUri();
    const state = generateState();
    
    // Store state for verification
    await AsyncStorage.setItem('lineLoginState', state);
    
    // Build the authorization URL
    const authUrl = `${LINE_AUTH_ENDPOINT}?response_type=code&client_id=${LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=profile%20openid`;
    
    console.log('Opening Line login...');
    console.log('Auth URL:', authUrl);
    
    // Open the browser for authentication
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    console.log('WebBrowser result type:', result.type);
    
    if (result.type === 'success') {
      const url = result.url;
      console.log('Callback URL:', url);
      
      // Parse the callback URL
      const urlParams = new URL(url);
      const code = urlParams.searchParams.get('code');
      const returnedState = urlParams.searchParams.get('state');
      
      console.log('Authorization code received:', !!code);
      console.log('State match:', state === returnedState);
      
      // Verify state matches
      const storedState = await AsyncStorage.getItem('lineLoginState');
      if (returnedState !== storedState) {
        console.log('State mismatch - possible CSRF attack');
        return { success: false, error: 'State verification failed' };
      }
      
      if (code) {
        // Exchange code for access token
        const tokenResult = await exchangeCodeForToken(code, redirectUri);
        if (tokenResult.success && tokenResult.accessToken) {
          // Get user profile
          const profileResult = await getLineUserProfile(tokenResult.accessToken);
          if (profileResult.success && profileResult.userId) {
            return { 
              success: true, 
              userId: profileResult.userId,
              accessToken: tokenResult.accessToken,
              profile: profileResult.profile
            };
          } else {
            return { 
              success: false, 
              error: 'LINE_NO_PROFILE',
              errorMessage: 'ไม่สามารถดึงข้อมูลโปรไฟล์จาก LINE'
            };
          }
        } else {
          return { 
            success: false, 
            error: 'LINE_TOKEN_EXCHANGE_FAILED',
            errorMessage: tokenResult.error || 'ไม่สามารถแลก Access Token ได้'
          };
        }
      } else {
        return { 
          success: false, 
          error: 'LINE_NO_CODE',
          errorMessage: 'ไม่ได้รับรหัสยืนยันจาก LINE'
        };
      }
    } else if (result.type === 'cancel') {
      console.log('User cancelled Line login');
      return { 
        success: false, 
        error: 'USER_CANCELLED',
        errorMessage: 'ผู้ใช้ยกเลิกการเข้าสู่ระบบ'
      };
    } else if (result.type === 'dismiss') {
      console.log('User dismissed Line login');
      return { 
        success: false, 
        error: 'USER_DISMISSED',
        errorMessage: 'ผู้ใช้ปิดหน้าต่างการเข้าสู่ระบบ'
      };
    }
    
    return { 
      success: false, 
      error: 'UNKNOWN_ERROR',
      errorMessage: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    };
  } catch (error) {
    console.error('Error during Line login:', error);
    return { 
      success: false, 
      error: 'LINE_LOGIN_EXCEPTION',
      errorMessage: `เข้าสู่ระบบไม่สำเร็จ: ${String(error)}`
    };
  }
};

// Exchange authorization code for access token
const exchangeCodeForToken = async (code: string, redirectUri: string) => {
  try {
    console.log('Exchanging code for token...');
    
    const response = await fetch(LINE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }).toString(),
    });
    
    console.log('Token exchange response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('Token exchange error:', errorData);
      return { success: false, error: `Token exchange failed: ${response.status}` };
    }
    
    const data = await response.json();
    console.log('Token exchange successful');
    
    return { 
      success: true, 
      accessToken: data.access_token,
      idToken: data.id_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.log('Error exchanging code for token:', error);
    return { success: false, error: String(error) };
  }
};

// Get Line user profile
const getLineUserProfile = async (accessToken: string) => {
  try {
    console.log('Fetching Line user profile...');
    
    const response = await fetch(LINE_PROFILE_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    console.log('Profile fetch response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('Profile fetch error:', errorData);
      return { success: false, error: `Profile fetch failed: ${response.status}` };
    }
    
    const profile = await response.json();
    console.log('User profile fetched successfully');
    console.log('User ID:', profile.userId);
    
    return { 
      success: true, 
      userId: profile.userId,
      profile: {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      }
    };
  } catch (error) {
    console.log('Error fetching user profile:', error);
    return { success: false, error: String(error) };
  }
};

// Check user authorization using Line ID and company name
export const checkUserAuthorization = async (lineId: string, companyName: string) => {
  try {
    console.log('Checking authorization for Line ID:', lineId);
    console.log('Company:', companyName);
    
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
    
    console.log('API Request URL:', apiEndpoint);
    console.log('API Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data, null, 2));
    
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
    await AsyncStorage.removeItem('lineUserInfo');
    await AsyncStorage.removeItem('lineLoginState');
    await AsyncStorage.removeItem('selectedCompany');
    await AsyncStorage.removeItem('tempCompanies');
    console.log('User logged out');
  } catch (error) {
    console.log('Error during logout:', error);
  }
};
