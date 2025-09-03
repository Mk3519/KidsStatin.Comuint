function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    const data = JSON.parse(e.parameter.data);
    
    // إضافة عناوين الأعمدة إذا كانت الورقة فارغة
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "OperationNumber",
        "Name",
        "Phone",
        "Email",
        "FoodQuality",
        "CoffeeQuality",
        "ServiceSpeed",
        "ServiceQuality",
        "StaffQuality",
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
      parseInt(data.foodQuality) || 0,
      parseInt(data.coffeeQuality) || 0,
      parseInt(data.serviceSpeed) || 0,
      parseInt(data.serviceQuality) || 0,
      parseInt(data.staffQuality) || 0
    ];
    const averageRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    
    // إضافة البيانات للجدول
    sheet.appendRow([
      data.timestamp,
      operationNumber,
      data.name,
      data.phone,
      data.email,
      data.foodQuality,
      data.coffeeQuality,
      data.serviceSpeed,
      data.serviceQuality,
      data.staffQuality,
      data.comment || 'لا يوجد تعليق / No comment'
    ]);

    // إنشاء محتوى HTML للبريد الإلكتروني
    const emailTemplate = createEmailTemplate(data, operationNumber, averageRating);

    // إرسال البريد الإلكتروني للإدارة
    MailApp.sendEmail({
      to: "magedmedhat351@gmail.com",
      subject: `New Review - تقييم جديد - Cafe Station ${operationNumber}`,
      htmlBody: emailTemplate.adminEmail
    });

    // إرسال البريد الإلكتروني للعميل إذا قدم بريده
    if (data.email) {
      MailApp.sendEmail({
        to: data.email,
        subject: `Thank You for Your Review - شكراً لتقييمك - Cafe Station ${operationNumber}`,
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
        <img src="${data.logoUrl}" alt="Cafe Station Logo" style="width: 150px; margin-bottom: 20px;">
        <h1 style="color: #b37400; margin: 0;">Cafe Station</h1>
        <p style="color: #666; font-size: 16px;">${operationNumber}</p>
      </div>

      <div style="background: linear-gradient(135deg, #b37400, #ffc532); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
        <h2 style="margin: 0; text-align: center;">تفاصيل التقييم / Review Details</h2>
        <p style="margin: 10px 0;"><strong>الاسم / Name:</strong> ${data.name}</p>
        <p style="margin: 10px 0;"><strong>التاريخ / Date:</strong> ${data.timestamp}</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #b37400; margin-top: 0;">التقييمات / Ratings</h3>
        <p><strong>جودة الطعام / Food Quality:</strong> ${getStars(data.foodQuality)}</p>
        <p><strong>جودة القهوة / Coffee Quality:</strong> ${getStars(data.coffeeQuality)}</p>
        <p><strong>سرعة الخدمة / Service Speed:</strong> ${getStars(data.serviceSpeed)}</p>
        <p><strong>جودة الخدمة / Service Quality:</strong> ${getStars(data.serviceQuality)}</p>
        <p><strong>تقييم الموظفين / Staff Rating:</strong> ${getStars(data.staffQuality)}</p>
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
    <div style="text-align: center; font-family: Arial, sans-serif;">
      <h2 style="color: #b37400;">شكراً لتقييمك! / Thank You for Your Review!</h2>
      ${commonTemplate}
      <p style="color: #666; margin-top: 20px;">
        نقدر ملاحظاتك ونعمل دائماً على تحسين خدماتنا
        <br>
        We appreciate your feedback and continuously work to improve our services
      </p>
    </div>
  `;

  // نسخة خاصة للإدارة
  const adminEmail = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #b37400;">تقييم جديد / New Review</h2>
      ${commonTemplate}
      <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
        <p><strong>معلومات التواصل / Contact Information:</strong></p>
        <p>الهاتف / Phone: ${data.phone}</p>
        <p>البريد الإلكتروني / Email: ${data.email || 'غير متوفر / Not available'}</p>
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