import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLineUserInfo } from './lineAuth';
import { getCompanyNameForAPI } from './companyService';

const API_BASE_ENDPOINT = 'https://api.dataslot.app/wfm';
const SEARCH_BASE_ENDPOINT = 'https://open-api.dataslot.app/search/wfm/v1';

// Calculate distance between two GPS coordinates using Haversine formula
// Returns distance in meters
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
};

// Get today's date at 00:00:00 as 13-digit timestamp
export const getTodayMidnight = (): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime().toString();
};

// Check if user has already checked in today
export const checkIfAlreadyCheckedInToday = async (
  employeeId: string
): Promise<{ checkedIn: boolean; taskId?: string }> => {
  try {
    const companyName = await getCompanyNameForAPI();
    if (!companyName) {
      throw new Error('No company selected. Please login again.');
    }

    const todayMidnight = getTodayMidnight();
    
    console.log('Checking if already checked in today...');
    console.log('Company:', companyName);
    console.log('Employee ID:', employeeId);
    console.log('Today midnight timestamp:', todayMidnight);

    const searchEndpoint = `${SEARCH_BASE_ENDPOINT}/${companyName}`;

    const requestBody = {
      hitsPerPage: 10,
      page: 1,
      filter: [
        `company = ${companyName}`,
        'workflowId IN [ "EMPLOYEE_CICO" ]',
        'type = TASK',
        `ref1 = ${employeeId}`,
        `ref2 = ${todayMidnight}`,
        'status IN [ "WORKING" ]'
      ],
      sort: ['timestamp:desc']
    };

    console.log('Search endpoint:', searchEndpoint);
    console.log('Search request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(searchEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.log('Search API error:', response.status);
      return { checkedIn: false };
    }

    const data = await response.json();
    console.log('Search results:', JSON.stringify(data, null, 2));

    if (data && data.hits && data.hits.length > 0) {
      console.log('Already checked in today!');
      return { checkedIn: true, taskId: data.hits[0].id };
    }

    console.log('Not checked in yet today');
    return { checkedIn: false };
  } catch (error) {
    console.log('Error checking if already checked in:', error);
    return { checkedIn: false };
  }
};

