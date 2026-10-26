// ✏️ بدّل معلومات العيادة هنا فقط
var CLINIC = {
    phone: '2127********',        // بدون + وبدون 0 (للواتساب والاتصال والـ Schema)
    display: '+212 7** *** ***'   // الصيغة اللي كتبان للزبون
};

// 1) تعمير كل الروابط والأرقام فالصفحة
document.querySelectorAll('[data-contact]').forEach(function (el) {
    var type = el.dataset.contact;

    if (type === 'tel') {
        el.href = 'tel:+' + CLINIC.phone;
    } else if (type === 'wa') {
        var text = el.dataset.text ? '?text=' + encodeURIComponent(el.dataset.text) : '';
        el.href = 'https://wa.me/' + CLINIC.phone + text;
    } else if (type === 'display') {
        el.textContent = CLINIC.display;
    }
});

// 2) تحديث رقم الهاتف فـ Schema (JSON-LD)
var schemaEl = document.getElementById('schema-clinic');
if (schemaEl) {
    try {
        var schema = JSON.parse(schemaEl.textContent);
        schema.telephone = '+' + CLINIC.phone;
        schemaEl.textContent = JSON.stringify(schema);
    } catch (err) {
        console.error('Schema parse error:', err);
    }
}

// 3) فورم الحجز عبر واتساب
var bookingForm = document.getElementById('f');

if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var form = e.currentTarget;
        var name = form.querySelector('#name').value.trim();
        var phone = form.querySelector('#phone').value.trim();
        var service = form.querySelector('#service').value;

        var message = 'السلام عليكم، بغيت نحجز موعد:\n👤 الاسم: ' + name
            + '\n📱 الهاتف: ' + phone
            + '\n🦷 الخدمة: ' + service;

        window.open(
            'https://wa.me/' + CLINIC.phone + '?text=' + encodeURIComponent(message),
            '_blank',
            'noopener'
        );
        form.reset();
    });
}

// 4) سد منيو الموبايل ملي تضغط على رابط
var mobileMenu = document.getElementById('mobile-menu');

if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
            mobileMenu.removeAttribute('open');
        });
    });
}

document.querySelectorAll('[data-map-src]').forEach(function (button) {
    button.addEventListener('click', function () {
        var mapSrc = button.dataset.mapSrc;
        if (!mapSrc) {
            console.error('Google Maps embed URL is missing.');
            return;
        }

        var map = document.createElement('iframe');
        map.src = mapSrc;
        map.title = 'موقع عيادة الابتسامة على خرائط Google';
        map.width = '800';
        map.height = '288';
        map.className = 'block h-72 w-full border-0';
        map.allowFullscreen = true;
        map.loading = 'eager';
        map.referrerPolicy = 'strict-origin-when-cross-origin';
        button.replaceWith(map);
    });
});

// 5) Scroll سلس بلا ما يبان #section فالـ URL
var siteHeader = document.querySelector('header');
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var target = id.length > 1 ? document.querySelector(id) : null;
        if (!target) return;

        e.preventDefault();

        var offset = siteHeader ? siteHeader.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
        history.replaceState(null, '', location.pathname + location.search);
    });
});

// Scroll reveal: العناصر كتبان بحركة ملي توصلها
var revealTargets = document.querySelectorAll(
    'section[id] h2, section[id] .grid > div, #faq details, #location .rounded-2xl, #booking form'
);

if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            el.classList.add('is-visible');
            obs.unobserve(el);

            // من بعد الحركة، نحيدو الكلاسات باش ما يتأثروش hover والـ transitions الأصلية
            setTimeout(function () {
                el.classList.remove('reveal', 'is-visible');
                el.style.removeProperty('--d');
            }, 1000);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) {
        var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty('--d', Math.min(siblings, 4) * 100 + 'ms');
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
}