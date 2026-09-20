// ===== GOOGLE SHEETS CONFIGURATION =====
// ⚠️ GANTI DENGAN URL DARI GOOGLE APPS SCRIPT ANDA!
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwa03M6yAixPm1LKRRRmPhpAyIHr5A3zgEuipnWWjqxToC9toUF-mWvYgptK6s3oReL/exec';

// ===== DOM =====
const coverScreen = document.getElementById('coverScreen');
const openBtn = document.getElementById('openInvitation');
const mainContent = document.getElementById('mainContent');
const bgMusic = document.getElementById('bgMusic');
const musicIcon = document.getElementById('toggleMusic');
const musicPlayer = document.getElementById('musicPlayer');
const floatingNav = document.getElementById('floatingNav');
const navDots = document.querySelectorAll('.nav-dot');
const sections = document.querySelectorAll('.section');
const toastContainer = document.getElementById('toastContainer');
const messagesContainer = document.getElementById('messagesContainer');
const guestbookForm = document.getElementById('guestbookForm');

// ===== UTILS =====
const isMobile = () => window.innerWidth < 768;
const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== PAGE VISIBILITY =====
let isPageActive = true;
document.addEventListener('visibilitychange', () => {
    isPageActive = !document.hidden;
});

// ===== BACKGROUND SLIDER =====
let sliderInterval = null;
let sliderStarted = false;

function initBackgroundSlider() {
    const slides = document.querySelectorAll('.bg-slide');
    if (!slides.length) return;
    
    slides.forEach((slide, i) => {
        const bg = slide.dataset.bg;
        if (bg && i > 0) {
            setTimeout(() => {
                slide.style.backgroundImage = `url('${bg}')`;
            }, 1500 + (i * 500));
        }
    });
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    slides[0].classList.add('active');
    
    sliderInterval = setInterval(() => {
        if (!isPageActive) return;
        
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % totalSlides;
        
        // Reset animation untuk zoom
        slides[currentIndex].style.animation = 'none';
        // Force reflow
        void slides[currentIndex].offsetWidth;
        // Re-apply animation
        slides[currentIndex].style.animation = '';
        
        slides[currentIndex].classList.add('active');
    }, 6000);
}

// ===== SPARKLES (LEBIH BANYAK) =====
function createSparkles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // ✅ Naikkan jumlah — Mobile: 15, Desktop: 30
    const count = isMobile() ? 15 : 30;
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        sparkle.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        sparkle.style.width = (3 + Math.random() * 4) + 'px';
        sparkle.style.height = sparkle.style.width;
        fragment.appendChild(sparkle);
    }
    
    container.appendChild(fragment);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    const coverSampul = coverScreen.getAttribute('data-sampul');
    if (coverSampul) {
        coverScreen.style.backgroundImage = `url('${coverSampul}')`;
    }
    
    mainContent.style.display = 'none';
    document.body.style.overflow = 'hidden';
    
    createSparkles('coverSparkles');
    createSparkles('globalSparkles');
    
    // Preload gambar mempelai
    const preloadImages = [
        'asest/mempelai p.png',
        'asest/mempelai w.png'
    ];
    preloadImages.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onerror = () => console.warn('Preload gagal:', src);
    });
});

// ===== OPEN INVITATION =====
openBtn.addEventListener('click', function() {
    coverScreen.classList.add('hidden');
    
    setTimeout(() => {
        mainContent.style.display = 'block';
        requestAnimationFrame(() => {
            mainContent.classList.add('visible');
        });
        
        document.body.style.overflow = 'auto';
        musicPlayer.classList.add('visible');
        floatingNav.classList.add('visible');
        
        if (bgMusic) {
            bgMusic.load();
            bgMusic.play().catch(error => {
                console.log('Autoplay prevented:', error);
                isPlaying = false;
                musicIcon.classList.remove('playing');
            });
        }
        
        if (!sliderStarted) {
            sliderStarted = true;
            initBackgroundSlider();
        }
        
        setTimeout(() => {
            initScrollReveal();
            updateActiveNav();
        }, 500);
        
        setTimeout(() => {
            loadMessages();
        }, 2000);
        
    }, 800);
});

// ===== MUSIC =====
let isPlaying = true;

if (musicIcon) {
    musicIcon.addEventListener('click', function() {
        if (isPlaying) {
            bgMusic.pause();
            musicIcon.classList.remove('playing');
        } else {
            bgMusic.play().catch(e => console.log('Error playing:', e));
            musicIcon.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });
}

// ===== COUNTDOWN =====
const targetDate = new Date('2026-10-01T00:00:00+07:00').getTime();
let countdownInterval = null;

function updateCountdown() {
    const now = Date.now();
    const distance = targetDate - now;
    
    if (distance < 0) {
        setTextIfChanged('days', '00');
        setTextIfChanged('hours', '00');
        setTextIfChanged('minutes', '00');
        setTextIfChanged('seconds', '00');
        return;
    }
    
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    
    setTextIfChanged('days', pad(days));
    setTextIfChanged('hours', pad(hours));
    setTextIfChanged('minutes', pad(minutes));
    setTextIfChanged('seconds', pad(seconds));
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function setTextIfChanged(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== val) {
        el.textContent = val;
    }
}

function startCountdown() {
    if (countdownInterval) return;
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    } else {
        startCountdown();
    }
});

