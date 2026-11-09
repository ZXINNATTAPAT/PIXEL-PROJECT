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

## ข้อมูลสถานะจริงจาก Notion

ตอนนี้หน้าเว็บดึงสถานะ agent จากกระดาน Notion ชื่อ **"Agent Status Board"** (อยู่ใต้หน้า SERVER NEXUS)
- ตอนรัน `npm run dev` หรือ `npm run preview` ตัวเซิร์ฟเวอร์ Vite จะเปิดเส้นทาง `/api/agents` ให้ เส้นทางนี้อ่านกระดาน Notion ฝั่งเซิร์ฟเวอร์ และเก็บผลไว้ราว 15 วินาที
- หน้าเว็บจะดึง `/api/agents` ตอนเปิด และดึงซ้ำทุก 30 วินาที ป้ายมุมขวาบนจะขึ้น **LIVE · Notion** และบอกเวลาที่ดึงล่าสุด
- ระบบจับคู่แถวใน Notion กับตัวละครด้วยช่อง `Agent ID` ก่อน (เทียบกับ `agentId` ใน `src/data/agents.json`) ถ้าไม่ตรงจะเทียบด้วยชื่อ
- ถ้าช่อง Current Task ว่าง จะแสดงข้อความแทนตามสถานะ เช่น "No current task"

### ไฟล์ `.env.local` (ห้ามแชร์ ห้าม commit)
```
NOTION_TOKEN=<โทเคนของ integration pixel-office>
NOTION_DATABASE_ID=0485c7b4-b530-480f-80b1-85e449ba42c7
```
- ไฟล์นี้อยู่ที่รากโปรเจกต์ และถูก git ข้ามไว้แล้ว (`*.local` ใน `.gitignore`)
- ตัวแปรเหล่านี้ไม่มีคำนำหน้า `VITE_` จึงอยู่แค่ฝั่งเซิร์ฟเวอร์ ไม่ถูกใส่ลงในไฟล์ที่เบราว์เซอร์โหลด
- ห้ามส่งไฟล์นี้ให้ใคร ห้ามวางในแชท และห้ามตั้งชื่อตัวแปรขึ้นต้นด้วย `VITE_`
- ถ้าเปลี่ยนโทเคน ให้แก้ไฟล์นี้แล้วรีสตาร์ต `npm run dev`
- ถ้าโทเคนหลุด ให้ไปกด Refresh/ลบโทเคนที่ https://www.notion.so/profile/integrations

### เปลี่ยนสถานะแล้วดูผล
1. เปิด Agent Status Board ใน Notion
2. แก้ช่อง **Status** (idle / working / waiting / done / blocked) หรือพิมพ์ใน **Current Task**
3. รอประมาณ 30–45 วินาที หน้า Pixel Office จะเปลี่ยนเอง (หรือกดรีเฟรชหน้า)

### ถ้า Notion ใช้ไม่ได้
- ถ้าไม่มี `.env.local`, โทเคนผิด, กระดานยังไม่ได้แชร์ให้ integration หรือเน็ตหลุด `/api/agents` จะตอบ 502
- หน้าเว็บจะถอยไปใช้ข้อมูลตัวอย่างใน `src/data/agents.json` และป้ายจะขึ้น **SAMPLE DATA (offline)** แล้วจะลองดึงใหม่ทุก 30 วินาที
- ตรวจได้ด้วย `curl http://localhost:5173/api/agents`
- ถ้า build แล้วเปิดไฟล์ใน `dist/` ด้วยเว็บเซิร์ฟเวอร์อื่น (ไม่ใช่ `npm run preview`) จะไม่มี `/api/agents` และจะแสดงข้อมูลตัวอย่าง
