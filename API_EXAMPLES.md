# API Examples - Multi-Company HR App

## 📝 คู่มือการใช้งาน API

เอกสารนี้แสดงตัวอย่างการเรียกใช้ API ทั้งหมดในระบบ Multi-Company

---

## 🔑 Authentication

### API Token
```
Authorization: Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi
```

**หมายเหตุ**: Token นี้ใช้สำหรับ User Search API เท่านั้น

---

## 1️⃣ User Search API - ค้นหาบริษัทของผู้ใช้

### Endpoint
```
POST https://search.user.dataslot.app/indexes/users/search
```

### Headers
```http
Content-Type: application/json
Authorization: Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi
```

### Request Body
```json
{
  "limit": 10,
  "filter": [
    "lUId = U25fdbff3c9333d90b00828c6dc6c47f1"
  ],
  "sort": []
}
```

### cURL Example
```bash
curl --location 'https://search.user.dataslot.app/indexes/users/search' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi' \
--data '{
    "limit": 10,
    "filter": [
        "lUId = U25fdbff3c9333d90b00828c6dc6c47f1"
    ],
    "sort": []
}'
```

### Response Example
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
      "lastActiveTimestamp": 1747295696300,
      "registerTimestamp": 1703133795561,
      "employeeNumber": "1443 นวลนคร SK",
      "userInfo": {
        "email": "user@example.com",
        "displayName": "John Doe",
        "pictureUrl": "https://profile.line-scdn.net/..."
      },
      "firstName": "",
      "lastName": "",
      "teamId": ""
    },
    {
      "id": "WFM_JNLVision_abc123...",
      "module": "WFM",
      "company": "JNLVision",
      "gUId": "abc123...",
      "lUId": "U25fdbff3c9333d90b00828c6dc6c47f1",
      "role": "Manager",
      "status": "ACTIVE",
      "employeeNumber": "EMP-001",
      "userInfo": {
        "email": "user@example.com",
        "displayName": "John Doe",
        "pictureUrl": "https://profile.line-scdn.net/..."
      }
    }
  ],
  "estimatedTotalHits": 2,
  "query": "",
  "limit": 10,
  "offset": 0,
  "processingTimeMs": 1
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (format: `{MODULE}_{COMPANY}_{GUID}`) |
| `module` | string | Module name (e.g., "WFM") |
| `company` | string | **Company name** (ใช้สำหรับ API อื่นๆ) |
| `gUId` | string | Global Unique ID |
| `lUId` | string | LINE User ID |
| `role` | string | User role (e.g., "Employee", "Manager") |
| `status` | string | Status ("ACTIVE", "INACTIVE", "Resign") |
| `employeeNumber` | string | Employee number/code |
| `userInfo` | object | User information from LINE |

---

## 2️⃣ Authorization Check - ตรวจสอบสิทธิ์ในบริษัท

### Endpoint (Dynamic)
```
POST https://open-api.dataslot.app/search/wfm/v1/{companyName}
```

### ตัวอย่าง URL
```
# สำหรับบริษัท ATMBAY
POST https://open-api.dataslot.app/search/wfm/v1/ATMBAY

# สำหรับบริษัท JNLVision
POST https://open-api.dataslot.app/search/wfm/v1/JNLVision
```

### Headers
```http
Content-Type: application/json
Accept: application/json
```

### Request Body
```json
{
  "hitsPerPage": 500,
  "page": 1,
  "filter": [
    "company = ATMBAY",
    "workflowId IN [ \"EMPLOYEE\" ]",
    "type = TASK",
    "detail.userInfo.assignee.lUId = U25fdbff3c9333d90b00828c6dc6c47f1"
  ],
  "sort": ["timestamp:desc"]
}
```

### cURL Example (ATMBAY)
```bash
curl --location 'https://open-api.dataslot.app/search/wfm/v1/ATMBAY' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
  "hitsPerPage": 500,
  "page": 1,
  "filter": [
    "company = ATMBAY",
    "workflowId IN [ \"EMPLOYEE\" ]",
    "type = TASK",
    "detail.userInfo.assignee.lUId = U25fdbff3c9333d90b00828c6dc6c47f1"
  ],
  "sort": ["timestamp:desc"]
}'
```

### cURL Example (JNLVision)
```bash
curl --location 'https://open-api.dataslot.app/search/wfm/v1/JNLVision' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
  "hitsPerPage": 500,
  "page": 1,
  "filter": [
    "company = JNLVision",
    "workflowId IN [ \"EMPLOYEE\" ]",
    "type = TASK",
    "detail.userInfo.assignee.lUId = U25fdbff3c9333d90b00828c6dc6c47f1"
  ],
  "sort": ["timestamp:desc"]
}'
```

