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
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby3eMlpmoPPqjBO-DPmZcnrPxVf2nPchHtMKMUsmPBxtq48764oo-NdwREZFYgbnfxp/exec';

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
document.addEventListener('DOMContentLoaded', function() {
    // Welcome Screen Handler
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
        }, 5000); // 5 seconds
    }
    initializeStars();
    
    // التحقق من نجاح العملية
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const operationNumber = urlParams.get('operation');
        document.getElementById('operationNumber').textContent = operationNumber;
        document.getElementById('feedbackSummary').style.display = 'flex';
        
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'تم إرسال تقييمك بنجاح! رقم العملية: ' + operationNumber;
        messageDiv.className = 'message success';
        messageDiv.style.display = 'block';
        
        // مسح المعلمات من URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('error') === 'true') {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
        
        // مسح المعلمات من URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// دالة لتحويل ملخص التقييم إلى صورة وتحميلها
async function downloadSummary() {
    const summary = document.querySelector('.summary-content');
    const actionButtons = document.querySelector('.action-buttons');
    
    try {
        // إظهار رسالة تحميل
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'جاري تجهيز الصورة...';
        messageDiv.className = 'message info';
        messageDiv.style.display = 'block';

        // إخفاء الأزرار مؤقتاً
        actionButtons.style.display = 'none';

        // تحويل العنصر إلى صورة
        const canvas = await html2canvas(summary, {
            backgroundColor: '#ffffff',
            scale: 2, // جودة أعلى
            logging: false,
            useCORS: true,
            windowWidth: summary.scrollWidth,
            windowHeight: summary.scrollHeight,
            width: summary.offsetWidth,
            height: summary.offsetHeight
        });

        // تحويل الصورة إلى URL
        const imageUrl = canvas.toDataURL('image/png');
        
        // إنشاء رابط للتحميل
        const link = document.createElement('a');
        link.download = 'تقييم-Kids-station.png';
        link.href = imageUrl;
        link.click();

        // إعادة إظهار الأزرار
        actionButtons.style.display = 'flex';

        // تحديث رسالة النجاح
        messageDiv.textContent = 'تم تحميل الصورة بنجاح!';
        messageDiv.className = 'message success';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    } catch (error) {
        console.error('خطأ في تحميل الصورة:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'حدث خطأ أثناء تحميل الصورة. حاول مرة أخرى.';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
    }
}

// دالة لمشاركة التقييم عبر واتساب
async function shareSummary() {
    const summary = document.querySelector('.summary-content');
    const actionButtons = document.querySelector('.action-buttons');
    
    try {
        // إظهار رسالة تحميل
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'جاري تجهيز المشاركة...';
        messageDiv.className = 'message info';
        messageDiv.style.display = 'block';

        // إخفاء الأزرار مؤقتاً
        actionButtons.style.display = 'none';

        // تحويل العنصر إلى صورة
        const canvas = await html2canvas(summary, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            windowWidth: summary.scrollWidth,
            windowHeight: summary.scrollHeight,
            width: summary.offsetWidth,
            height: summary.offsetHeight
        });

        // تحويل الصورة إلى blob
        canvas.toBlob((blob) => {
            // إنشاء ملف من الـ blob
            const file = new File([blob], 'تقييم-Kids-Station.png', { type: 'image/png' });

            // إنشاء رابط مشاركة واتساب
            const text = 'تقييمي لـ Kids Station 🌟';
            const shareUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
            
            // فتح واتساب
            window.location.href = shareUrl;
            
            // إعادة إظهار الأزرار
            actionButtons.style.display = 'flex';

            messageDiv.textContent = 'تم فتح واتساب للمشاركة!';
            messageDiv.className = 'message success';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }, 'image/png');
    } catch (error) {
        console.error('خطأ في المشاركة:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = 'حدث خطأ أثناء المشاركة. حاول مرة أخرى.';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
    }
}

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
    const foodQuality = document.getElementById('foodQuality').value;
    const coffeeQuality = document.getElementById('coffeeQuality').value;
    const serviceSpeed = document.getElementById('serviceSpeed').value;
    const serviceQuality = document.getElementById('serviceQuality').value;
    const staffQuality = document.getElementById('staffQuality').value;

    // تحقق من وجود تقييمات
    if (foodQuality === '0' || coffeeQuality === '0' || serviceSpeed === '0' || 
        serviceQuality === '0' || staffQuality === '0') {
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
    const email = document.getElementById('email').value;
    const data = {
        timestamp: timestamp,
        name: name,
        phone: phone,
        email: email,
        foodQuality: foodQuality,
        coffeeQuality: coffeeQuality,
        serviceSpeed: serviceSpeed,
        serviceQuality: serviceQuality,
        staffQuality: staffQuality,
        comment: comment || 'No comment',
        customerEmail: email, // إضافة البريد الإلكتروني للعميل
        logoUrl: 'https://mk3519.github.io/KidsStatin.Comuint/images/logo.png' // إضافة رابط الشعار
    };
    
    // Send data to Google Sheets
    try {
        console.log('بيانات التقييم:', data); // لمراقبة البيانات المرسلة
        
        // إنشاء نموذج لإرسال البيانات
        const form = new FormData();
        form.append('data', JSON.stringify(data));

        // إرسال البيانات باستخدام fetch
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: form
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
            parseInt(foodQuality),
            parseInt(coffeeQuality),
            parseInt(serviceSpeed),
            parseInt(serviceQuality),
            parseInt(staffQuality)
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
        createStarRating('summaryFoodQuality', foodQuality);
        createStarRating('summaryCoffeeQuality', coffeeQuality);
        createStarRating('summaryServiceSpeed', serviceSpeed);
        createStarRating('summaryServiceQuality', serviceQuality);
        createStarRating('summaryStaffQuality', staffQuality);

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
        document.getElementById('foodQuality').value = '0';
        document.getElementById('coffeeQuality').value = '0';
        document.getElementById('serviceSpeed').value = '0';
        document.getElementById('serviceQuality').value = '0';
        document.getElementById('staffQuality').value = '0';
        
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
            messageDiv.textContent = 'تم إرسال تقييمك بنجاح! رقم العملية: ' ;
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';
            // عرض ملخص التقييم
            document.getElementById('feedbackSummary').style.display = 'flex';
        }
    }
});