// Create check-in record
export const createCheckIn = async (
  currentLocation: { latitude: number; longitude: number; accuracy: number | null }
) => {
  try {
    console.log('Starting check-in process...');

    // Get company name
    const companyName = await getCompanyNameForAPI();
    if (!companyName) {
      throw new Error('No company selected. Please login again.');
    }

    // Get employee info from storage
    const lineUserInfo = await getLineUserInfo();
    if (!lineUserInfo || !lineUserInfo.userInfo) {
      throw new Error('Employee information not found. Please login again.');
    }

    const employeeData = lineUserInfo.userInfo;
    const employeeId = employeeData.id; // The ID field from EMPLOYEE record
    const taskInfoGUId = employeeData.detail?.taskInfo?.gUId;
    const employeeName = employeeData.detail?.userInfo?.name;
    const lineProfile = lineUserInfo.profile;

    console.log('Company:', companyName);
    console.log('Employee ID:', employeeId);
    console.log('Employee Name:', employeeName);
    console.log('Task gUId:', taskInfoGUId);

    if (!employeeId) {
      throw new Error('Employee ID not found');
    }

    // Check if already checked in today
    const checkInStatus = await checkIfAlreadyCheckedInToday(employeeId);
    if (checkInStatus.checkedIn) {
      throw new Error('คุณได้ทำการ Check-in แล้ววันนี้ กรุณา Check-out ก่อน');
    }

    // Get work location from employee data
    const workLocationItems = employeeData.detail?.workLocation?.items;
    if (!workLocationItems || workLocationItems.length === 0) {
      throw new Error('Work location not found in employee data');
    }

    // Find primary work location
    const primaryWorkLocation = workLocationItems.find((loc: any) => loc.isPrimary === true) || workLocationItems[0];
    
    console.log('Work location:', primaryWorkLocation.alias);
    console.log('Work location GPS:', primaryWorkLocation.geoLocation);

    // Calculate distance from work location
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      primaryWorkLocation.geoLocation.lat,
      primaryWorkLocation.geoLocation.lng
    );

    const distanceInKm = distance / 1000;
    console.log('Distance from work location:', distance.toFixed(2), 'meters');
    console.log('Distance in km:', distanceInKm.toFixed(4), 'km');

    // Validate distance (must be within 50 meters)
    if (distance > 50) {
      throw new Error(
        `คุณอยู่ห่างจากสำนักงาน ${distance.toFixed(0)} เมตร\n` +
        `กรุณาเข้าใกล้สำนักงานภายใน 50 เมตร เพื่อทำการ Check-in`
      );
    }

    // Get current timestamp
    const currentTimestamp = Date.now();
    const todayMidnight = getTodayMidnight();

    // Prepare check-in data
    const checkInData = {
      ref1: employeeId,
      ref2: todayMidnight,
      status: 'WORKING',
      workflowId: 'EMPLOYEE_CICO',
      detail: {
        workLocation: {
          address: primaryWorkLocation.address,
          geoLocation: primaryWorkLocation.geoLocation,
          by: employeeName || lineProfile?.displayName || 'Unknown',
          alias: primaryWorkLocation.alias,
          gUId: primaryWorkLocation.gUId,
          id: primaryWorkLocation.id,
          timestamp: currentTimestamp
        },
        assignees: [
          {
            index: `0,${taskInfoGUId}`,
            userInfo: {
              displayName: lineProfile?.displayName || employeeName || 'Unknown',
              pictureUrl: lineProfile?.pictureUrl || ''
            },
            gUId: taskInfoGUId,
            role: 'Employee',
            roleInfo: {
              roleEn: 'Employee',
              roleTh: 'พนักงาน'
            },
            lUId: lineUserInfo.lineId
          }
        ],
        taskInfo: {
          gUId: taskInfoGUId,
          createBy: lineProfile?.displayName || employeeName || 'Unknown',
          isCopied: false,
          createdDate: currentTimestamp
        },
        checkInInfo: {
          images: [],
          location: {
            lng: currentLocation.longitude,
            lat: currentLocation.latitude
          },
          distance: distanceInKm,
          timestamp: currentTimestamp
        }
      }
    };

    console.log('Check-in data:', JSON.stringify(checkInData, null, 2));

    // Send to API
    const apiEndpoint = `${API_BASE_ENDPOINT}/${companyName}/tasks`;
    console.log('API Endpoint:', apiEndpoint);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(checkInData),
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('API Error:', errorText);
      throw new Error(`Failed to create check-in: ${response.status}`);
    }

    const result = await response.json();
    console.log('Check-in created successfully:', result);

    return {
      success: true,
      data: result,
      distance: distance,
      timestamp: currentTimestamp
    };
  } catch (error) {
    console.log('Error creating check-in:', error);
    throw error;
  }
};

// Get today's check-in record
export const getTodayCheckInRecord = async (employeeId: string) => {
  try {
    const companyName = await getCompanyNameForAPI();
    if (!companyName) {
      console.log('No company selected');
      return null;
    }

    const todayMidnight = getTodayMidnight();
    const searchEndpoint = `${SEARCH_BASE_ENDPOINT}/${companyName}`;
    
    const requestBody = {
      hitsPerPage: 10,
      page: 1,
      filter: [
        `company = ${companyName}`,
        'workflowId IN [ "EMPLOYEE_CICO" ]',
        'type = TASK',
        `ref1 = ${employeeId}`,
        `ref2 = ${todayMidnight}`
      ],
      sort: ['timestamp:desc']
    };

    const response = await fetch(searchEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data && data.hits && data.hits.length > 0) {
      return data.hits[0];
    }

    return null;
  } catch (error) {
    console.log('Error getting today check-in record:', error);
    return null;
  }
};

