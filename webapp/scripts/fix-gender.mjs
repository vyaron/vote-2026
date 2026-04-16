import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const mksDir = join(process.cwd(), 'public', 'data', 'mks');

// Female MK IDs based on names
const femaleIds = new Set([
  1002, // מאי גולן
  1004, // מיכל שיר סגמן
  1006, // מירב כהן
  1018, // קטי קטרין שטרית
  1032, // אימאן חטיב יאסין
  1048, // יעל רון בן משה
  1059, // גלית דיסטל טברין
  1060, // מיכל מרושת בצלאל סמוטריץ'
  1068, // פרת רייטן מרום
  1076, // טטיאנה מזרסקי
  1079, // יסמין פרידמן
  1082, // נעמה לזימי
  1091, // מטי צרפתי הרכבי
  1094, // דבי ביטון
  1098, // טלי גוטליב
  1106, // שרון ניר
  1108, // לימור סון הר מלך
  1118, // שלי טל מירון
  1122, // צגה צגנש מלקו
  1130, // עדי עזוז
  723,  // גילה גמליאל
  860,  // קרין להרר
  881,  // מרב מיכאלי
  884,  // אורית סטרוק
  905,  // פנינה תמנו
  915,  // מירב בן ארי
  948,  // עאידה תומא סלימאן
  950,  // שרן מרציאנו
  956,  // יוליה מלינובסקי
  978,  // אורית פרקש הכהן
  992,  // חודה תאי עטייה
]);

const files = readdirSync(mksDir).filter(f => f.endsWith('.json'));

let updated = 0;
for (const file of files) {
  const filePath = join(mksDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  
  if (femaleIds.has(data.id)) {
    data.gender = 'female';
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Updated ${data.id}: ${data.name} -> female`);
    updated++;
  }
}

console.log(`\nTotal updated: ${updated} MKs`);
