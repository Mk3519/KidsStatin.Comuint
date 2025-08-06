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
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWHMYUH0HqUkPkxzq_iSU6sE_j5VOhEQuFTqzJom6dMeWkCQlEbccFJqbU1Riladx4/exec';

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
    
    // Show loading screen
    isSubmitting = true;
    loadingOverlay.classList.add('active');
    submitBtn.disabled = true;
    messageDiv.style.display = 'none'; // Hide previous messages
    
    // Create timestamp
    const timestamp = new Date().toLocaleString();
    
    // Check for ratings input
    const serviceQuality = document.getElementById('serviceQuality').value;
    const cleanliness = document.getElementById('cleanliness').value;
    const serviceSpeed = document.getElementById('serviceSpeed').value;

    // Verify all sections are rated
    if (!serviceQuality || !cleanliness || !serviceSpeed) {
        messageDiv.textContent = 'Please rate all sections';
        messageDiv.className = 'message error';
        return;
    }

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
        // إرسال البيانات والحصول على رقم العملية
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        // التحقق من نجاح الطلب
        if (!response.ok) {
            throw new Error(`فشل في الاتصال بالخادم: ${response.status}`);
        }

        const result = await response.text();
        let parsedResult;
        try {
            parsedResult = JSON.parse(result);
            if (!parsedResult.success) {
                throw new Error(parsedResult.error || 'حدث خطأ غير معروف');
            }
        } catch (parseError) {
            console.error('خطأ في تحليل الاستجابة:', result);
            throw new Error('فشل في قراءة الاستجابة من الخادم');
        }
        
        // تحديث رقم العملية من الاستجابة
        const operationNumber = parsedResult.operationNumber;

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

        // Show the feedback summary section
        document.getElementById('feedbackSummary').classList.add('visible');
        
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
        
        // توليد رقم عملية مؤقت (حيث أن mode: 'no-cors' لا يسمح باستقبال الرد)
        const tempOperationNumber = new Date().getTime().toString().slice(-4);
        document.getElementById('operationNumber').textContent = '#' + tempOperationNumber;
        
        // Hide loading overlay and show summary
        loadingOverlay.classList.remove('active');
        document.getElementById('feedbackSummary').style.display = 'flex';
        
        // Reset form
        document.getElementById('commentForm').reset();
        
        // Reset stars
        document.querySelectorAll('.stars i').forEach(star => {
            star.classList.remove('active');
        });
        document.querySelectorAll('input[type="hidden"]').forEach(input => {
            input.value = '0';
        });
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
        
        // إظهار رسالة نجاح
        messageDiv.textContent = 'تم إرسال تقييمك بنجاح!';
        messageDiv.className = 'message success';
        messageDiv.style.display = 'block';
    }
});
