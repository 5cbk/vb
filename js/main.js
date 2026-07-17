/* ============================================================
   Video Portfolio — Main JS
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const videos = [
    { category: '口播', src: 'https://zuopinji-1421400524.cos.ap-guangzhou.myqcloud.com/%E6%8E%A7%E4%BB%B7.mp4', thumb: '缩略图/控价.png' },
    { category: '口播', src: 'https://zuopinji-1421400524.cos.ap-guangzhou.myqcloud.com/%E5%81%A5%E5%BA%B7.mp4', thumb: '缩略图/健康.png' },
    { category: '口播', src: 'https://zuopinji-1421400524.cos.ap-guangzhou.myqcloud.com/%E8%A1%A3%E6%9C%8D.mp4', thumb: '缩略图/衣服.png' },
    { category: '信息流', src: 'https://zuopinji-1421400524.cos.ap-guangzhou.myqcloud.com/%E7%BA%B8%E5%B7%BE.mp4', thumb: '缩略图/纸巾.png' },
    { category: '信息流', src: 'https://zuopinji-1421400524.cos.ap-guangzhou.myqcloud.com/%E4%BF%9D%E6%B9%BF%E6%B0%B4.mp4', thumb: '缩略图/保湿水.png' },
    { category: '信息流', src: 'https://zuopinji-1421400524.cos.ap-guangzhou.myqcloud.com/%E9%A5%BC.mp4', thumb: '缩略图/饼.png' },
    { category: 'AI生成', src: 'https://zuopinji-1421400524.cos.ap-guangzhou.myqcloud.com/%E9%95%BF%E5%BB%8A.mp4', thumb: '缩略图/长廊.png' },
    { category: 'AI生成', src: 'https://zuopinji-1421400524.cos.ap-guangzhou.myqcloud.com/%E5%A5%B3%E9%85%8D%E6%88%90%E5%93%81.mp4', thumb: '缩略图/女配.png' },
    { category: '混剪', src: 'https://zuopinji-1421400524.cos.ap-guangzhou.myqcloud.com/%E6%B7%B7%E5%89%AA.mp4', thumb: '缩略图/混剪.png' },
];

const CATEGORIES = ['口播', '信息流', 'AI生成', '混剪'];

const overlayPath = document.querySelector('.overlay__path');
const modal = document.getElementById('modal');
const modalVideo = document.getElementById('modalVideo');
const modalClose = document.getElementById('modalClose');
const header = document.getElementById('header');
const filterNav = document.getElementById('filterNav');
const scrollToWorksBtn = document.getElementById('scrollToWorks');
const curtainPanel = document.querySelector('.curtain__panel');
const worksSection = document.getElementById('works');

let page = 1;
let isAnimating = false;
let curtainPlayed = false;

let lenis;

function switchPages() {
    modal.classList.toggle('open', page === 2);
}

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

function playVideo(videoData) {
    if (isAnimating) return;
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

    const maxW = window.innerWidth * 0.9;
    const maxH = window.innerHeight * 0.85;
    const videoRatio = vw / vh;

    let w, h;
    if (videoRatio >= 1) {
        w = Math.min(vw, maxW);
        h = w / videoRatio;
        if (h > maxH) { h = maxH; w = h * videoRatio; }
    } else {
        h = Math.min(vh, maxH);
        w = h * videoRatio;
        if (w > maxW) { w = maxW; h = w / videoRatio; }
    }

    wrap.style.width = `${w}px`;
    wrap.style.height = `${h}px`;
}

function closeVideo() {
    if (isAnimating) return;
    modalVideo.pause();
    transitionToMain();
    setTimeout(() => {
        modalVideo.removeAttribute('src');
        const wrap = document.querySelector('.modal__video-wrap');
        wrap?.style.removeProperty('width');
        wrap?.style.removeProperty('height');
        wrap?.style.removeProperty('aspect-ratio');
    }, 1100);
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

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'card__thumb-wrap';

    const cover = document.createElement('img');
    cover.className = 'card__cover';
    cover.src = videoData.thumb;
    cover.alt = '';
    cover.draggable = false;
    cover.loading = 'lazy';

    const overlay = document.createElement('div');
    overlay.className = 'card__overlay';

    const badge = document.createElement('span');
    badge.className = 'card__badge';
    badge.textContent = 'Preview';

    const play = document.createElement('div');
    play.className = 'card__play';

    thumbWrap.appendChild(cover);
    thumbWrap.appendChild(overlay);
    thumbWrap.appendChild(badge);
    thumbWrap.appendChild(play);
    media.appendChild(thumbWrap);

    card.appendChild(media);

    card.addEventListener('click', () => playVideo(videoData));
    card.addEventListener('contextmenu', e => e.preventDefault());

    setupCardTilt(card, media);

    return card;
}

function setupCardTilt(card, media) {
    if (window.matchMedia('(hover: none)').matches) return;
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(media, { rotateY: x * 10, rotateX: -y * 10, duration: 0.45, ease: 'power2.out', overwrite: true });
    });
    card.addEventListener('mouseleave', () => {
        gsap.to(media, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power2.out', onComplete: () => gsap.set(media, { clearProps: 'transform' }) });
    });
}

function buildFilmstrip() {
    const track = document.getElementById('filmstripTrack');
    if (!track) return;
    track.innerHTML = '';
    const appendItems = () => {
        videos.forEach(v => {
            const item = document.createElement('div');
            item.className = 'filmstrip__item';
            const img = document.createElement('img');
            img.src = v.thumb;
            img.alt = '';
            img.draggable = false;
            img.loading = 'lazy';
            item.appendChild(img);
            track.appendChild(item);
        });
    };
    appendItems();
    appendItems();
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

function playCurtainAnimation(onComplete) {
    if (curtainPlayed) { onComplete?.(); return; }
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
    playCurtainAnimation(() => smoothScrollTo(targetY));
}

function setupCurtainScroll() {
    ScrollTrigger.create({
        id: 'heroPin', trigger: '#hero', start: 'top top', end: '+=90%', pin: true, pinSpacing: true, anticipatePin: 1,
        onUpdate: (self) => {
            gsap.to('.hero__inner', { opacity: 1 - self.progress * 1.2, y: -self.progress * 60, duration: 0.1, overwrite: true });
            gsap.to('.hero__marquee-track', { scale: 1.4 - self.progress * 0.35, duration: 0.1, overwrite: true });
            if (self.progress > 0.45 && !curtainPlayed) playCurtainAnimation();
        },
    });
    scrollToWorksBtn.addEventListener('click', scrollToWorks);
}

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
            sections.forEach(s => s.classList.toggle('is-hidden', cat !== 'all' && s.dataset.category !== cat));
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
    window.addEventListener('resize', () => moveFilterIndicator(filterNav.querySelector('.filter-nav__btn.is-active')));
}

function setupCursor() {
    if (window.matchMedia('(hover: none)').matches) return;
    const outer = document.querySelector('.cursor--outer');
    const inner = document.querySelector('.cursor--inner');
    if (!outer || !inner) return;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    gsap.set([outer, inner], { xPercent: -50, yPercent: -50, x: pos.x, y: pos.y });
    document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    gsap.ticker.add(() => {
        pos.x += (mouse.x - pos.x) * 0.15;
        pos.y += (mouse.y - pos.y) * 0.15;
        gsap.set(outer, { x: pos.x, y: pos.y });
        gsap.set(inner, { x: mouse.x, y: mouse.y });
    });
    const hoverables = 'a, button, .hub-card, .filter-nav__btn, .modal__close, .hero__email';
    document.addEventListener('mouseover', (e) => { if (e.target.closest(hoverables)) document.body.classList.add('cursor-hover'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest(hoverables)) document.body.classList.remove('cursor-hover'); });
    document.body.classList.add('cursor-ready');
}

function animateHero() {
    const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
            document.body.classList.remove('loading');
            header.classList.add('visible');
            scrollToWorksBtn.classList.add('is-ready');
        },
    });
    gsap.fromTo('.hero__glow', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.6, stagger: 0.12, ease: 'power2.out', clearProps: 'opacity,scale,transform' });
    gsap.fromTo('.hero__corner', { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.06, delay: 0.15, ease: 'power2.out' });
    tl.to('.hero__name-line', { y: 0, duration: 1.1, stagger: 0.12, delay: 0.2 })
      .to('.reveal-item', { y: 0, opacity: 1, duration: 0.85, stagger: 0.07 }, '-=0.5')
      .fromTo('.hero__marquee', { opacity: 0 }, { opacity: 0.07, duration: 1.2, ease: 'power1.out' }, '-=0.8');
}

function setupLenis() {
    if (typeof Lenis === 'undefined') return;
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}

function setupHeaderTheme() {
    ScrollTrigger.create({
        trigger: worksSection, start: 'top 80%',
        onEnter: () => header.classList.add('header--scrolled'),
        onLeaveBack: () => header.classList.remove('header--scrolled'),
    });
}

function setupProximityGrid() {
    if (window.matchMedia('(hover: none)').matches) return;
    const showcase = document.getElementById('showcase');
    if (!showcase) return;
    const maxDist = 200, maxScale = 0.035;
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
            const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
            const influence = Math.max(0, 1 - dist / maxDist);
            gsap.to(card, { scale: 1 + influence * maxScale, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        });
    });
}

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
            trigger: section, start: 'top 80%', once: true,
            onEnter: () => {
                section.querySelector('.category__title-inner')?.classList.add('is-visible');
                cards.forEach((card, i) => { card.style.animationDelay = `${i * 0.08}s`; card.classList.add('is-visible'); });
            },
        });
    });
}

modalClose.addEventListener('click', closeVideo);
modal.querySelector('.modal__backdrop').addEventListener('click', closeVideo);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeVideo(); });
modalVideo.addEventListener('contextmenu', e => e.preventDefault());
modalVideo.addEventListener('loadedmetadata', fitModalToVideo);

function init() {
    gsap.set('.hero__name-line', { y: '110%' });
    gsap.set('.hero__marquee-track', { scale: 1.4 });
    gsap.set('.hero__marquee', { opacity: 0 });
    gsap.set('.hero__glow', { opacity: 0 });
    gsap.set('.hero__corner', { opacity: 0 });

    buildAllCards();
    buildFilmstrip();
    setupLenis();
    setupFilterNav();
    setupCursor();
    setupCurtainScroll();
    setupHeaderTheme();
    setupProximityGrid();
    setupScrollAnimations();
    animateHero();

    document.getElementById('workCount').textContent = videos.length;
    document.getElementById('workCountDup').textContent = videos.length;
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }