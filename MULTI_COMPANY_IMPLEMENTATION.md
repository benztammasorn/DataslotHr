# Multi-Company Implementation Summary

## 📋 Overview

แอป HR ได้รับการอัพเกรดให้รองรับการทำงานหลายบริษัท (Multi-Company Support) โดยผู้ใช้สามารถเข้าถึงข้อมูลของหลายบริษัทได้ภายในแอปเดียว

---

## 🎯 Features ที่เพิ่มเข้ามา

### 1. **Company Discovery**
- ระบบค้นหาบริษัทที่ผู้ใช้สังกัดอัตโนมัติผ่าน LINE User ID
- ใช้ API: `https://search.user.dataslot.app/indexes/users/search`
- Authorization Token: `Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi`

### 2. **Company Selection Screen**
- หน้าจอเลือกบริษัท (สำหรับผู้ใช้ที่มีหลายบริษัท)
- แสดงข้อมูล: ชื่อบริษัท, สถานะ (ACTIVE/INACTIVE), บทบาท, รหัสพนักงาน
- Auto-select ถ้ามีเพียง 1 บริษัท

### 3. **Dynamic API Endpoints**
- ทุก API call ใช้ company name แบบ dynamic
- Pattern: `https://api.dataslot.app/{module}/{companyName}/{endpoint}`
- รองรับการเปลี่ยนบริษัทโดยไม่ต้อง restart แอป

### 4. **Company Information in Profile**
- แสดงชื่อบริษัทปัจจุบันในหน้า Profile
- ผู้ใช้สามารถดูว่ากำลังใช้งานบริษัทไหนอยู่

---

## 🏗️ Architecture Changes

### New Files Created

#### 1. `/services/companyService.ts`
**Purpose**: จัดการข้อมูลบริษัทและการเลือกบริษัท

**Key Functions:**
```typescript
// ดึงข้อมูลบริษัททั้งหมดของ user
fetchUserCompanies(lineUserId: string): Promise<CompanyInfo[]>

// กรองบริษัทที่ซ้ำกัน
getUniqueCompanies(companyInfos: CompanyInfo[]): CompanyInfo[]

// บันทึกบริษัทที่เลือก
storeSelectedCompany(companyInfo: CompanyInfo): Promise<void>

// ดึงบริษัทที่เลือกไว้
getSelectedCompany(): Promise<CompanyInfo | null>

// ดึงชื่อบริษัทสำหรับ API calls
getCompanyNameForAPI(): Promise<string | null>
```

**Data Structure:**
```typescript
interface CompanyInfo {
  id: string;           // "WFM_ATMBAY_..."
  module: string;       // "WFM"
  company: string;      // "ATMBAY"
  gUId: string;
  lUId: string;
  role: string;
  status: string;       // "ACTIVE" | "INACTIVE"
  employeeNumber: string;
  userInfo: {
    email: string;
    displayName: string;
    pictureUrl: string;
  };
}
```

#### 2. `/app/company-selection.tsx`
**Purpose**: หน้าจอเลือกบริษัท

**Features:**
- แสดงรายการบริษัททั้งหมดที่ผู้ใช้สามารถเข้าถึงได้
- แสดง status badge (ACTIVE/INACTIVE)
- แสดงข้อมูล role และ employee number
- Loading state ขณะตรวจสอบสิทธิ์
- Error handling สำหรับกรณีไม่มีสิทธิ์เข้าถึง

**User Flow:**
1. โหลดรายการบริษัทจาก AsyncStorage (tempCompanies)
2. แสดงรายการให้ผู้ใช้เลือก
3. เมื่อเลือก → ตรวจสอบสิทธิ์กับบริษัทนั้น
4. ถ้า authorized → บันทึกข้อมูลและไปหน้า home
5. ถ้าไม่ authorized → แสดง error

---

### Modified Files

#### 1. `/services/lineAuth.ts`

**Changes:**
```typescript
// Before
const API_ENDPOINT = 'https://open-api.dataslot.app/search/wfm/v1/JNLVision';

// After
const API_BASE_ENDPOINT = 'https://open-api.dataslot.app/search/wfm/v1';
```

**Updated Functions:**
```typescript
// เพิ่ม parameter companyName
checkUserAuthorization(lineId: string, companyName: string)

// เพิ่ม parameter companyName (optional)
storeLineUserInfo(lineId: string, userInfo: any, profile?: any, companyName?: string)

// ล้างข้อมูล company เมื่อ logout
logout() // เพิ่มการลบ selectedCompany และ tempCompanies
```

#### 2. `/services/clockService.ts`

**Changes:**
```typescript
// Before
const API_ENDPOINT = 'https://api.dataslot.app/wfm/JNLVision/tasks';
const SEARCH_ENDPOINT = 'https://open-api.dataslot.app/search/wfm/v1/JNLVision';

// After
const API_BASE_ENDPOINT = 'https://api.dataslot.app/wfm';
const SEARCH_BASE_ENDPOINT = 'https://open-api.dataslot.app/search/wfm/v1';
```

