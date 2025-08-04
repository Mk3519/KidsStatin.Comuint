# نظام تعليقات العملاء

نظام بسيط لجمع تعليقات العملاء وتخزينها في Google Sheets.

## المميزات
- واجهة مستخدم عربية بسيطة
- تخزين التعليقات في Google Sheets
- تصميم متجاوب مع جميع الأجهزة
- رسائل تأكيد وتنبيه للمستخدم

## خطوات الإعداد

1. إنشاء Google Sheet جديد:
   - قم بإنشاء ملف Google Sheets جديد
   - قم بإضافة الأعمدة التالية في الصف الأول: التاريخ، الاسم، البريد الإلكتروني، التعليق

2. إعداد Google Apps Script:
   - افتح Google Sheets
   - اذهب إلى Extensions > Apps Script
   - انسخ الكود التالي في محرر Apps Script:
   ```javascript
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     const data = JSON.parse(e.postData.contents);
     
     sheet.appendRow([
       data.timestamp,
       data.name,
       data.email,
       data.comment
     ]);
     
     return ContentService.createTextOutput("Success");
   }
   ```
   - انقر على "Deploy" > "New deployment"
   - اختر "Web app"
   - اضبط الإعدادات:
     - Execute as: Me
     - Who has access: Anyone
   - انقر على "Deploy"
   - انسخ عنوان URL الذي سيظهر لك

3. تحديث عنوان URL في المشروع:
   - افتح ملف `script.js`
   - استبدل `YOUR_GOOGLE_APPS_SCRIPT_URL` بعنوان URL الذي حصلت عليه من الخطوة السابقة

## كيفية الاستخدام
1. قم بفتح الموقع
2. املأ النموذج بالمعلومات المطلوبة:
   - الاسم
   - البريد الإلكتروني
   - التعليق
3. اضغط على زر "إرسال التعليق"
4. سيتم تخزين التعليق تلقائياً في Google Sheets

## التقنيات المستخدمة
- HTML5
- CSS3
- JavaScript
- Google Apps Script
- Google Sheets API