### Response Example
```json
{
  "hits": [
    {
      "id": "task-123",
      "company": "ATMBAY",
      "workflowId": "EMPLOYEE",
      "type": "TASK",
      "status": "ACTIVE",
      "timestamp": 1700000000000,
      "detail": {
        "userInfo": {
          "employeeNumber": "1443",
          "name": "John Doe",
          "phoneNumber": "+66812345678",
          "assignee": {
            "lUId": "U25fdbff3c9333d90b00828c6dc6c47f1",
            "userInfo": {
              "email": "user@example.com"
            }
          }
        },
        "jobDescription": {
          "department": {
            "name": "Engineering",
            "code": "ENG"
          },
          "position": {
            "name": "Software Engineer",
            "id": "pos-001"
          },
          "division": {
            "name": "Technology"
          },
          "branch": "Bangkok",
          "basicWage": 50000,
          "startTimestamp": 1600000000000
        },
        "workLocation": {
          "alias": "Head Office",
          "address": "123 Main St, Bangkok",
          "geoLocation": {
            "lat": 13.7563,
            "lng": 100.5018
          },
          "items": [
            {
              "id": "loc-001",
              "gUId": "loc-guid-001",
              "alias": "Head Office",
              "address": "123 Main St, Bangkok",
              "isPrimary": true,
              "geoLocation": {
                "lat": 13.7563,
                "lng": 100.5018
              }
            }
          ]
        },
        "taskInfo": {
          "gUId": "task-guid-123"
        }
      }
    }
  ],
  "nbHits": 1,
  "page": 1,
  "nbPages": 1,
  "hitsPerPage": 500
}
```

---

## 3️⃣ Clock In API - บันทึกเวลาเข้างาน

### Endpoint (Dynamic)
```
POST https://api.dataslot.app/wfm/{companyName}/tasks
```

### ตัวอย่าง URL
```
# สำหรับบริษัท ATMBAY
POST https://api.dataslot.app/wfm/ATMBAY/tasks

# สำหรับบริษัท JNLVision
POST https://api.dataslot.app/wfm/JNLVision/tasks
```

### Headers
```http
Content-Type: application/json
Accept: application/json
```

### Request Body
```json
{
  "ref1": "task-123",
  "ref2": "1700000000000",
  "status": "WORKING",
  "workflowId": "EMPLOYEE_CICO",
  "detail": {
    "workLocation": {
      "address": "123 Main St, Bangkok",
      "geoLocation": {
        "lat": 13.7563,
        "lng": 100.5018
      },
      "by": "John Doe",
      "alias": "Head Office",
      "gUId": "loc-guid-001",
      "id": "loc-001",
      "timestamp": 1700123456789
    },
    "assignees": [
      {
        "index": "0,task-guid-123",
        "userInfo": {
          "displayName": "John Doe",
          "pictureUrl": "https://profile.line-scdn.net/..."
        },
        "gUId": "task-guid-123",
        "role": "Employee",
        "roleInfo": {
          "roleEn": "Employee",
          "roleTh": "พนักงาน"
        },
        "lUId": "U25fdbff3c9333d90b00828c6dc6c47f1"
      }
    ],
    "taskInfo": {
      "gUId": "task-guid-123",
      "createBy": "John Doe",
      "isCopied": false,
      "createdDate": 1700123456789
    },
    "checkInInfo": {
      "images": [],
      "location": {
        "lng": 100.5018,
        "lat": 13.7563
      },
      "distance": 0.025,
      "timestamp": 1700123456789
    }
  }
}
```

### cURL Example (ATMBAY)
```bash
curl --location 'https://api.dataslot.app/wfm/ATMBAY/tasks' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
  "ref1": "task-123",
  "ref2": "1700000000000",
  "status": "WORKING",
  "workflowId": "EMPLOYEE_CICO",
  "detail": {
    "workLocation": {
      "address": "123 Main St, Bangkok",
      "geoLocation": {
        "lat": 13.7563,
        "lng": 100.5018
      },
      "by": "John Doe",
      "alias": "Head Office",
      "gUId": "loc-guid-001",
      "id": "loc-001",
      "timestamp": 1700123456789
    },
    "checkInInfo": {
      "images": [],
      "location": {
        "lng": 100.5018,
        "lat": 13.7563
      },
      "distance": 0.025,
      "timestamp": 1700123456789
    }
  }
}'
```

### Response Example
```json
{
  "id": "cico-task-456",
  "ref1": "task-123",
  "ref2": "1700000000000",
  "status": "WORKING",
  "workflowId": "EMPLOYEE_CICO",
  "company": "ATMBAY",
  "createdAt": 1700123456789,
  "updatedAt": 1700123456789
}
```

---

## 4️⃣ Check Today's Clock In - ตรวจสอบว่า Check-in วันนี้แล้วหรือยัง

### Endpoint (Dynamic)
```
POST https://open-api.dataslot.app/search/wfm/v1/{companyName}
```

### Request Body
```json
{
  "hitsPerPage": 10,
  "page": 1,
  "filter": [
    "company = ATMBAY",
    "workflowId IN [ \"EMPLOYEE_CICO\" ]",
    "type = TASK",
    "ref1 = task-123",
    "ref2 = 1700000000000",
    "status IN [ \"WORKING\" ]"
  ],
  "sort": ["timestamp:desc"]
}
```

