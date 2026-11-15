---
name: pixel-office
description: Maintain the Tensura-themed pixel-office repository, including its merged floorplan, animated characters, personal computers, bottom people dock, and Notion status feed. Use when developing or adjusting this project's web app.
---

# Pixel Office / Tempest Office

ใช้สกิลนี้กับโปรเจกต์นี้โดยเฉพาะ แนวทางด้านภาพและเลย์เอาต์อยู่ใน [THEME.md](THEME.md) ให้อ่านก่อนแก้ UI, ห้อง, ตัวละคร หรือแอสเซ็ต คำขอใหม่ของผู้ใช้ปรับเปลี่ยนแนวทางเดิมได้

## จุดแก้ไขหลัก

- [src/App.tsx](src/App.tsx): โหลดสถานะเอเจนต์ จัดหน้า และสลับเต็มจอ
- [src/components/TensuraOffice.tsx](src/components/TensuraOffice.tsx): แผนที่ การเลือกเอเจนต์ การเดิน และวงจรแอนิเมชัน
- [src/game/campus.ts](src/game/campus.ts): ขนาดห้อง จุดประจำโต๊ะ ประตู และเส้นทางเดิน
- [src/components/PersonalWorkstation.tsx](src/components/PersonalWorkstation.tsx): คอมประจำตัว เลเยอร์บังตัวละคร และเอฟเฟกต์บนโต๊ะ
- [src/game/raster-sprites.ts](src/game/raster-sprites.ts): โหลดและแบ่งภาพตัวละครเป็นเฟรม
- [src/game/tensura-look.ts](src/game/tensura-look.ts): จับคู่ชื่อกับธีมตัวละคร และเลือกก็อบลินเมื่อไม่ทราบตัวตน
- [src/components/CharacterAvatar.tsx](src/components/CharacterAvatar.tsx): ภาพตัวละครในรายชื่อ
- [src/components/OfficeEffects.tsx](src/components/OfficeEffects.tsx): จอเวทและเอฟเฟกต์ในภาพฉาก
- [src/components/SidePanel.tsx](src/components/SidePanel.tsx): แถบ Our people ด้านล่าง
- [src/components/TensuraOffice.css](src/components/TensuraOffice.css): ธีม เลย์เอาต์ และแอนิเมชัน CSS; ตรวจ [src/App.css](src/App.css) ด้วยเมื่อมีสไตล์ชนกัน
- [server/notion-agents.ts](server/notion-agents.ts): middleware อ่านสถานะจาก Notion; ชุดตัวอย่างอยู่ใน [src/data/agents.json](src/data/agents.json)

หน้าเว็บปัจจุบันใช้ภาพ PNG, Canvas 2D ของตัวละคร และ SVG/CSS สำหรับเอฟเฟกต์ ส่วน `src/game/scene.ts`, `world.ts` และ `sprites.ts` เป็นฉาก Pixi เดิม ตรวจตัวเรียกก่อนเลือกแก้ไฟล์เหล่านั้น

## วิธีทำงานกับฉาก

1. รักษาเลเยอร์แยกกัน: ฉากรวม → โต๊ะ/เก้าอี้ → ตัวละครที่เคลื่อนที่ → เอฟเฟกต์และ UI ให้การบังด้านหน้า/ด้านหลังยังถูกต้อง
2. เอเจนต์แต่ละคนต้องมีโต๊ะคอมพร้อมชื่อเจ้าของ คลิกคอมแล้วเจ้าของเดินกลับจุดของตัวเอง การเลือกจากแผนที่และ Our people ต้องตรงกัน
3. เมื่อต้องเพิ่มพื้นที่ ให้ขยายห้องและระยะวางโต๊ะโดยคงขนาดโต๊ะกับตัวละคร ตรวจทั้ง `roomHomes`, `lanes`, ประตู, hit target และการ fit/zoom
4. พิกัดต้นแบบใน `campus.ts` ถูกคูณ `ROOM_SCALE` ใน `add()` แล้ว ส่วนค่าจาก `nodeById` เป็นพิกัดโลกที่คูณแล้ว อย่าคูณซ้ำ
5. ตรวจจำนวนช่องโต๊ะให้พอกับเอเจนต์จริง: `homeFor()` วนด้วย modulo คนที่เกินจำนวนช่องจึงอาจใช้โต๊ะซ้ำ ต้องเพิ่มช่องและเส้นทางให้ครบเมื่อเพิ่มคน
6. ใช้ภาพเจนรายละเอียดสูงตาม THEME.md สำหรับหน้าหลัก รักษารูปในรายชื่อให้เป็นตัวเดียวกับบนแผนที่; ตัวตนที่ไม่แน่ใจใช้ก็อบลิน
7. หากต้องสร้างหรือแก้ภาพ raster ให้ใช้สกิล imagegen เมื่อมีให้ใช้ อ่านพรอมป์ต์ที่เชื่อมไว้ใน THEME.md และเก็บไฟล์ที่ใช้จริงใน `public/images/tensura/` ก่อนอ้างจากโค้ด

## สัญญาที่ต้องรักษา

- เฟรมภาพตัวละครเป็น 2×2 ช่องเท่ากัน: idle บนซ้าย, walk บนขวา, walkAlt ล่างซ้าย, typing ล่างขวา มีพื้นหลังโปร่งใสและแนวเท้าคงที่
- ภาพโต๊ะ `tempest-desk-v4.png` ขนาด 1536×1024 มี mask และตำแหน่งจอ/คริสตัลผูกอยู่ใน PersonalWorkstation เปลี่ยนองค์ประกอบภาพแล้วต้องปรับ mask และตรวจภาพจริงด้วย
- Pause หยุดทั้งการเดิน เฟรมตัวละคร และเอฟเฟกต์ CSS; เคารพ `prefers-reduced-motion`
- สถานะงานอ่านจาก `GET /api/agents` ทุก 30 วินาที และมีข้อมูลตัวอย่างเมื่อ offline การเดินและคลิกคอมเป็นการควบคุมภาพบนเว็บ ไม่ได้ส่งคำสั่งงานหรือแก้ข้อมูล Notion
- Notion integration อยู่ฝั่ง Vite dev/preview; การนำ `dist/` ไปโฮสต์แบบ static ต้องมี endpoint `/api/agents` รองรับหากต้องการสถานะสด

## ตรวจงานและการรัน

- โค้ด UI/TypeScript: `rtk npm run build`; ใช้ `rtk npm run lint` เมื่อเกี่ยวข้อง
- เปลี่ยนเส้นทาง ช่องโต๊ะ ตัวตน หรือรูปแบบแอสเซ็ต: รัน `rtk npm test` และแก้การตรวจที่สัมพันธ์กับพฤติกรรมใหม่
- งานภาพ/เลย์เอาต์: ตรวจหน้าจอใหญ่และมือถือ รวมถึง Our people ด้านล่าง การเลือกคน คลิกพื้น เดินกลับคอม และ Pause ตามส่วนที่เปลี่ยน
- งานเอกสารอย่างเดียวตรวจ frontmatter และลิงก์ ไม่จำเป็นต้องเปิด dev server
- หากผู้ใช้สั่งหยุดรันไว้ ให้คงสถานะนั้นระหว่างงานเอกสารหรือแก้ไฟล์ จนมีคำขอให้เปิดหรือทดสอบเว็บอีกครั้ง
- เมื่อจำเป็นต้องเปิดเว็บ ใช้ `rtk npm run dev` ที่ `http://localhost:5173`; เมื่อต้องหยุด ให้ตรวจโปรเซสที่ฟังพอร์ตนี้และหยุดเฉพาะโปรเซสของโปรเจกต์
