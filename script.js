// Function to reset the form and hide summary
function resetForm() {
    document.getElementById('feedbackSummary').style.display = 'none';
    document.getElementById('commentForm').reset();
    document.querySelectorAll('.stars i').forEach(star => {
        star.classList.remove('active');
    });
    document.querySelectorAll('input[type="hidden"]').forEach(input => {
        input.value = '0';
    });
    window.scrollTo(0, 0);
}

// Google Apps Script deployed URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbaLyrI3Etpp9oT0Ycl-qekzqih9YxGmliBSppI7_D3DiO7gjw3BnpgOLWqHVP6BRZ/exec';

// Initialize star rating system
function initializeStars() {
    document.querySelectorAll('.stars').forEach(starGroup => {
        const stars = starGroup.querySelectorAll('i');
        const ratingType = starGroup.getAttribute('data-rating');
        const hiddenInput = document.getElementById(ratingType);
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.getAttribute('data-value'));
                
                // Update stars appearance
                stars.forEach(s => {
                    const starValue = parseInt(s.getAttribute('data-value'));
                    if (starValue <= value) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                
                // Store value in hidden input
                hiddenInput.value = value;
                console.log(`${ratingType}: ${value}`); // للتأكد من تسجيل القيمة
            });
        });
    });
}

// تشغيل تهيئة النجوم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeStars);

// متغير لتخزين تقييمات العملاء
const customerFeedbacks = new Map();

// Variable to track submission status
let isSubmitting = false;

document.getElementById('commentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const comment = document.getElementById('comment').value;
    const messageDiv = document.getElementById('message');
    
    // Create timestamp
    const timestamp = new Date().toLocaleString();
    
    // Get ratings input
    const serviceQuality = document.getElementById('serviceQuality').value;
    const cleanliness = document.getElementById('cleanliness').value;
    const serviceSpeed = document.getElementById('serviceSpeed').value;

    // تحقق من وجود تقييمات
    if (serviceQuality === '0' || cleanliness === '0' || serviceSpeed === '0') {
        messageDiv.textContent = 'الرجاء تقييم جميع الأقسام';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
        return;
    }

    // Show loading screen
    isSubmitting = true;
    loadingOverlay.classList.add('active');
    submitBtn.disabled = true;
    messageDiv.style.display = 'none'; // Hide previous messages

    // إعداد بيانات التقييم
    const data = {
        timestamp: timestamp,
        name: name,
        phone: phone,
        serviceQuality: serviceQuality,
        cleanliness: cleanliness,
        serviceSpeed: serviceSpeed,
        comment: comment || 'No comment'
    };
    
    // Send data to Google Sheets
    try {
        console.log('بيانات التقييم:', data); // لمراقبة البيانات المرسلة
        
        // إرسال البيانات والحصول على رقم العملية
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // تغيير لـ no-cors لحل مشكلة CORS
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(data)
        });

        // توليد رقم عملية باستخدام التاريخ والوقت
        const now = new Date();
        const operationNumber = '#' + 
            now.getFullYear().toString().slice(-2) + 
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0');

        // Calculate average rating
        const ratings = [
            parseInt(serviceQuality),
            parseInt(cleanliness),
            parseInt(serviceSpeed)
        ];
        const average = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);

        // Update summary stars
        function createStarRating(containerId, rating) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            rating = parseInt(rating);
            
            const starsWrapper = document.createElement('div');
            starsWrapper.className = 'stars-wrapper';
            
            // إضافة النجوم المفعلة مع تأثير حركي
            for (let i = 1; i <= rating; i++) {
                const star = document.createElement('i');
                star.className = 'fas fa-star active';
                // تأخير ظهور كل نجمة لإضافة تأثير حركي
                setTimeout(() => {
                    starsWrapper.appendChild(star);
                }, i * 100);
            }
            
            container.appendChild(starsWrapper);

            // إضافة رقم التقييم بتصميم جديد
            setTimeout(() => {
                const ratingBadge = document.createElement('span');
                ratingBadge.textContent = rating + '/5';
                container.appendChild(ratingBadge);
            }, (rating + 1) * 100);
        }

        // Update each rating section
        createStarRating('summaryServiceQuality', serviceQuality);
        createStarRating('summaryCleanliness', cleanliness);
        createStarRating('summaryServiceSpeed', serviceSpeed);

        // Update average rating
        document.getElementById('averageRating').textContent = average + ' / 5';

        // عرض ملخص التقييم
        const feedbackSummary = document.getElementById('feedbackSummary');
        feedbackSummary.style.display = 'flex';
        feedbackSummary.classList.add('visible');
        
        // تمرير لأعلى الصفحة لعرض الملخص
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update customer information
        const summaryName = document.getElementById('summaryName');
        const summaryPhone = document.getElementById('summaryPhone');
        
        // تحديث معلومات العميل بشكل واضح
        if (name) {
            summaryName.textContent = name;
            summaryName.style.color = '#333';
        }
        
        if (phone) {
            summaryPhone.textContent = phone;
            summaryPhone.style.color = '#333';
        }
        
        // عرض رقم العملية
        document.getElementById('operationNumber').textContent = operationNumber;
        
        // Hide loading overlay and show summary
        loadingOverlay.classList.remove('active');
        document.getElementById('feedbackSummary').style.display = 'flex';
        
        // Reset form
        document.getElementById('commentForm').reset();
        
        // إعادة تعيين النجوم ومسح جميع المدخلات
        document.querySelectorAll('.stars i').forEach(star => {
            star.classList.remove('active');
        });
        
        // إعادة تعيين قيم التقييم المخفية
        document.getElementById('serviceQuality').value = '0';
        document.getElementById('cleanliness').value = '0';
        document.getElementById('serviceSpeed').value = '0';
        
        // مسح حقول الإدخال
        document.getElementById('name').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('comment').value = '';
    } catch (error) {
        // رسالة الخطأ بالعربية
        messageDiv.textContent = 'حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.';
        messageDiv.className = 'message error';
        console.error('الخطأ:', error);
    } finally {
        // إنهاء التحميل
        isSubmitting = false;
        loadingOverlay.classList.remove('active');
        submitBtn.disabled = false;
        
        if (!messageDiv.classList.contains('error')) {
            // إظهار رسالة نجاح فقط إذا لم يكن هناك خطأ
            messageDiv.textContent = 'تم إرسال تقييمك بنجاح! رقم العملية: ' + operationNumber;
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';
            // عرض ملخص التقييم
            document.getElementById('feedbackSummary').style.display = 'flex';
        }
    }
});