**Updated Functions:**
- `checkIfAlreadyCheckedInToday()` - ดึง company name จาก storage
- `createCheckIn()` - ใช้ dynamic endpoint ตาม company
- `getTodayCheckInRecord()` - ใช้ dynamic endpoint ตาม company

**Example:**
```typescript
const companyName = await getCompanyNameForAPI();
const apiEndpoint = `${API_BASE_ENDPOINT}/${companyName}/tasks`;
```

#### 3. `/app/login.tsx`

**Major Refactor:**

**Old Flow:**
```
LINE Login → Check Authorization → Store User Info → Navigate to Home
```

**New Flow:**
```
LINE Login 
  ↓
Fetch User Companies (User Search API)
  ↓
Check Company Count
  ├─ 1 Company → Auto-select → Check Authorization → Home
  └─ Multiple → Store Temp Data → Company Selection Screen
```

**Key Changes:**
```typescript
const performAuthorization = async (lineId: string, profile?: any) => {
  // 1. Fetch companies
  const companies = await fetchUserCompanies(lineId);
  
  // 2. Get unique companies
  const uniqueCompanies = getUniqueCompanies(companies);
  
  // 3. Handle based on count
  if (uniqueCompanies.length === 1) {
    // Auto-select single company
    await storeSelectedCompany(uniqueCompanies[0]);
    const authResult = await checkUserAuthorization(lineId, uniqueCompanies[0].company);
    // ... navigate to home
  } else {
    // Multiple companies - show selection
    await AsyncStorage.setItem('tempCompanies', JSON.stringify(uniqueCompanies));
    router.replace('/company-selection');
  }
}
```

#### 4. `/app/(tabs)/profile.tsx`

**Added:**
- Display current company name
- Load company info on screen mount

```typescript
const [currentCompany, setCurrentCompany] = useState<string>('');

const loadCurrentCompany = async () => {
  const company = await getSelectedCompany();
  if (company) {
    setCurrentCompany(company.company);
  }
};
```

---

## 🔄 Data Flow

### Login Flow

```
┌─────────────────┐
│  LINE Login     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ User Search API                 │
│ (search.user.dataslot.app)      │
│ Filter: lUId = {LINE_USER_ID}   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Parse Response  │
│ Extract Companies│
└────────┬────────┘
         │
         ▼
    ┌───┴───┐
    │ Count │
    └───┬───┘
        │
    ┌───┴────────────────┐
    │                    │
    ▼                    ▼
┌────────┐        ┌──────────────┐
│ 1 Co.  │        │ Multiple Co. │
└───┬────┘        └──────┬───────┘
    │                    │
    ▼                    ▼
┌────────────┐    ┌──────────────────┐
│ Auto-Select│    │ Selection Screen │
└─────┬──────┘    └────────┬─────────┘
      │                    │
      │                    ▼
      │            ┌──────────────┐
      │            │ User Selects │
      │            └──────┬───────┘
      │                   │
      └───────┬───────────┘
              │
              ▼
    ┌──────────────────┐
    │ Check Auth       │
    │ (company-specific)│
    └────────┬─────────┘
             │
         ┌───┴───┐
         │       │
         ▼       ▼
    ┌─────┐  ┌──────┐
    │ OK  │  │ Fail │
    └──┬──┘  └──┬───┘
       │        │
       ▼        ▼
   ┌──────┐  ┌───────┐
   │ Home │  │ Error │
   └──────┘  └───────┘
```

### API Call Flow

```
┌──────────────────┐
│ User Action      │
│ (e.g., Clock In) │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ getCompanyNameForAPI()│
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Get from AsyncStorage│
│ key: selectedCompany │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Build Dynamic URL    │
│ /wfm/{company}/tasks │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Make API Request     │
└──────────────────────┘
```

---

## 💾 Storage Structure

### AsyncStorage Keys

| Key | Description | Data Type | Cleared on Logout |
|-----|-------------|-----------|-------------------|
| `selectedCompany` | บริษัทที่เลือกปัจจุบัน | CompanyInfo | ✅ Yes |
| `tempCompanies` | บริษัททั้งหมด (ชั่วคระว) | CompanyInfo[] | ✅ Yes |
| `tempLineProfile` | LINE profile (ชั่วคระว) | {lineId, profile} | ✅ Yes |
| `lineUserInfo` | ข้อมูล user และ employee | Object | ✅ Yes |
| `lineLoginState` | CSRF state | string | ✅ Yes |
| `clockRecords` | บันทึกเวลาทำงาน (local) | ClockRecord[] | ❌ No |

---

## 🔌 API Integration

### 1. User Search API

**Endpoint:**
```
POST https://search.user.dataslot.app/indexes/users/search
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi
```

