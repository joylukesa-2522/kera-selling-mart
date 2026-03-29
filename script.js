document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar style toggle & Basic Selectors
    const navbar = document.getElementById('navbar');
    const detailsSection = document.getElementById('details');
    
    // 2. Intersection Observer for Fade Ups (Framer Motion style)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeUpObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fm-fade-up').forEach(el => {
        fadeUpObserver.observe(el);
    });

    // 3. Canvas Image Sequence Animation Variables
    const canvas = document.getElementById("hero-lightpass");
    const context = canvas ? canvas.getContext("2d") : null;
    const heroContainer = document.querySelector('.js-hero-container');
    const heroBg = document.querySelector('.js-hero-bg');
    const heroContent = document.querySelector('.js-hero-content');
    const heroLines = [document.querySelector('.js-hero-line-1'), document.querySelector('.js-hero-line-2')];
    const heroSubtitle = document.querySelector('.js-hero-subtitle');

    // Canvas Frame Logic
    const startFrame = 77;
    const endFrame = 205;
    const frameCount = endFrame - startFrame + 1;
    const currentFrame = index => `../assets/images/herosection/ezgif-frame-${index.toString().padStart(3, '0')}.png`;
    const images = {};
    
    // Preload Images
    const preloadImages = () => {
        for (let i = startFrame; i <= endFrame; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images[i] = img;
        }
    };

    // Draw frame function utilizing 'cover' style object fit math
    const drawImageProp = (img) => {
        if (!context) return;
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio  = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width*ratio) / 2;
        const centerShift_y = (canvas.height - img.height*ratio) / 2;  
        context.clearRect(0,0, canvas.width, canvas.height);
        context.drawImage(img, 0,0, img.width, img.height, centerShift_x, centerShift_y, img.width*ratio, img.height*ratio);
    }

    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        preloadImages();
        
        // Render Initial Frame immediately when loaded
        if (images[startFrame]) {
            images[startFrame].onload = () => {
                drawImageProp(images[startFrame]);
            };
        }
        
        // Handle Resize to resize canvas dynamically
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            requestAnimationFrame(() => drawImageProp(images[Number(canvas.dataset.currentFrame) || startFrame]));
        });
    }

    // SCROLL LISTENER
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // --- Hero Animation (Canvas + Type) ---
        if (heroContainer && canvas) {
            const heroRect = heroContainer.getBoundingClientRect();
            const maxScroll = heroRect.height - windowHeight; // 400vh scrollable
            
            let heroProgress = 0;
            if (maxScroll > 0) {
                heroProgress = Math.min(Math.max(-heroRect.top / maxScroll, 0), 1);
            }

            // 1. Calculate and Draw specific Canvas frame
            const frameIndexOffset = Math.min(frameCount - 1, Math.floor(heroProgress * frameCount));
            const frameToDraw = startFrame + frameIndexOffset;
            
            // Remember current frame for resize handler
            canvas.dataset.currentFrame = frameToDraw;
            
            requestAnimationFrame(() => {
                if(images[frameToDraw]) {
                    drawImageProp(images[frameToDraw]);
                }
            });

            // 2. Manipulate Overlay / Scaling
            if (heroBg) {
                // Dim extremely slightly at the end if desired, or keep clear
                const overlayOpacity = Math.max(0, (heroProgress - 0.9) * 10);
                heroBg.style.filter = `brightness(${1 - overlayOpacity})`;
            }

            // 3. Text faders
            if (heroContent) {
                // Fade in lines extremely fast at the very top (0 - 5% scroll)
                heroLines.forEach((line, index) => {
                    const startFade = index * 0.05;
                    const lineProgress = Math.min(Math.max((heroProgress - startFade) / 0.1, 0), 1);
                    line.style.opacity = lineProgress;
                    line.style.transform = `translateY(${20 - (lineProgress * 20)}px)`;
                });
                
                const subProgress = Math.min(Math.max((heroProgress - 0.1) / 0.1, 0), 1);
                if (heroSubtitle) {
                    heroSubtitle.style.opacity = subProgress;
                    heroSubtitle.style.transform = `translateY(${20 - (subProgress * 20)}px)`;
                }

                // Text fades completely out before video scrubbing finishes (from 60% to 80%)
                if (heroProgress > 0.6) {
                    const fadeOut = 1 - ((heroProgress - 0.6) / 0.2);
                    heroContent.style.opacity = Math.max(0, fadeOut);
                } else {
                    heroContent.style.opacity = 1;
                }
            }
        }
    });

    // Trigger dummy scroll to set initial states immediately
    window.dispatchEvent(new Event('scroll'));
});