### cURL Example
```bash
curl --location 'https://open-api.dataslot.app/search/wfm/v1/ATMBAY' \
--header 'Content-Type: application/json' \
--data '{
  "hitsPerPage": 10,
  "page": 1,
  "filter": [
    "company = ATMBAY",
    "workflowId IN [ \"EMPLOYEE_CICO\" ]",
    "type = TASK",
    "ref1 = task-123",
    "ref2 = 1700000000000",
    "status IN [ \"WORKING\" ]"
  ],
  "sort": ["timestamp:desc"]
}'
```

### Response Example (Already Checked In)
```json
{
  "hits": [
    {
      "id": "cico-task-456",
      "company": "ATMBAY",
      "workflowId": "EMPLOYEE_CICO",
      "status": "WORKING",
      "ref1": "task-123",
      "ref2": "1700000000000",
      "detail": {
        "checkInInfo": {
          "timestamp": 1700123456789,
          "location": {
            "lat": 13.7563,
            "lng": 100.5018
          }
        }
      }
    }
  ],
  "nbHits": 1
}
```

### Response Example (Not Checked In)
```json
{
  "hits": [],
  "nbHits": 0
}
```

---

## 🧪 Testing Flow

### Complete Flow Example

```bash
# Step 1: ค้นหาบริษัทของผู้ใช้
curl --location 'https://search.user.dataslot.app/indexes/users/search' \
--header 'Authorization: Bearer OGU5Yjk0NDY4MTRjMmRjMWZkZTc0OWZi' \
--header 'Content-Type: application/json' \
--data '{
    "limit": 10,
    "filter": ["lUId = U25fdbff3c9333d90b00828c6dc6c47f1"],
    "sort": []
}'

# Response: จะได้ company = "ATMBAY"

# Step 2: ตรวจสอบสิทธิ์ในบริษัท ATMBAY
curl --location 'https://open-api.dataslot.app/search/wfm/v1/ATMBAY' \
--header 'Content-Type: application/json' \
--data '{
  "hitsPerPage": 500,
  "page": 1,
  "filter": [
    "company = ATMBAY",
    "workflowId IN [ \"EMPLOYEE\" ]",
    "type = TASK",
    "detail.userInfo.assignee.lUId = U25fdbff3c9333d90b00828c6dc6c47f1"
  ],
  "sort": ["timestamp:desc"]
}'

# Response: จะได้ข้อมูล employee และ work location

# Step 3: ตรวจสอบว่า Check-in วันนี้แล้วหรือยัง
curl --location 'https://open-api.dataslot.app/search/wfm/v1/ATMBAY' \
--header 'Content-Type: application/json' \
--data '{
  "hitsPerPage": 10,
  "page": 1,
  "filter": [
    "company = ATMBAY",
    "workflowId IN [ \"EMPLOYEE_CICO\" ]",
    "type = TASK",
    "ref1 = task-123",
    "ref2 = 1700000000000",
    "status IN [ \"WORKING\" ]"
  ],
  "sort": ["timestamp:desc"]
}'

# Response: ถ้า hits = [] แสดงว่ายังไม่ได้ Check-in

# Step 4: Clock In
curl --location 'https://api.dataslot.app/wfm/ATMBAY/tasks' \
--header 'Content-Type: application/json' \
--data '{
  "ref1": "task-123",
  "ref2": "1700000000000",
  "status": "WORKING",
  "workflowId": "EMPLOYEE_CICO",
  "detail": { ... }
}'

# Response: สร้าง Clock In record สำเร็จ
```

---

## 📝 Important Notes

### 1. Company Name Format
- ใช้ชื่อบริษัทตรงตามที่ได้จาก User Search API
- Case-sensitive (ต้องตรงตัวพิมพ์เล็ก-ใหญ่)
- ตัวอย่าง: `ATMBAY`, `JNLVision`

### 2. LINE User ID (lUId)
- Format: `U25f...` (ขึ้นต้นด้วย U)
- ได้จาก LINE Login
- ใช้สำหรับค้นหาและ filter ข้อมูล

### 3. Timestamps
- ใช้ Unix timestamp (milliseconds)
- `ref2` = midnight ของวันนั้น (00:00:00)
- ตัวอย่าง: `1700000000000`

### 4. GPS Distance
- หน่วยเป็น kilometers
- ตัวอย่าง: `0.025` = 25 เมตร
- Maximum: `0.05` = 50 เมตร

---

## 🔍 Troubleshooting

### Error: "No companies found"
- ตรวจสอบ LINE User ID ถูกต้องหรือไม่
- ตรวจสอบ Authorization token
- ตรวจสอบว่า user ลงทะเบียนในระบบแล้ว

### Error: "Not authorized"
- ตรวจสอบว่า user มีสิทธิ์ในบริษัทนั้นหรือไม่
- ตรวจสอบ filter ใน Authorization Check API

### Error: "Already checked in"
- ตรวจสอบว่า Check-in ไปแล้ววันนี้หรือยัง
- ตรวจสอบ `ref2` (midnight timestamp) ถูกต้องหรือไม่

---

## 📚 Additional Resources

- [Postman Collection](./postman_collection.json) (if available)
- [API Documentation](https://api.dataslot.app/docs)
- [Support](mailto:support@example.com)

---

**Last Updated**: November 17, 2024  
**Version**: 2.0.0

