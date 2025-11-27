# TimeWise HR App

แอปพลิเคชัน HR สำหรับจัดการเวลาทำงาน (Clock In/Out) พร้อมระบบ LINE Login และตรวจสอบ GPS

## 📱 คุณสมบัติหลัก

- ✅ **LINE Login** - เข้าสู่ระบบด้วยบัญชี LINE
- ✅ **Multi-Company Support** - รองรับการทำงานหลายบริษัท
- ✅ **Company Selection** - เลือกบริษัทที่ต้องการใช้งาน (สำหรับผู้ใช้ที่มีหลายบริษัท)
- ✅ **Clock In/Out** - ลงเวลาเข้า-ออกงานพร้อม GPS
- ✅ **GPS Validation** - ตรวจสอบระยะห่างจากสำนักงาน (ไม่เกิน 50 เมตร)
- ✅ **Timesheet** - ดูประวัติการทำงานรายสัปดาห์
- ✅ **Profile** - ข้อมูลพนักงานจากระบบ

---

## 🚀 วิธีการติดตั้งและรันแอป

### ข้อกำหนดเบื้องต้น

ก่อนเริ่มต้น ต้องติดตั้งโปรแกรมเหล่านี้ก่อน:

- **Node.js** (เวอร์ชัน 18 หรือสูงกว่า) - [ดาวน์โหลด](https://nodejs.org/)
- **npm** หรือ **yarn** (มากับ Node.js)
- **Git** - [ดาวน์โหลด](https://git-scm.com/)

สำหรับทดสอบบนมือถือ:
- **iOS**: ต้องมี Mac และติดตั้ง Xcode
- **Android**: ติดตั้ง Android Studio

---

## 📦 ขั้นตอนการติดตั้ง

### 1. Clone โปรเจค

```bash
git clone <repository-url>
cd hr-app
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

หรือถ้าใช้ yarn:

```bash
yarn install
```

### 3. ตรวจสอบการติดตั้ง

ตรวจสอบว่าติดตั้งสำเร็จ:

```bash
npx expo --version
```

ควรแสดงเวอร์ชันของ Expo CLI

---

## 🏃 วิธีการรันแอป

### รันแบบ Development

#### **วิธีที่ 1: รันด้วย Tunnel (แนะนำ)**

เหมาะสำหรับทดสอบบนมือถือจริง:

```bash
npm run dev
```

หรือ:

```bash
npx expo start --tunnel
```

#### **วิธีที่ 2: รันบน iOS Simulator**

สำหรับ Mac เท่านั้น:

```bash
npm run ios
```

หรือ:

```bash
npx expo start --ios
```

#### **วิธีที่ 3: รันบน Android Emulator**

ต้องเปิด Android Emulator ก่อน:

```bash
npm run android
```

หรือ:

```bash
npx expo start --android
```

#### **วิธีที่ 4: รันบน Web Browser**

```bash
npm run web
```

หรือ:

```bash
npx expo start --web
```

**หมายเหตุ**: LINE Login จะทำงานได้เต็มรูปแบบบน iOS และ Android เท่านั้น

---

## 📱 ทดสอบบนมือถือจริง

### ใช้ Expo Go App

1. **ติดตั้ง Expo Go**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **รันแอป**
   ```bash
   npm run dev
   ```

3. **สแกน QR Code**
   - iOS: เปิดกล้องสแกน QR Code ที่แสดงใน Terminal
   - Android: เปิด Expo Go แล้วสแกน QR Code

---

## 🔧 คำสั่งที่ใช้บ่อย

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รันแอปแบบ development (tunnel mode) |
| `npm run ios` | รันบน iOS simulator |
| `npm run android` | รันบน Android emulator |
| `npm run web` | รันบน web browser |
| `npm run lint` | ตรวจสอบ code style |
| `npm run build:web` | Build สำหรับ web production |

---

## 🏗️ โครงสร้างโปรเจค

```
hr-app/
├── app/                        # หน้าจอต่างๆ (Expo Router)
│   ├── (tabs)/                # หน้าจอที่มี tab bar
│   │   ├── (home)/            # หน้าหลัก (Clock In/Out)
│   │   ├── timesheet.tsx      # ใบเวลารายสัปดาห์
│   │   └── profile.tsx        # โปรไฟล์พนักงาน
│   ├── login.tsx              # หน้า Login
│   ├── company-selection.tsx  # หน้าเลือกบริษัท (สำหรับ multi-company)
│   └── _layout.tsx            # Layout หลัก
├── services/                  # Services และ API calls
│   ├── lineAuth.ts            # LINE OAuth และ Authorization
│   ├── clockService.ts        # Clock In/Out logic
│   └── companyService.ts      # Company selection และ management
├── components/                # React Components
├── constants/                 # ค่าคงที่
├── contexts/                  # React Context
├── styles/                    # Styles และ themes
├── utils/                     # Utility functions
├── assets/                    # รูปภาพและ fonts
└── package.json               # Dependencies
```

---

## 🔐 การตั้งค่า LINE Login และ Multi-Company

แอปนี้ใช้ LINE OAuth 2.0 สำหรับการเข้าสู่ระบบ และรองรับการทำงานหลายบริษัท

### ข้อมูล LINE Channel (ตั้งค่าแล้ว)

- **Channel ID**: 2008377867
- **Redirect URI**: `natively://line-callback`
- **Workflow**: `EMPLOYEE`

### การตั้งค่าใน LINE Developers Console

สำหรับให้แอปทำงานได้ใน TestFlight และ Production:

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. เลือก Channel ของคุณ (Channel ID: 2008377867)
3. ไปที่แท็บ **LINE Login**
4. ในส่วน **App settings**:
   - **iOS URL scheme**: ใส่ `natively`
   - **Android URL scheme**: ใส่ `natively`
   - **iOS Bundle ID**: `com.dataslot.hr`
   - **Android Package Name**: `com.dataslot.hr`
5. ในส่วน **Callback URL** (สำคัญ!):
   - เพิ่ม `natively://line-callback` (สำหรับ Mobile App)
   - เพิ่ม `https://hr.dataslot.app/line-callback` (ถ้าต้องการใช้ Web)

**หมายเหตุ**: 
- ต้องเพิ่ม `natively://line-callback` ในส่วน **Callback URL** ด้วย
- สามารถมีหลาย Callback URL ได้ (ทั้ง custom scheme และ https)
- URL Scheme ในส่วน App settings ใส่แค่ `natively` (ไม่ใส่ `://`)
- Callback URL ต้องใส่ URL เต็ม เช่น `natively://line-callback`

### การทำงานของระบบ Multi-Company

1. ผู้ใช้กด "Sign in with Line"
2. เปิดหน้า LINE Login และยืนยันตัวตน
3. ระบบเรียก API `https://search.user.dataslot.app/indexes/users/search` เพื่อค้นหาบริษัทที่ผู้ใช้สังกัด
4. **กรณีมี 1 บริษัท**: ระบบจะเลือกบริษัทอัตโนมัติและเข้าสู่แอป
5. **กรณีมีหลายบริษัท**: แสดงหน้าเลือกบริษัท (Company Selection Screen)
6. ผู้ใช้เลือกบริษัทที่ต้องการใช้งาน
7. ระบบตรวจสอบสิทธิ์การเข้าถึงบริษัทนั้น
8. ถ้ามีสิทธิ์ → เข้าสู่แอป
9. ถ้าไม่มีสิทธิ์ → แสดงข้อความ "ไม่มีสิทธิ์เข้าถึงบริษัทนี้"

### API Endpoints สำหรับ Multi-Company

#### 1. User Search API (ค้นหาบริษัทของผู้ใช้)
```
POST https://search.user.dataslot.app/indexes/users/search
Authorization: Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi
```

Request Body:
```json
{
  "limit": 10,
  "filter": ["lUId = {LINE_USER_ID}"],
  "sort": []
}
```

Response:
```json
{
  "hits": [
    {
      "id": "WFM_ATMBAY_...",
      "module": "WFM",
      "company": "ATMBAY",
      "lUId": "U25fdbff...",
      "status": "ACTIVE",
      "employeeNumber": "1443",
      "userInfo": {
        "displayName": "...",
        "email": "...",
        "pictureUrl": "..."
      }
    }
  ]
}
```

#### 2. Authorization Check (ตรวจสอบสิทธิ์ในบริษัท)
```
POST https://open-api.dataslot.app/search/wfm/v1/{companyName}
```

#### 3. Clock In/Out API (บันทึกเวลาทำงาน)
```
POST https://api.dataslot.app/wfm/{companyName}/tasks
```

**หมายเหตุ**: `{companyName}` จะถูกแทนที่ด้วยชื่อบริษัทที่ผู้ใช้เลือก เช่น `ATMBAY`, `JNLVision` เป็นต้น

---

## 📍 Clock In/Out System

### การทำงาน

1. **Clock In**
   - ตรวจสอบว่าอยู่ภายใน 50 เมตรจากสำนักงาน
   - ตรวจสอบว่ายังไม่ได้ Check-in วันนี้
   - บันทึกเวลาและตำแหน่ง GPS
   - สร้างรายการใน workflow `EMPLOYEE_CICO`

2. **Clock Out** (Coming soon)
   - ตรวจสอบว่า Check-in แล้ว
   - บันทึกเวลาออกงาน
   - อัพเดทสถานะเป็น "COMPLETED"

### GPS Validation

- **ระยะห่างสูงสุด**: 50 เมตร
- **การคำนวณ**: Haversine formula
- **ข้อความแจ้งเตือน**: ถ้าอยู่ไกลเกินไป จะแสดงระยะห่างจริง

---

## 🌐 API Endpoints

### 1. User Search (ค้นหาบริษัท)
```
POST https://search.user.dataslot.app/indexes/users/search
Authorization: Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi
```

### 2. Authorization Check (Dynamic Company)
```
POST https://open-api.dataslot.app/search/wfm/v1/{companyName}
```

### 3. Create Clock In (Dynamic Company)
```
POST https://api.dataslot.app/wfm/{companyName}/tasks
```

**หมายเหตุ**: ทุก API ที่เกี่ยวข้องกับข้อมูลบริษัทจะใช้ `{companyName}` แบบ dynamic ตามบริษัทที่ผู้ใช้เลือก

---

## 🐛 การแก้ปัญหา

### ปัญหา: "Cannot find module"

**แก้ไข**:
```bash
rm -rf node_modules
npm install
```

### ปัญหา: "Metro bundler error"

**แก้ไข**:
```bash
npx expo start --clear
```

### ปัญหา: "Location permission denied"

**แก้ไข**:
- iOS: Settings → Privacy → Location Services → Expo Go → "While Using"
- Android: Settings → Apps → Expo Go → Permissions → Location → Allow

### ปัญหา: "LINE Login ไม่ทำงาน"

**ตรวจสอบ**:
1. ทดสอบบนมือถือจริง (ไม่ใช่ web browser)
2. ตรวจสอบว่าติดตั้ง LINE app แล้ว
3. ดู console logs เพื่อหาข้อผิดพลาด

### ปัญหา: "Invalid redirect custom scheme" หรือ "Indirect URL" error

**สาเหตุ**: LINE Developers Console ไม่ได้ตั้งค่า Callback URL ที่ถูกต้อง

**แก้ไข** (ต้องตั้งค่า 2 ส่วน):

**ส่วนที่ 1 - App settings**:
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. เลือก Channel ของคุณ → แท็บ **LINE Login** → **App settings**
3. ตั้งค่า:
   - **iOS URL scheme**: `natively` (ใส่แค่คำว่า natively)
   - **Android URL scheme**: `natively`
   - **iOS Bundle ID**: `com.dataslot.hr`
   - **Android Package Name**: `com.dataslot.hr`

**ส่วนที่ 2 - Callback URL** (สำคัญมาก!):
1. ในหน้าเดียวกัน เลื่อนขึ้นไปหาส่วน **Callback URL**
2. กด **Add** หรือ **Edit**
3. เพิ่ม: `natively://line-callback` (ใส่ URL เต็ม)
4. กด **Update**
5. รอ 5-10 นาที
6. ทดสอบใหม่บน TestFlight

**หมายเหตุ**: 
- ต้องตั้งค่า **ทั้ง 2 ส่วน** (App settings และ Callback URL)
- App settings ใส่แค่ `natively` (ไม่มี `://`)
- Callback URL ใส่ `natively://line-callback` (URL เต็ม)
- ดูรายละเอียดเพิ่มเติมใน `QUICK_FIX.md`

### ปัญหา: "ไม่พบบริษัทในระบบ"

**ตรวจสอบ**:
1. LINE User ID ของคุณลงทะเบียนในระบบแล้วหรือไม่
2. ตรวจสอบ API Token ที่ใช้ในการเรียก User Search API
3. ดู console logs เพื่อดูข้อมูลที่ได้จาก API

### ปัญหา: "ไม่สามารถ Check-in ได้"

**ตรวจสอบ**:
1. เลือกบริษัทแล้วหรือยัง
2. Location permission เปิดอยู่หรือไม่
3. อยู่ภายใน 50 เมตรจากสำนักงานหรือไม่
4. Check-in ไปแล้ววันนี้หรือยัง
5. มีอินเทอร์เน็ตหรือไม่

### ปัญหา: "No company selected"

**แก้ไข**:
1. ออกจากระบบและเข้าสู่ระบบใหม่
2. เลือกบริษัทที่ต้องการใช้งาน
3. ถ้ายังมีปัญหา ลบแอปและติดตั้งใหม่

---

## 📚 เทคโนโลยีที่ใช้

- **React Native** - Framework สำหรับสร้างแอปมือถือ
- **Expo** - Development platform
- **TypeScript** - Type-safe JavaScript
- **Expo Router** - File-based routing
- **LINE Login** - OAuth 2.0 authentication
- **AsyncStorage** - Local data storage
- **Expo Location** - GPS และ location services

---

## 📋 ข้อกำหนดระบบ

### Development

- **Node.js**: 18.x หรือสูงกว่า
- **npm**: 9.x หรือสูงกว่า
- **Expo CLI**: 54.x

### Production (Build)

- **iOS**: iOS 13.0 หรือสูงกว่า
- **Android**: Android 5.0 (API 21) หรือสูงกว่า

---

## 🔒 ความปลอดภัย

- ✅ LINE OAuth 2.0 authentication
- ✅ CSRF protection (state parameter)
- ✅ Secure token exchange
- ✅ GPS validation
- ✅ Company-based authorization
- ✅ Multi-company data isolation
- ⚠️ **หมายเหตุ**: Channel Secret และ API Token อยู่ใน code (ควรย้ายไป environment variables)

## 🏢 Multi-Company Architecture

### Data Flow

```
1. LINE Login
   ↓
2. Fetch User Companies (User Search API)
   ↓
3. Company Selection (if multiple)
   ↓
4. Authorization Check (Company-specific)
   ↓
5. Store Selected Company
   ↓
6. All API calls use selected company
```

### Company Storage

- **Selected Company**: เก็บใน AsyncStorage (`selectedCompany`)
- **Company Info**: เก็บข้อมูล company, module, status, role
- **Auto-clear**: ล้างข้อมูลเมื่อ logout

### API Pattern

ทุก API ที่เกี่ยวข้องกับข้อมูลบริษัทจะใช้รูปแบบ:
```
https://api.dataslot.app/{module}/{companyName}/{endpoint}
```

ตัวอย่าง:
- `https://api.dataslot.app/wfm/ATMBAY/tasks`
- `https://api.dataslot.app/wfm/JNLVision/tasks`
- `https://open-api.dataslot.app/search/wfm/v1/ATMBAY`

---

## 📝 License

Private - JNL Vision Company

---

## 👥 ติดต่อ

สำหรับคำถามหรือปัญหา กรุณาติดต่อทีม IT

---

## 🚀 Quick Start

สำหรับผู้ที่รีบ:

```bash
# 1. Clone และติดตั้ง
git clone <repo-url>
cd hr-app
npm install

# 2. รันแอป
npm run dev

# 3. สแกน QR Code ด้วย Expo Go
```

---

**สร้างด้วย ❤️ โดย JNL Vision Development Team**

# DataslotHr
