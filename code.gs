function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    const data = JSON.parse(e.parameter.data);
    
    // إضافة عناوين الأعمدة إذا كانت الورقة فارغة
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "OperationNumber",
        "Branch",
        "Name",
        "Phone",
        "Email",
        "ServiceQuality",
        "Cleanliness",
        "Facilities",
        "Activities",
        "StaffFriendliness",
        "Prices",
        "Recommendation",
        "Comment"
      ]);
    }
    
    // إنشاء رقم العملية
    const now = new Date();
    const operationNumber = '#' + 
      now.getFullYear().toString().slice(-2) + 
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');

    // حساب متوسط التقييم
    const ratings = [
      parseInt(data.serviceQuality) || 0,
      parseInt(data.cleanliness) || 0,
      parseInt(data.facilities) || 0,
      parseInt(data.activities) || 0,
      parseInt(data.staffFriendliness) || 0,
      parseInt(data.prices) || 0,
      parseInt(data.recommendation) || 0
    ];
    const averageRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    
    // إضافة البيانات للجدول
    sheet.appendRow([
      data.timestamp,
      operationNumber,
      data.branch,
      data.name,
      data.phone,
      data.email,
      data.serviceQuality,
      data.cleanliness,
      data.facilities,
      data.activities,
      data.staffFriendliness,
      data.prices,
      data.recommendation,
      data.comment || 'لا يوجد تعليق / No comment'
    ]);

    // إنشاء محتوى HTML للبريد الإلكتروني
    const emailTemplate = createEmailTemplate(data, operationNumber, averageRating);

    // إرسال البريد الإلكتروني للإدارة
    MailApp.sendEmail({
      to: "magedmedhat351@gmail.com",
      subject: `تقييم جديد - فرع ${data.branch} - Kids Station ${operationNumber}`,
      htmlBody: emailTemplate.adminEmail
    });

    // إرسال البريد الإلكتروني للعميل إذا قدم بريده
    if (data.email) {
      MailApp.sendEmail({
        to: data.email,
        subject: `شكراً لتقييمك - كيدز ستيشن ${data.branch} - ${operationNumber}`,
        htmlBody: emailTemplate.customerEmail
      });
    }
    
    return HtmlService.createHtmlOutput(`
      <html>
        <body>
          <script>
            window.top.location.href = window.location.origin + '?success=true&operation=' + '${operationNumber}';
          </script>
        </body>
      </html>
    `);
    
  } catch (error) {
    return HtmlService.createHtmlOutput(`
      <html>
        <body>
          <script>
            window.top.location.href = window.location.origin + '?error=true';
          </script>
        </body>
      </html>
    `);
  }
}

function createEmailTemplate(data, operationNumber, averageRating) {
  // قالب مشترك للبريد الإلكتروني
  const commonTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${data.logoUrl}" alt="Kids Station Logo" style="width: 150px; margin-bottom: 20px;">
        <h1 style="color: #b37400; margin: 0;">Kids Station</h1>
        <p style="color: #666; font-size: 16px;">${operationNumber}</p>
      </div>

      <div style="background: linear-gradient(135deg, #b37400, #ffc532); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
        <h2 style="margin: 0; text-align: center;">تفاصيل التقييم / Review Details</h2>
        <p style="margin: 10px 0;"><strong>الاسم / Name:</strong> ${data.name}</p>
        <p style="margin: 10px 0;"><strong>التاريخ / Date:</strong> ${data.timestamp}</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #b37400; margin-top: 0;">التقييمات / Ratings</h3>
        <p style="direction: rtl;"><strong>الفرع:</strong> ${data.branch}</p>
        <p style="direction: rtl;"><strong>مدى رضاكم عن الخدمة المقدمة:</strong> ${getStars(data.serviceQuality)}</p>
        <p style="direction: rtl;"><strong>مدى نظافة المكان:</strong> ${getStars(data.cleanliness)}</p>
        <p style="direction: rtl;"><strong>جودة وصيانة الألعاب والمرافق:</strong> ${getStars(data.facilities)}</p>
        <p style="direction: rtl;"><strong>تنوع الأنشطة والترفيه المتاحة:</strong> ${getStars(data.activities)}</p>
        <p style="direction: rtl;"><strong>ودية واستجابة الموظفين:</strong> ${getStars(data.staffFriendliness)}</p>
        <p style="direction: rtl;"><strong>أسعار خدمات كيدز ستيشن:</strong> ${getStars(data.prices)}</p>
        <p style="direction: rtl;"><strong>هل تنصح بهذا المكان للآخرين:</strong> ${getStars(data.recommendation)}</p>
        <p style="font-size: 18px; margin-top: 15px; text-align: center;">
          <strong>متوسط التقييم / Average Rating: </strong>
          <span style="color: #b37400; font-size: 24px;">${averageRating}/5</span>
        </p>
      </div>

      <div style="background-color: #fff8e7; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc532;">
        <h3 style="color: #b37400; margin-top: 0;">التعليق / Comment</h3>
        <p style="color: #666;">${data.comment || 'لا يوجد تعليق / No comment'}</p>
      </div>
    </div>
  `;

  // نسخة خاصة للعميل
  const customerEmail = `
    <div style="text-align: center; font-family: Arial, sans-serif; direction: rtl;">
      <h2 style="color: #b37400;">شكراً لتقييمك!</h2>
      ${commonTemplate}
      <p style="color: #666; margin-top: 20px;">
        نقدر ملاحظاتك ونعمل دائماً على تحسين خدماتنا في كيدز ستيشن
        <br>
        سعداء بزيارتكم ونتطلع لرؤيتكم مرة أخرى
      </p>
    </div>
  `;

  // نسخة خاصة للإدارة
  const adminEmail = `
    <div style="font-family: Arial, sans-serif; direction: rtl;">
      <h2 style="color: #b37400;">تقييم جديد من فرع ${data.branch}</h2>
      ${commonTemplate}
      <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
        <p><strong>معلومات التواصل:</strong></p>
        <p>الاسم: ${data.name}</p>
        <p>الهاتف: ${data.phone}</p>
        <p>البريد الإلكتروني: ${data.email || 'غير متوفر'}</p>
        <p>تاريخ التقييم: ${data.timestamp}</p>
      </div>
    </div>
  `;

  return {
    customerEmail: customerEmail,
    adminEmail: adminEmail
  };
}

function getStars(rating) {
  const stars = parseInt(rating) || 0;
  const filledStar = '★';
  const emptyStar = '☆';
  return `<span style="color: #ffc532; font-size: 18px;">
    ${filledStar.repeat(stars)}${emptyStar.repeat(5-stars)}
  </span> (${stars}/5)`;
}