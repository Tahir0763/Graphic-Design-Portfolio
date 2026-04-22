/**
 * HIGH LEVEL INTERNATIONAL ANIMATION SYSTEM
 * Powered by Three.js (WebGL Web Graphics) & GSAP (GreenSock)
 */

document.addEventListener("DOMContentLoaded", () => {
    
    gsap.registerPlugin(ScrollTrigger);

    // ==================================================
    // 1. CUSTOM SYSTEM CURSOR
    // ==================================================
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

    gsap.to({}, 0.016, {
        repeat: -1,
        onRepeat: () => {
            posX += (mouseX - posX) / 9;
            posY += (mouseY - posY) / 9;
            
            gsap.set(cursor, { css: { left: mouseX, top: mouseY } });
            gsap.set(follower, { css: { left: posX, top: posY } });
        }
    });

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Magnetic / Hover logic
    const magnetics = document.querySelectorAll('.magnetic');
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
            gsap.to(btn, { x: x, y: y, duration: 0.3 });
            document.body.classList.add('hovering');
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
            document.body.classList.remove('hovering');
        });
    });

    // ==================================================
    // 2. THREE.JS INTERACTIVE PARTICLE FIELD
    // Uses fundamental, error-proof Three.js mechanics
    // ==================================================
    function initThreeJS() {
        if(typeof THREE === 'undefined') return;

        const canvas = document.querySelector('#webgl-canvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Particle System
        const geometry = new THREE.BufferGeometry();
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 400; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 400; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
            scales[i] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

        // Custom Shader Material for glow particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color('#9b59ff') }
            },
            vertexShader: `
                uniform float uTime;
                attribute float aScale;
                varying float vScale;
                void main() {
                    vScale = aScale;
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    // Wave motion
                    modelPosition.y += sin(modelPosition.x * 0.02 + uTime) * 10.0;
                    modelPosition.z += cos(modelPosition.x * 0.02 + uTime) * 10.0;
                    
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    gl_Position = projectedPosition;
                    gl_PointSize = (10.0 * aScale) * (100.0 / -viewPosition.z);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vScale;
                void main() {
                    // Soft circle
                    float strength = distance(gl_PointCoord, vec2(0.5));
                    strength = 1.0 - strength;
                    strength = pow(strength, 3.0);
                    gl_FragColor = vec4(uColor, strength * 0.8);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let mouse = { x: 0, y: 0 };
        let targetMouse = { x: 0, y: 0 };
        document.addEventListener('mousemove', (event) => {
            targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });

        document.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                targetMouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                targetMouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });

        const clock = new THREE.Clock();

        function tick() {
            const elapsedTime = clock.getElapsedTime();
            material.uniforms.uTime.value = elapsedTime * 0.5;

            // Camera movement based on mouse
            mouse.x += (targetMouse.x - mouse.x) * 0.05;
            mouse.y += (targetMouse.y - mouse.y) * 0.05;
            camera.position.x = mouse.x * 30;
            camera.position.y = mouse.y * 30;
            camera.lookAt(scene.position);

            // Rotate entire scene based on vertical scroll
            scene.rotation.x = window.scrollY * 0.0005;

            renderer.render(scene, camera);
            window.requestAnimationFrame(tick);
        }
        tick();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initThreeJS();

    // ==================================================
    // 3. GSAP PRELOADER & HERO ENTRANCE (THE "WOW" FACTOR)
    // ==================================================
    const tl = gsap.timeline();
    let progress = { val: 0 };

    tl.to(progress, {
        val: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
            document.querySelector('.preloader-percent').textContent = Math.round(progress.val) + "%";
            document.querySelector('.preloader-progress').style.width = progress.val + "%";
        }
    })
    .to('.preloader-text', { y: 50, opacity: 0, duration: 0.5 }, "-=0.5")
    .to('.preloader', {
        yPercent: -100,
        duration: 1.2,
        ease: "expo.inOut"
    })
    // Split Text Entrance
    .to('.char-wrap', {
        y: '0%',
        duration: 1.5,
        stagger: 0.2,
        ease: "expo.out"
    }, "-=0.5")
    .to('.fade-up', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out"
    }, "-=1");

    // ==================================================
    // 4. GSAP CONTINUOUS MARQUEE SCROLL
    // ==================================================
    gsap.to('#marquee-1 .marquee-text', {
        xPercent: -50,
        ease: "none",
        scrollTrigger: {
            trigger: ".marquee-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    gsap.to('#marquee-2 .marquee-text', {
        xPercent: 50,
        ease: "none",
        scrollTrigger: {
            trigger: ".marquee-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // ==================================================
    // 5. GSAP SCROLL REVEALS & PARALLAX
    // ==================================================
    
    // Project Clip Reveal, Parallax & Stacking
    const projects = document.querySelectorAll('.project-item');
    projects.forEach((proj, i) => {
        const reveal = proj.querySelector('.image-reveal');
        const img = proj.querySelector('.project-image');
        
        // Reveal mask
        gsap.to(reveal, {
            height: 0,
            ease: "expo.inOut",
            scrollTrigger: {
                trigger: proj,
                start: "top 70%",
                end: "center center",
                scrub: 1
            }
        });

        // Image Parallax
        gsap.to(img, {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: proj,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // 3D Stacking Effect (skip the last project)
        if (i !== projects.length - 1) {
            gsap.to(proj, {
                scale: 0.92,
                opacity: 0.5,
                filter: "blur(5px)",
                scrollTrigger: {
                    trigger: proj,
                    start: "top 15%", // Triggers exactly as it becomes sticky
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    });

    // Counter Animations
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        let target = parseInt(counter.dataset.target);
        gsap.to(counter, {
            innerHTML: target,
            duration: 2,
            snap: { innerHTML: 1 },
            scrollTrigger: {
                trigger: counter,
                start: "top 85%"
            }
        });
    });

    // Fade Up Elements
    gsap.utils.toArray('.fade-up:not(.hero-subtitle):not(.scroll-indicator)').forEach(elem => {
        gsap.set(elem, { y: 50, opacity: 0 });
        gsap.to(elem, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: elem,
                start: "top 85%"
            }
        });
    });

});