**Request:**
```json
{
  "limit": 10,
  "filter": ["lUId = U25fdbff3c9333d90b00828c6dc6c47f1"],
  "sort": []
}
```

**Response:**
```json
{
  "hits": [
    {
      "id": "WFM_ATMBAY_92950a75-2d24-4c0b-b326-47c6ae7a3dd7",
      "module": "WFM",
      "company": "ATMBAY",
      "gUId": "92950a75-2d24-4c0b-b326-47c6ae7a3dd7",
      "lUId": "U25fdbff3c9333d90b00828c6dc6c47f1",
      "role": "Employee",
      "status": "ACTIVE",
      "employeeNumber": "1443",
      "userInfo": {
        "email": "user@example.com",
        "displayName": "John Doe",
        "pictureUrl": "https://..."
      }
    }
  ]
}
```

### 2. Authorization Check (Dynamic)

**Endpoint:**
```
POST https://open-api.dataslot.app/search/wfm/v1/{companyName}
```

**Example:**
```
POST https://open-api.dataslot.app/search/wfm/v1/ATMBAY
POST https://open-api.dataslot.app/search/wfm/v1/JNLVision
```

### 3. Clock In/Out (Dynamic)

**Endpoint:**
```
POST https://api.dataslot.app/wfm/{companyName}/tasks
```

**Example:**
```
POST https://api.dataslot.app/wfm/ATMBAY/tasks
POST https://api.dataslot.app/wfm/JNLVision/tasks
```

---

## 🧪 Testing Scenarios

### Scenario 1: User with Single Company
1. Login with LINE
2. System fetches companies → finds 1 company
3. Auto-select company
4. Check authorization → Success
5. Navigate to home screen
6. ✅ **Expected**: User goes directly to home

### Scenario 2: User with Multiple Companies
1. Login with LINE
2. System fetches companies → finds 3 companies
3. Show company selection screen
4. User selects "ATMBAY"
5. Check authorization → Success
6. Navigate to home screen
7. ✅ **Expected**: User can select preferred company

### Scenario 3: User with No Companies
1. Login with LINE
2. System fetches companies → finds 0 companies
3. Show error message
4. ✅ **Expected**: "No companies found" error

### Scenario 4: Unauthorized Access
1. Login with LINE
2. System fetches companies → finds 1 company
3. Auto-select company
4. Check authorization → Fail
5. Show error message
6. ✅ **Expected**: "Not authorized" error

### Scenario 5: Clock In with Selected Company
1. User already logged in (company: ATMBAY)
2. Click "Clock In"
3. System gets company name → "ATMBAY"
4. API call to `/wfm/ATMBAY/tasks`
5. ✅ **Expected**: Clock in successful with correct company

---

## 🚀 Deployment Checklist

- [x] Create companyService.ts
- [x] Create company-selection.tsx screen
- [x] Update lineAuth.ts for dynamic company
- [x] Update clockService.ts for dynamic company
- [x] Update login.tsx flow
- [x] Update profile.tsx to show company
- [x] Update README.md
- [x] Test single company flow
- [x] Test multiple company flow
- [x] Test no company flow
- [x] Test clock in/out with different companies

---

## 📝 Migration Notes

### For Existing Users

**Before Update:**
- App was hardcoded to use "JNLVision" company
- Users could only access one company

**After Update:**
- Existing users will need to re-login
- System will automatically detect their companies
- If they only have JNLVision, it will auto-select (no change in UX)
- If they have multiple companies, they'll see the new selection screen

### Data Migration

**No data migration needed** because:
- Company selection is stored separately
- Existing clock records remain in local storage
- User info will be refreshed on next login

---

## 🔧 Configuration

### API Token

Current token is hardcoded in `companyService.ts`:
```typescript
const SEARCH_API_TOKEN = 'Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi';
```

**Recommendation**: Move to environment variables in production

### Supported Companies

The system automatically supports any company returned by the User Search API. No hardcoded company list needed.

---

## 📊 Performance Considerations

1. **API Calls**: Added 1 extra API call during login (User Search API)
2. **Storage**: Minimal increase (~1KB per company info)
3. **Navigation**: Added 1 extra screen for multi-company users
4. **Caching**: Company info is cached in AsyncStorage

---

## 🐛 Known Issues & Limitations

1. **No Company Switching**: Users must logout and login again to switch companies
   - **Future Enhancement**: Add "Switch Company" button in profile

2. **Offline Mode**: Company selection requires internet connection
   - **Current Behavior**: Uses last selected company if offline

3. **Token Expiration**: User Search API token is hardcoded
   - **Risk**: Token may expire
   - **Mitigation**: Should implement token refresh mechanism

---

## 📚 Additional Resources

- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)

---

## 👥 Support

For questions or issues, please contact the development team.

**Created**: November 17, 2024  
**Version**: 2.0.0  
**Status**: ✅ Completed

