/* ============================================================
   Video Portfolio — Main JS
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const videos = [
    { category: '口播', src: 'https://s17.aconvert.com/convert/p3r68-cdx67/jpss3-vk4ix.mp4' },
    { category: '口播', src: 'https://s21.aconvert.com/convert/p3r68-cdx67/izibc-pe5kl.mp4' },
    { category: '口播', src: 'https://s3.aconvert.com/convert/p3r68-cdx67/bh06p-t7gzg.mp4' },
    { category: '信息流', src: 'https://s31.aconvert.com/convert/p3r68-cdx67/1su9j-25zi2.mp4' },
    { category: '信息流', src: 'https://s3.aconvert.com/convert/p3r68-cdx67/72ykb-f3g3c.mp4' },
    { category: '信息流', src: 'https://s33.aconvert.com/convert/p3r68-cdx67/cpgs6-b35yx.mp4' },
    { category: 'AI原创剪辑', src: 'https://s3.aconvert.com/convert/p3r68-cdx67/oq9hz-2j6jk.mp4' },
    { category: 'AI原创剪辑', src: 'https://s31.aconvert.com/convert/p3r68-cdx67/j55e3-j4ufo.mp4' },
];

const CATEGORIES = ['口播', '信息流', 'AI原创剪辑'];

const overlayPath = document.querySelector('.overlay__path');
const modal = document.getElementById('modal');
const modalVideo = document.getElementById('modalVideo');
const modalClose = document.getElementById('modalClose');
const header = document.getElementById('header');
const filterNav = document.getElementById('filterNav');
const scrollToWorksBtn = document.getElementById('scrollToWorks');
const curtainPanel = document.querySelector('.curtain__panel');
const worksSection = document.getElementById('works');

const thumbnailCache = new Map();
let page = 1;
let isAnimating = false;
let curtainPlayed = false;

let lenis;

// ============================================================
// SVG PATH TRANSITION
// ============================================================

const paths = {
    step1: {
        unfilled: 'M 0 100 V 100 Q 50 100 100 100 V 100 z',
        inBetween: {
            curve1: 'M 0 100 V 50 Q 50 0 100 50 V 100 z',
            curve2: 'M 0 100 V 50 Q 50 100 100 50 V 100 z',
        },
        filled: 'M 0 100 V 0 Q 50 0 100 0 V 100 z',
    },
    step2: {
        filled: 'M 0 0 V 100 Q 50 100 100 100 V 0 z',
        inBetween: {
            curve1: 'M 0 0 V 50 Q 50 0 100 50 V 0 z',
            curve2: 'M 0 0 V 50 Q 50 100 100 50 V 0 z',
        },
        unfilled: 'M 0 0 V 0 Q 50 0 100 0 V 0 z',
    }
};

function switchPages() {
    modal.classList.toggle('open', page === 2);
}

function transitionToModal() {
    if (isAnimating) return;
    isAnimating = true;
    page = 2;

    gsap.timeline({ onComplete: () => { isAnimating = false; } })
        .set(overlayPath, { attr: { d: paths.step1.unfilled } })
        .to(overlayPath, { duration: 0.7, ease: 'power4.in', attr: { d: paths.step1.inBetween.curve1 } }, 0)
        .to(overlayPath, { duration: 0.18, ease: 'power1', attr: { d: paths.step1.filled }, onComplete: switchPages })
        .set(overlayPath, { attr: { d: paths.step2.filled } })
        .to(overlayPath, { duration: 0.18, ease: 'sine.in', attr: { d: paths.step2.inBetween.curve1 } })
        .to(overlayPath, { duration: 0.9, ease: 'power4', attr: { d: paths.step2.unfilled } });
}

function transitionToMain() {
    if (isAnimating) return;
    isAnimating = true;
    page = 1;

    gsap.timeline({ onComplete: () => { isAnimating = false; } })
        .set(overlayPath, { attr: { d: paths.step2.unfilled } })
        .to(overlayPath, { duration: 0.7, ease: 'power4.in', attr: { d: paths.step2.inBetween.curve2 } }, 0)
        .to(overlayPath, { duration: 0.18, ease: 'power1', attr: { d: paths.step2.filled }, onComplete: switchPages })
        .set(overlayPath, { attr: { d: paths.step1.filled } })
        .to(overlayPath, { duration: 0.18, ease: 'sine.in', attr: { d: paths.step1.inBetween.curve2 } })
        .to(overlayPath, { duration: 0.9, ease: 'power4', attr: { d: paths.step1.unfilled } });
}

// ============================================================
// PLAY / CLOSE
// ============================================================

function playVideo(videoData) {
    if (isAnimating) return;
    // aconvert 等外链不返回匹配 CORS，不能设 crossOrigin，否则无法播放
    modalVideo.removeAttribute('crossorigin');
    modalVideo.src = videoData.src;
    modalVideo.load();
    transitionToModal();
    setTimeout(() => { modalVideo.play().catch(() => {}); }, 800);
}

function fitModalToVideo() {
    const wrap = document.querySelector('.modal__video-wrap');
    const vw = modalVideo.videoWidth;
    const vh = modalVideo.videoHeight;
    if (!wrap || !vw || !vh) return;
    wrap.style.aspectRatio = `${vw} / ${vh}`;
}

function closeVideo() {
    if (isAnimating) return;
    modalVideo.pause();
    transitionToMain();
    setTimeout(() => {
        modalVideo.removeAttribute('src');
        document.querySelector('.modal__video-wrap')?.style.removeProperty('aspect-ratio');
    }, 1100);
}

// ============================================================
// THUMBNAILS
// ============================================================

function generateThumbnail(src) {
    if (thumbnailCache.has(src)) {
        return Promise.resolve(thumbnailCache.get(src));
    }

    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.src = src;
        video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;top:-10px;left:-10px;';
        document.body.appendChild(video);

        let resolved = false;
        const cleanup = () => { if (video.parentNode) video.parentNode.removeChild(video); };

        const capture = () => {
            if (resolved) return;
            resolved = true;
            const w = video.videoWidth, h = video.videoHeight;
            if (w > 0 && h > 0) {
                try {
                    const c = document.createElement('canvas');
                    c.width = w; c.height = h;
                    c.getContext('2d').drawImage(video, 0, 0, w, h);
                    const dataUrl = c.toDataURL('image/jpeg', 0.82);
                    thumbnailCache.set(src, dataUrl);
                    cleanup();
                    resolve(dataUrl);
                } catch {
                    // 跨域视频无法截帧，不影响播放
                    cleanup();
                    resolve(null);
                }
            } else {
                cleanup();
                resolve(null);
            }
        };

        video.addEventListener('loadeddata', () => {
            if (resolved) return;
            if (video.duration > 0.2) video.currentTime = 0.1;
            else capture();
        });
        video.addEventListener('seeked', () => { if (!resolved) capture(); });
        video.addEventListener('error', () => { if (!resolved) { resolved = true; cleanup(); resolve(null); } });

        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                if (video.readyState >= 2 && video.videoWidth > 0) capture();
                else { cleanup(); resolve(null); }
            }
        }, 5000);
    });
}

// ============================================================
// VIDEO CARDS
// ============================================================

function buildFilmstrip() {
    const track = document.getElementById('filmstripTrack');
    if (!track || thumbnailCache.size < videos.length) return;

    track.innerHTML = '';
    const urls = videos.map(v => thumbnailCache.get(v.src)).filter(Boolean);

    const appendItems = () => {
        urls.forEach(url => {
            const item = document.createElement('div');
            item.className = 'filmstrip__item';
            const img = document.createElement('img');
            img.src = url;
            img.alt = '';
            img.draggable = false;
            item.appendChild(img);
            track.appendChild(item);
        });
    };

    appendItems();
    appendItems();
}

const CARD_TILTS = [-1.4, 0.9, -0.6, 1.1, -0.8, 0.5, -1, 0.7];

function buildCard(videoData, index) {
    const card = document.createElement('article');
    card.className = 'hub-card video-card';
    card.dataset.category = videoData.category;
    card.style.animationDelay = `${index * 0.08}s`;

    const media = document.createElement('div');
    media.className = 'hub-card__media';
    media.style.setProperty('--card-tilt', `${CARD_TILTS[index % CARD_TILTS.length]}deg`);

    const loading = document.createElement('div');
    loading.className = 'card__loading';
    loading.innerHTML = '<div class="card__loading-line"></div>';

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'card__thumb-wrap';

    const preview = document.createElement('video');
    preview.className = 'card__preview';
    preview.muted = true;
    preview.loop = true;
    preview.playsInline = true;
    preview.preload = 'metadata';
    preview.setAttribute('disablePictureInPicture', '');

    const overlay = document.createElement('div');
    overlay.className = 'card__overlay';

    const badge = document.createElement('span');
    badge.className = 'card__badge';
    badge.textContent = 'Preview';

    const play = document.createElement('div');
    play.className = 'card__play';

    thumbWrap.appendChild(preview);
    thumbWrap.appendChild(overlay);
    thumbWrap.appendChild(badge);
    thumbWrap.appendChild(play);
    media.appendChild(loading);
    media.appendChild(thumbWrap);

    card.appendChild(media);

    card.addEventListener('click', () => playVideo(videoData));
    card.addEventListener('contextmenu', e => e.preventDefault());

    setupCardCover(card, preview, loading, videoData.src);
    setupCardPreview(card, preview, videoData.src);
    setupCardTilt(card, media);

    generateThumbnail(videoData.src).then(() => buildFilmstrip());

    return card;
}

function setupCardCover(card, preview, loading, src) {
    let frameReady = false;

    const revealCover = () => {
        if (frameReady || card.classList.contains('is-previewing')) return;
        frameReady = true;
        preview.pause();
        loading.classList.add('hidden');
        card.classList.add('has-cover');
    };

    preview.addEventListener('loadeddata', () => {
        if (preview.duration > 0.05) preview.currentTime = 0.05;
        else revealCover();
    });
    preview.addEventListener('seeked', revealCover);
    preview.addEventListener('error', () => loading.classList.add('hidden'));

    preview.src = src;
}

function setupCardTilt(card, media) {
    if (window.matchMedia('(hover: none)').matches) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(media, {
            rotateY: x * 10,
            rotateX: -y * 10,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: true,
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(media, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.7,
            ease: 'power2.out',
            onComplete: () => gsap.set(media, { clearProps: 'transform' }),
        });
    });
}

function setupCardPreview(card, preview, src) {
    if (window.matchMedia('(hover: none)').matches) return;

    card.addEventListener('mouseenter', () => {
        card.classList.add('is-previewing');
        preview.currentTime = 0;
        preview.play().catch(() => {});
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('is-previewing');
        preview.pause();
        if (card.classList.contains('has-cover')) {
            preview.currentTime = 0.05;
        }
    });
}

function buildAllCards() {
    CATEGORIES.forEach(category => {
        const grid = document.getElementById(`row-${category}`);
        if (!grid) return;
        videos.filter(v => v.category === category).forEach((video, i) => {
            grid.appendChild(buildCard(video, i));
        });
    });
}

// ============================================================
// CURTAIN ANIMATION
// ============================================================

function playCurtainAnimation(onComplete) {
    if (curtainPlayed) {
        onComplete?.();
        return;
    }
    curtainPlayed = true;

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set(curtainPanel, { clearProps: 'transform' });
            curtainPanel.style.display = 'none';
            onComplete?.();
        }
    });

    tl.set(curtainPanel, { display: 'block', yPercent: -100 })
      .to(curtainPanel, { yPercent: 0, duration: 0.65, ease: 'power3.inOut' })
      .to(curtainPanel, { yPercent: 100, duration: 0.75, ease: 'power4.in' }, '+=0.04');
}

function smoothScrollTo(y) {
    if (lenis) {
        lenis.scrollTo(y, { duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) });
        return;
    }
    const scrollEl = document.scrollingElement || document.documentElement;
    gsap.to(scrollEl, { scrollTop: y, duration: 1.1, ease: 'power3.inOut' });
}

function scrollToWorks() {
    const heroST = ScrollTrigger.getById('heroPin');
    const targetY = heroST ? heroST.end : worksSection.offsetTop;

    playCurtainAnimation(() => {
        smoothScrollTo(targetY);
    });
}

function setupCurtainScroll() {
    ScrollTrigger.create({
        id: 'heroPin',
        trigger: '#hero',
        start: 'top top',
        end: '+=90%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: (self) => {
            gsap.to('.hero__inner', {
                opacity: 1 - self.progress * 1.2,
                y: -self.progress * 60,
                duration: 0.1,
                overwrite: true,
            });
            gsap.to('.hero__marquee-track', {
                scale: 1.4 - self.progress * 0.35,
                duration: 0.1,
                overwrite: true,
            });
            if (self.progress > 0.45 && !curtainPlayed) {
                playCurtainAnimation();
            }
        },
    });

    scrollToWorksBtn.addEventListener('click', scrollToWorks);
}

// ============================================================
// FILTER NAV
// ============================================================

function moveFilterIndicator(activeBtn) {
    const indicator = filterNav.querySelector('.filter-nav__indicator');
    if (!indicator || !activeBtn) return;
    indicator.style.left = `${activeBtn.offsetLeft}px`;
    indicator.style.width = `${activeBtn.offsetWidth}px`;
}

function setupFilterNav() {
    const buttons = filterNav.querySelectorAll('.filter-nav__btn');
    const sections = document.querySelectorAll('.category');

    const setActive = (btn) => {
        buttons.forEach(b => b.classList.toggle('is-active', b === btn));
        moveFilterIndicator(btn);
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.cat;
            setActive(btn);
            sections.forEach(s => {
                s.classList.toggle('is-hidden', cat !== 'all' && s.dataset.category !== cat);
            });
            if (cat !== 'all') {
                const target = document.getElementById(`cat-${cat}`);
                if (target) {
                    if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.1 });
                    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            ScrollTrigger.refresh();
        });
    });

    requestAnimationFrame(() => moveFilterIndicator(filterNav.querySelector('.filter-nav__btn.is-active')));
    window.addEventListener('resize', () => {
        moveFilterIndicator(filterNav.querySelector('.filter-nav__btn.is-active'));
    });
}

// ============================================================
// CURSOR
// ============================================================

function setupCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const outer = document.querySelector('.cursor--outer');
    const inner = document.querySelector('.cursor--inner');
    if (!outer || !inner) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    gsap.set([outer, inner], { xPercent: -50, yPercent: -50, x: pos.x, y: pos.y });

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    gsap.ticker.add(() => {
        pos.x += (mouse.x - pos.x) * 0.15;
        pos.y += (mouse.y - pos.y) * 0.15;
        gsap.set(outer, { x: pos.x, y: pos.y });
        gsap.set(inner, { x: mouse.x, y: mouse.y });
    });

    const hoverables = 'a, button, .hub-card, .filter-nav__btn, .modal__close, .hero__email';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverables)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverables)) document.body.classList.remove('cursor-hover');
    });

    document.body.classList.add('cursor-ready');
}

// ============================================================
// HERO ANIMATION
// ============================================================

function animateHero() {
    const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
            document.body.classList.remove('loading');
            header.classList.add('visible');
            scrollToWorksBtn.classList.add('is-ready');
        },
    });

    tl.to('.hero__name-line', {
        y: 0,
        duration: 1.1,
        stagger: 0.12,
        delay: 0.2,
    })
    .to('.reveal-item', {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.07,
    }, '-=0.5');
}

// ============================================================
// LENIS + SCROLL PARALLAX
// ============================================================

function setupLenis() {
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}

function setupScrollParallax() {
    gsap.fromTo('.works__title',
        { yPercent: 30 },
        {
            yPercent: -15,
            ease: 'none',
            scrollTrigger: {
                trigger: '.works__head',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
            },
        }
    );

    document.querySelectorAll('.category__head').forEach(head => {
        gsap.fromTo(head,
            { yPercent: 40, opacity: 0.5 },
            {
                yPercent: -20,
                opacity: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: head,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.6,
                },
            }
        );
    });

    document.querySelectorAll('.hub-card').forEach(card => {
        const thumbWrap = card.querySelector('.card__thumb-wrap');
        if (!thumbWrap) return;

        gsap.fromTo(thumbWrap,
            { yPercent: -10 },
            {
                yPercent: 10,
                ease: 'none',
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.5,
                },
            }
        );
    });
}

// ============================================================
// HEADER THEME + PROXIMITY GRID
// ============================================================

function setupHeaderTheme() {
    ScrollTrigger.create({
        trigger: worksSection,
        start: 'top 80%',
        onEnter: () => header.classList.add('header--scrolled'),
        onLeaveBack: () => header.classList.remove('header--scrolled'),
    });
}

function setupProximityGrid() {
    if (window.matchMedia('(hover: none)').matches) return;

    const showcase = document.getElementById('showcase');
    if (!showcase) return;

    const maxDist = 200;
    const maxScale = 0.035;
    let inShowcase = false;

    showcase.addEventListener('mouseenter', () => { inShowcase = true; });
    showcase.addEventListener('mouseleave', () => {
        inShowcase = false;
        gsap.to('.hub-card.is-visible', { scale: 1, duration: 0.5, ease: 'power2.out' });
    });

    document.addEventListener('mousemove', (e) => {
        if (!inShowcase) return;

        document.querySelectorAll('.hub-card.is-visible').forEach(card => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
            const influence = Math.max(0, 1 - dist / maxDist);
            gsap.to(card, { scale: 1 + influence * maxScale, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        });
    });
}

// ============================================================
// SCROLL REVEAL
// ============================================================

function setupScrollAnimations() {
    document.querySelectorAll('.category').forEach(section => {
        const title = section.querySelector('.category__title');
        const cards = section.querySelectorAll('.hub-card');

        if (title) {
            const inner = document.createElement('span');
            inner.className = 'category__title-inner';
            inner.textContent = title.textContent;
            title.textContent = '';
            title.appendChild(inner);
        }

        ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            once: true,
            onEnter: () => {
                section.querySelector('.category__title-inner')?.classList.add('is-visible');
                cards.forEach((card, i) => {
                    card.style.animationDelay = `${i * 0.08}s`;
                    card.classList.add('is-visible');
                });
            },
        });
    });

    CATEGORIES.forEach(cat => {
        ScrollTrigger.create({
            trigger: `#cat-${cat}`,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => setActiveNav(cat),
            onEnterBack: () => setActiveNav(cat),
        });
    });
}

function setActiveNav(cat) {
    document.querySelectorAll('.header__link').forEach(link => {
        link.classList.toggle('is-active', link.dataset.cat === cat);
    });
}

// ============================================================
// EVENTS
// ============================================================

modalClose.addEventListener('click', closeVideo);
modal.querySelector('.modal__backdrop').addEventListener('click', closeVideo);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeVideo();
});
modalVideo.addEventListener('contextmenu', e => e.preventDefault());
modalVideo.addEventListener('loadedmetadata', fitModalToVideo);

// ============================================================
// INIT
// ============================================================

function init() {
    gsap.set('.hero__name-line', { y: '110%' });
    gsap.set('.hero__marquee-track', { scale: 1.4 });

    buildAllCards();
    setupLenis();
    setupFilterNav();
    setupCursor();
    setupCurtainScroll();
    setupHeaderTheme();
    setupProximityGrid();
    setupScrollAnimations();
    setupScrollParallax();
    animateHero();

    document.getElementById('workCount').textContent = videos.length;
    document.getElementById('workCountDup').textContent = videos.length;

    videos.forEach(v => generateThumbnail(v.src));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}