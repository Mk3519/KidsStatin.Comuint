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
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyKXwqEWn8ii7-53MW9klVSdzKN_kNca80EE9IBfOnRIT0LPnCNw3nGLfpCWXLGfZFU/exec';

// تهيئة نظام التقييم بالنجوم
function initializeStars() {
    document.querySelectorAll('.stars').forEach(starGroup => {
        const stars = starGroup.querySelectorAll('i');
        const ratingType = starGroup.getAttribute('data-rating');
        const hiddenInput = document.getElementById(ratingType);
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.getAttribute('data-value'));
                
                // تحديث شكل النجوم
                stars.forEach(s => {
                    const starValue = parseInt(s.getAttribute('data-value'));
                    if (starValue <= value) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                
                // تخزين القيمة في الحقل المخفي
                hiddenInput.value = value;
                console.log(`${ratingType}: ${value}`); // للتأكد من تسجيل القيمة
            });
        });
    });
}

// تشغيل تهيئة النجوم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initializeStars);

// متغير لتتبع حالة الإرسال
let isSubmitting = false;

document.getElementById('commentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // تجنب الإرسال المتكرر
    if (isSubmitting) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const comment = document.getElementById('comment').value;
    const messageDiv = document.getElementById('message');
    
    // إظهار شاشة التحميل
    isSubmitting = true;
    loadingOverlay.classList.add('active');
    submitBtn.disabled = true;
    messageDiv.style.display = 'none'; // إخفاء أي رسائل سابقة
    
    // Create timestamp
    const timestamp = new Date().toLocaleString();
    
    // التحقق من إدخال التقييمات
    const serviceQuality = document.getElementById('serviceQuality').value;
    const cleanliness = document.getElementById('cleanliness').value;
    const serviceSpeed = document.getElementById('serviceSpeed').value;

    // التحقق من وجود تقييم في كل قسم
    if (!serviceQuality || !cleanliness || !serviceSpeed) {
        messageDiv.textContent = 'الرجاء تقييم جميع الأقسام بالنجوم';
        messageDiv.className = 'message error';
        return;
    }

    // Prepare the data
    const data = {
        timestamp: timestamp,
        name: name,
        phone: phone,
        serviceQuality: serviceQuality,
        cleanliness: cleanliness,
        serviceSpeed: serviceSpeed,
        comment: comment || 'لا يوجد تعليق'
    };
    
    // Send data to Google Sheets
    try {
        // إرسال البيانات
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

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
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                star.className = `fas fa-star ${i <= rating ? 'active' : ''}`;
                container.appendChild(star);
            }
        }

        // Update each rating section
        createStarRating('summaryServiceQuality', serviceQuality);
        createStarRating('summaryCleanliness', cleanliness);
        createStarRating('summaryServiceSpeed', serviceSpeed);

        // Update average rating
        document.getElementById('averageRating').textContent = average + ' / 5';

        // Hide loading overlay and show summary
        loadingOverlay.classList.remove('active');
        document.getElementById('feedbackSummary').style.display = 'flex';
        
        // مسح النموذج
        document.getElementById('commentForm').reset();
        
        // إعادة تعيين النجوم
        document.querySelectorAll('.stars i').forEach(star => {
            star.classList.remove('active');
        });
        document.querySelectorAll('input[type="hidden"]').forEach(input => {
            input.value = '0';
        });
    } catch (error) {
        // Error message
        messageDiv.textContent = 'An error occurred while submitting your feedback. Please try again.';
        messageDiv.className = 'message error';
        console.error('Error:', error);
    } finally {
        // إنهاء التحميل
        isSubmitting = false;
        loadingOverlay.classList.remove('active');
        submitBtn.disabled = false;
    }
});
