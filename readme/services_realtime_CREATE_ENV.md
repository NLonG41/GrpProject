# Tạo file .env cho Service B

**Bước 1:** Tạo file `.env` trong thư mục `services/realtime/`

**Bước 2:** Copy nội dung sau vào file `.env`:

```env
PORT=5002
FIREBASE_PROJECT_ID=web-portal-us
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDUdDMkkvPvN0jU\nJWFXGlgPx7UGFmyNEqopoYJrQUGezyFL7p4DX+gR9358Z+OVmiFkeUUkT6LaPm6d\noYB7uTsX3XZdEPvsQU9Ae5sp43lJCYGwd5n39hodJGdNVR8pEWSOO7ilpNPvyWFV\nd6wm0BBH+vQgWSDuFD45bnGdk2cKkaWmsFPZI64Xo7Eg7nHZmVLm9p4JgpG6vwjU\nY4TLi+H7vGU5l33bHpA2pvBCTiv+/4lTHnarUYWgf6s91TI28EW+O7wffxSBTL4U\nCm4jiWhQeJCdxrU4Is6G8iyVMDDk53DUxAoJrJArMJbcKx37jF3SgZE74T5LHvE3\nGHUn75n7AgMBAAECggEAFTwqEnlHvXzKoD2+PX0KGUWuT9X08qLPdErK5NqIaw2r\n99F5ZL/0y7rvnxKpOj5GIStH4Gm/Ts4Xs1S9qWApymhd2M6GR6Z9e+X+69BrQoQb\nPN6veovUL16AnsenziyJXvgULCZN8rUvr+G+yMBaKD+qoAMYmgNW9tmVrJjbn0Ah\nyyQZW8SEK8OITZ9Th7C/hSrb0Ipu1vCS40YvugmSV38lZF4zGJ+X89jaVSN84J9t\nN7oMNLDsL6EbZdzjC6rJjUehqM7wiAESGNgdvme4ncsATNp/7RjiSF6MRdxciGRa\nTH9N7c5AkTih5BXHC3+0icHxzMZXv91nz7c30i3nPQKBgQD7yEXcVGxC+kSbDumq\nSRGXom2sDd6/z1pFVdLD+OFCDXsME0hbV4HurR8M2OhlLi1mngL31LgPt8y5p18E\n8c5set6Mt+kOJK1/bstHJe9a0rZwlVPzTU+J/fg829Ua71m6EkBXcoW2yYKo4qy8\nb9AlwKZyB+u2yi7J0AJzlCa0tQKBgQDYA0YBG7X0jTaYf0O2qVDzhzE6im6irPIR\nVILrI41vmrharFpzPihSsZOvCyQotZHLgwPGo+gJpxIQ1Yv30x62sYGwbs/o+aA8\nwN5dY/nM3sqzI7cPZDzehhdH2vDPJ3Hme8sZ+ZH0nz5jWIg0b4JMr7lpi8S8WkLr\nqaPFYIVx7wKBgHFC2TJRA9ZpUH1UCwbgEbrdhWpVXvN36kqwXbxsc6BMAiMfdXgp\neDiOxh34YSpKyH+V6w3jMd1YOA733IWT5ODlsMEqZftHwohFpcnepbp8eTdR5U7Y\nY0RW69kspsOUEg/i7/CmgsIECfPA7CVkQwUIkZdQOteiQcPk/4VQiszVAoGBAKA7\n3WPZEGH1ljgMv0fx1PCwqh3IrkTRkUa1r9+IodPVq0bnbrjptLOSsgA4fXwNI7cY\n2mYxE2CFo+sE3SzaWIAgsBkWOfeRpAEs+EXCcXw9D5NOvO4X5ucSBJbym4qusdjM\nn14HOPOCZJ8A/xgWV0tXVmwql6c4NUfmsGsrLBHVAoGAKC3OoSJq+FO7+o7WKN3K\nI1+XAfiudQBG9qJbFP8jMiFdcBXfBCvn+KCXUy1hweIjAtgwtJgAOJ18jL1ElRtV\nIKDKAzujiCEuxvQ1m8K6lizSQnx9mjknYPuRjVcULhIQjk0nvhBAXsQ2qTWgySET\nG6WPpMETjCBBiOmZ74bZuds=\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@web-portal-us.iam.gserviceaccount.com
```

**Lưu ý:**
- Giữ nguyên dấu ngoặc kép `"` quanh `FIREBASE_PRIVATE_KEY`
- Giữ nguyên các ký tự `\n` trong private key
- File `.env` đã được thêm vào `.gitignore` (không commit vào git)

**Sau khi tạo file .env, chạy:**
```bash
cd services/realtime
npm run dev
```

Service sẽ chạy trên `http://localhost:5002`

