/*
 * العداد الذكي - جميع الحقوق محفوظة © 2026 ENG Kareem Ahmed
 * هذا الكود محمي بموجب قوانين حقوق الملكية الفكرية.
 * يمنع منعاً باتاً نسخ أو تعديل أو إعادة توزيع الكود دون إذن خطي من المطور.
 */

// ==================== حماية الكود ====================
(function() {
    // منع النقر بزر الفأرة الأيمن
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // منع اختصارات لوحة المفاتيح الخطيرة
    document.addEventListener('keydown', function(e) {
        // منع F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // منع Ctrl+Shift+I (أدوات المطورين)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        // منع Ctrl+Shift+J (وحدة التحكم)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        // منع Ctrl+U (عرض المصدر)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
        // منع Ctrl+S (حفظ الصفحة)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
        // منع Ctrl+C (نسخ) - اختياري
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            return false;
        }
        // منع Ctrl+V (لصق) - اختياري
        if (e.ctrlKey && e.key === 'v') {
            e.preventDefault();
            return false;
        }
        // منع Ctrl+X (قص) - اختياري
        if (e.ctrlKey && e.key === 'x') {
            e.preventDefault();
            return false;
        }
        // منع Ctrl+A (تحديد الكل) - اختياري
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            return false;
        }
        // منع Ctrl+P (طباعة) - اختياري
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            return false;
        }
    });

    // منع تحديد النص (لإضفاء حماية إضافية)
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });

    // منع سحب العناصر
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    // كشف محاولة فتح أدوات المطورين (طريقة بسيطة)
    let devtoolsOpened = false;
    const checkDevTools = function() {
        const start = new Date().getTime();
        debugger; // إذا كانت أدوات المطور مفتوحة، سيتوقف التنفيذ
        const end = new Date().getTime();
        if (end - start > 100) { // إذا استغرق debugger وقتاً طويلاً (أدوات المطور مفتوحة)
            devtoolsOpened = true;
            // يمكن إجراء إجراءات إضافية مثل إعادة التوجيه أو تحذير
            console.warn('⚠️ يرجى احترام حقوق النشر.');
            // document.body.innerHTML = ''; // يمكن تفعيل هذه لمسح الصفحة
        }
    };
    // فحص بشكل دوري
    setInterval(checkDevTools, 2000);
})();

// ==================== الكود الأساسي للتطبيق ====================
// عناصر DOM
const denomButtons = document.querySelectorAll('.denom-btn');
const customPanel = document.getElementById('customPanel');
const customDenom = document.getElementById('customDenom');
const noteCount = document.getElementById('noteCount');
const addBtn = document.getElementById('addBtn');
const entriesBody = document.getElementById('entriesBody');
const grandTotalSpan = document.getElementById('grandTotal');
const resetBtn = document.getElementById('resetBtn');

let selectedDenomValue = 200;
let entries = [];

// إنشاء جزيئات الخلفية - يتم إنشاؤها فقط إذا لم يكن الجهاز هاتف (عرض أكبر من 768)
function createParticles() {
    if (window.innerWidth <= 768) return; // لا تنشأ على الهاتف
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 6 + 3;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 5) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.background = `rgba(255, ${Math.floor(200 + Math.random()*55)}, 100, ${Math.random()*0.3+0.2})`;
        particlesContainer.appendChild(particle);
    }
}
createParticles();

// تفعيل الزر النشط
function setActiveDenomButton(value) {
    denomButtons.forEach(btn => {
        const btnValue = btn.dataset.value;
        if (btnValue === 'other' && value === 'other') {
            btn.classList.add('active');
        } else if (btnValue !== 'other' && parseInt(btnValue) === value) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (value === 'other') {
        customPanel.style.display = 'flex';
        selectedDenomValue = 'other';
    } else {
        customPanel.style.display = 'none';
        selectedDenomValue = value;
    }
}

// إضافة مستمع للأزرار
denomButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const val = this.dataset.value;
        if (val === 'other') {
            setActiveDenomButton('other');
        } else {
            setActiveDenomButton(parseInt(val));
        }
    });
});

// تأثير نبض للإجمالي (يُخفف على الهاتف)
function pulseTotal() {
    if (window.innerWidth <= 768) {
        // على الهاتف، مجرد تحديث الرقم دون تأثير
        return;
    }
    grandTotalSpan.classList.add('pulse');
    setTimeout(() => grandTotalSpan.classList.remove('pulse'), 300);
}

// إعادة رسم الجدول
function render(newRowIndex = -1) {
    entriesBody.innerHTML = '';
    let total = 0;

    entries.forEach((entry, index) => {
        const row = document.createElement('tr');
        if (index === newRowIndex && window.innerWidth > 768) {
            row.classList.add('new-row'); // التأثير فقط على الشاشات الكبيرة
        }

        const denomCell = document.createElement('td');
        denomCell.textContent = entry.denomination + ' ج';
        row.appendChild(denomCell);

        const countCell = document.createElement('td');
        countCell.textContent = entry.count;
        row.appendChild(countCell);

        const subCell = document.createElement('td');
        subCell.textContent = entry.subtotal.toLocaleString('ar-EG');
        row.appendChild(subCell);

        const delCell = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-icon';
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        delBtn.addEventListener('click', () => {
            entries.splice(index, 1);
            render();
            pulseTotal();
        });
        delCell.appendChild(delBtn);
        row.appendChild(delCell);

        entriesBody.appendChild(row);
        total += entry.subtotal;
    });

    grandTotalSpan.textContent = total.toLocaleString('ar-EG');
    if (newRowIndex !== -1) pulseTotal();
}

// إضافة إدخال جديد
function addEntry() {
    let denomination;
    if (selectedDenomValue === 'other') {
        denomination = parseInt(customDenom.value);
        if (isNaN(denomination) || denomination <= 0) {
            alert('❌ أدخل فئة صحيحة');
            customDenom.focus();
            return;
        }
    } else {
        denomination = selectedDenomValue;
    }

    const count = parseInt(noteCount.value);
    if (isNaN(count) || count <= 0) {
        alert('❌ أدخل عدداً صحيحاً');
        noteCount.focus();
        return;
    }

    const subtotal = denomination * count;
    entries.push({ denomination, count, subtotal });
    render(entries.length - 1);
    noteCount.value = 1;
}

// إعادة ضبط الكل
function resetAll() {
    entries = [];
    render();
    setActiveDenomButton(200);
    noteCount.value = 1;
    customDenom.value = '';
    pulseTotal();
}

// مستمعين
addBtn.addEventListener('click', addEntry);
resetBtn.addEventListener('click', resetAll);

noteCount.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addEntry();
});
customDenom.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addEntry();
});

// تهيئة
setActiveDenomButton(200);