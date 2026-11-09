# Pixel Office: วิธีรัน

โฟลเดอร์โปรเจกต์: `/Volumes/NATTAZXIN/MYPJ/pixel-office`
ต้องมี Node.js 20 ขึ้นไป (ตอนนี้ใช้ 22.18.0) และต้องเสียบไดรฟ์ NATTAZXIN ไว้

## ครั้งแรก (หรือหลังลบ node_modules)
```bash
cd /Volumes/NATTAZXIN/MYPJ/pixel-office
npm install
```

## 1) โหมดพัฒนา (แก้โค้ดแล้วหน้าเว็บรีเฟรชเอง)
```bash
npm run dev
```
เปิด http://localhost:5173/ แล้วกด `Ctrl + C` ในเทอร์มินัลเพื่อหยุด

## 2) เปิดดูบน iPad ผ่าน Wi‑Fi บ้าน
```bash
npm run dev -- --host 0.0.0.0
```
- ใน Terminal จะมีบรรทัด `Network: http://192.168.x.x:5173/` ให้เปิด URL นั้นใน Safari บน iPad
- Mac กับ iPad ต้องต่อ Wi‑Fi เดียวกัน
- คำเตือน: ทุกเครื่องในเครือข่ายนี้จะเข้าได้ ใช้แค่ใน Wi‑Fi บ้าน และกด `Ctrl + C` หยุดเมื่อใช้เสร็จ
- บน iPad กดแชร์ > "เพิ่มไปยังหน้าจอโฮม" เพื่อให้เปิดได้เหมือนแอป

## 3) build เวอร์ชันจริง แล้วลองเปิดดู
```bash
npm run build      # สร้างไฟล์ไว้ในโฟลเดอร์ dist/
npm run preview    # เปิดเวอร์ชันที่ build แล้วที่ http://localhost:4173/
```
ถ้าต้องการให้ iPad เปิดได้ ให้รัน `npm run preview -- --host 0.0.0.0`

## 4) ตรวจโค้ด
```bash
npx tsc --noEmit
```

## รันไว้เบื้องหลัง (ปิด Terminal แล้วยังรันอยู่)
```bash
nohup npm run dev > dev-server.log 2>&1 &
```
หยุดด้วย:
```bash
kill $(lsof -ti tcp:5173)
```

## แก้ข้อมูล agent
แก้สถานะและงานของ agent แต่ละตัวได้ที่ `src/data/agents.json`
สถานะที่ใช้ได้มี `idle`, `working`, `waiting`, `done`, `blocked`
ตอนนี้เป็นข้อมูลตัวอย่างทั้งหมด และหน้าเว็บอัปเดตเองเมื่อรันด้วย `npm run dev`

## ปัญหาที่เจอบ่อย
- **Port 5173 is in use:** ให้หยุดตัวเก่าด้วย `kill $(lsof -ti tcp:5173)`
- **npm หรือ node หาไม่เจอ:** ให้รัน `nvm use 22`
- **iPad เปิดไม่ได้:** ดูว่าใช้ Wi‑Fi เดียวกันไหม รันพร้อม `--host 0.0.0.0` หรือยัง และ firewall ของ macOS อนุญาต node หรือยัง

## ย้อนกลับเวอร์ชัน (git)
```bash
git status         # ดูว่าแก้ไฟล์ไหนไปบ้าง
git log --oneline  # ดูประวัติ
git restore .      # ยกเลิกการแก้ไขที่ยังไม่ได้ commit
```