startCountdown();

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const reveals = document.querySelectorAll('.section-header, .couple-card, .event-card, .gallery-item, .closing-card, .guestbook-form, .gift-card');
    
    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.classList.add('reveal-active');
        });
        return;
    }
    
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px 0px 0px'
    });
    
    reveals.forEach(reveal => {
        reveal.style.opacity = '0';
        reveal.style.transform = 'translateY(30px)';
        observer.observe(reveal);
    });
    
    // Fallback
    setTimeout(() => {
        reveals.forEach(el => {
            if (getComputedStyle(el).opacity === '0') {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.classList.add('reveal-active');
            }
        });
    }, 2000);
}

// ===== ACTIVE NAV =====
let navTicking = false;

function updateActiveNav() {
    let currentSection = '';
    const scrollPosition = window.scrollY + 200;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navDots.forEach(dot => {
        const isActive = dot.getAttribute('data-section') === currentSection;
        if (isActive !== dot.classList.contains('active')) {
            dot.classList.toggle('active', isActive);
        }
    });
    
    navTicking = false;
}

window.addEventListener('scroll', () => {
    if (!navTicking) {
        requestAnimationFrame(updateActiveNav);
        navTicking = true;
    }
}, { passive: true });

navDots.forEach(dot => {
    dot.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== GUESTBOOK =====
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

async function loadMessages() {
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '<div class="text-center text-gold py-4">⏳ Memuat ucapan...</div>';
    
    try {
        const response = await fetch(GOOGLE_SHEETS_URL);
        const result = await response.json();
        
        if (result.success && result.messages && result.messages.length > 0) {
            const fragment = document.createDocumentFragment();
            
            result.messages.forEach(msg => {
                let dateStr = 'Baru saja';
                if (msg.timestamp) {
                    try {
                        const date = new Date(msg.timestamp);
                        dateStr = date.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    } catch(e) {
                        dateStr = msg.timestamp;
                    }
                }
                
                const attendanceText = msg.attendance === 'Hadir' ? 
                    '<span class="message-attendance"><i class="fas fa-calendar-check me-1"></i> Akan Hadir</span>' : 
                    (msg.attendance === 'Tidak Hadir' ? 
                        '<span class="message-attendance tidak-hadir"><i class="fas fa-calendar-times me-1"></i> Tidak Hadir</span>' : '');
                
                const div = document.createElement('div');
                div.className = 'message-item';
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="message-name">✨ ${escapeHtml(msg.name)}</span>
                        <span class="message-date">${dateStr}</span>
                    </div>
                    <p class="message-content mb-2">${escapeHtml(msg.message)}</p>
                    ${attendanceText}
                `;
                fragment.appendChild(div);
            });
            
            messagesContainer.innerHTML = '';
            messagesContainer.appendChild(fragment);
        } else {
            messagesContainer.innerHTML = '<p class="text-center text-gold py-4">✨ Belum ada ucapan. Jadilah yang pertama! ✨</p>';
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = '<p class="text-center text-gold py-4">⚠️ Gagal memuat ucapan. Periksa URL Google Apps Script.</p>';
    }
}

async function saveMessage(name, message, attendance, ipAddress) {
    try {
        const formData = new URLSearchParams();
        formData.append('action', 'save');
        formData.append('name', name);
        formData.append('message', message);
        formData.append('attendance', attendance);
        formData.append('ip', ipAddress);
        formData.append('userAgent', navigator.userAgent);
        
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error saving message:', error);
        return { success: false, message: error.toString() };
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

if (guestbookForm) {
    guestbookForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('guestName').value.trim();
        const message = document.getElementById('guestMessage').value.trim();
        const attendanceSelect = document.getElementById('guestAttendance');
        const attendance = attendanceSelect.value;
        
        if (!name || !message || !attendance) {
            showToast('⚠️ Mohon lengkapi semua field', 'error');
            return;
        }
        
        if (name.length < 3) {
            showToast('⚠️ Nama minimal 3 karakter', 'error');
            return;
        }
        
        if (message.length > 500) {
            showToast('⚠️ Ucapan maksimal 500 karakter', 'error');
            return;
        }
        
        const ipAddress = await getClientIP();
        
        const submitBtn = guestbookForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Mengirim...';
        submitBtn.disabled = true;
        
        const result = await saveMessage(name, message, attendance, ipAddress);
        
        if (result.success) {
            guestbookForm.reset();
            showToast('✨ ' + result.message + ' ✨', 'success');
            loadMessages();
        } else {
            showToast('❌ ' + (result.message || 'Gagal mengirim ucapan'), 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// ===== TOAST =====
function showToast(message, type = 'success') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-notification mb-2 ${type}`;
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2 text-gold"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===== GIFT =====
const copyBankBtn = document.getElementById('copyBankBtn');
const showAddressBtn = document.getElementById('showAddressBtn');
const addressBox = document.getElementById('addressBox');

if (copyBankBtn) {
    copyBankBtn.addEventListener('click', function() {
        const bankNumber = '081232871066';
        
        navigator.clipboard.writeText(bankNumber).then(() => {
            showToast('✨ Nomor rekening berhasil disalin! ✨', 'success');
        }).catch(() => {
            showToast('❌ Gagal menyalin nomor rekening', 'error');
        });
    });
}

if (showAddressBtn) {
    showAddressBtn.addEventListener('click', function() {
        if (addressBox.style.display === 'none' || addressBox.style.display === '') {
            addressBox.style.display = 'block';
        } else {
            addressBox.style.display = 'none';
        }
    });
}

// ===== FADE-IN GAMBAR LAZY =====
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) {
        img.style.opacity = '1';
    } else {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.4s ease';
        img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
        img.addEventListener('error', () => { img.style.opacity = '1'; }, { once: true });
    }
});
