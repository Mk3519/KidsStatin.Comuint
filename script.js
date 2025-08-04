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
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-2t0bgdled_KgcoCMSapu6tNR2i4hCbSh1fesYl6aw9Duou9el-g_hd5IhaczPvdJ/exec';

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

// استرجاع آخر رقم عملية من localStorage أو البدء من 1
let operationCounter = parseInt(localStorage.getItem('lastOperationNumber') || '0') + 1;
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

    // إعداد بيانات التقييم مع رقم العملية
    const data = {
        operationNumber: `#${operationCounter.toString().padStart(4, '0')}`,
        timestamp: timestamp,
        name: name,
        phone: phone,
        serviceQuality: serviceQuality,
        cleanliness: cleanliness,
        serviceSpeed: serviceSpeed,
        comment: comment || 'No comment'
    };

    // حفظ التقييم في Map
    customerFeedbacks.set(operationCounter, data);
    
    // Send data to Google Sheets
    try {
        // Send data
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

        // تحديث رقم العملية بتنسيق أفضل
        document.getElementById('operationNumber').textContent = data.operationNumber;
        
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
        
        // زيادة عداد العمليات وحفظه في localStorage
        localStorage.setItem('lastOperationNumber', operationCounter.toString());
        operationCounter++;

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
