document.addEventListener("DOMContentLoaded", () => {
    
    // --- DOM Elements ---
    const welcomeGate = document.getElementById("welcomeGate");
    const waxSeal = document.getElementById("waxSeal");
    const envelope = document.getElementById("envelope");
    const mainContent = document.getElementById("mainContent");
    const bgMusic = document.getElementById("bgMusic");
    const audioToggle = document.getElementById("audioToggle");
    const rsvpForm = document.getElementById("rsvpForm");
    const wishesBoard = document.getElementById("wishesBoard");

    // --- 1. Split Gate Open ---
    let gateOpened = false;

    function openGate() {
        if (gateOpened) return;
        gateOpened = true;

        const gateLeft  = document.getElementById('gateLeft');
        const gateRight = document.getElementById('gateRight');
        const hintWrap  = document.querySelector('.gate-hint-wrap');

        // Fade out hint
        if (hintWrap) hintWrap.style.opacity = '0';

        // Slide panels apart
        if (gateLeft)  gateLeft.classList.add('open');
        if (gateRight) gateRight.classList.add('open');

        // Reveal main content after panels start moving
        setTimeout(() => {
            mainContent.classList.remove('hidden-scroll');
            audioToggle.classList.remove('hidden');
            playAudio();
            initScrollAnimations();
        }, 400);

        // Remove gate from DOM
        setTimeout(() => {
            welcomeGate.style.display = 'none';
        }, 1200);
    }

    if (welcomeGate) {
        welcomeGate.addEventListener('click', openGate);
    }

    // --- 2. Audio Player Management ---
    let isPlaying = false;

    function playAudio() {
        bgMusic.play()
            .then(() => {
                isPlaying = true;
                audioToggle.classList.add("playing");
            })
            .catch((error) => {
                console.log("Audio autoplay prevented by browser. Waiting for interaction.", error);
            });
    }

    function toggleAudio() {
        if (isPlaying) {
            bgMusic.pause();
            isPlaying = false;
            audioToggle.classList.remove("playing");
        } else {
            bgMusic.play();
            isPlaying = true;
            audioToggle.classList.add("playing");
        }
    }

    audioToggle.addEventListener("click", toggleAudio);



    // --- 4. Countdown Timer ---
    // Target Date: 19 July 2026 10:00:00 AM (India Time is UTC +5:30)
    const targetDate = new Date("2026-07-19T10:00:00+05:30").getTime();

    const daysVal = document.getElementById("days");
    const hoursVal = document.getElementById("hours");
    const minutesVal = document.getElementById("minutes");
    const secondsVal = document.getElementById("seconds");

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            document.getElementById("countdownTimer").innerHTML = `
                <div class="timer-item" style="min-width: 100%; font-family: var(--font-heading); font-size: 1.5rem; color: var(--gold-light);">
                    The Blessed Celebration Has Begun!
                </div>
            `;
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysVal.textContent = days.toString().padStart(2, "0");
        hoursVal.textContent = hours.toString().padStart(2, "0");
        minutesVal.textContent = minutes.toString().padStart(2, "0");
        secondsVal.textContent = seconds.toString().padStart(2, "0");
    }

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    // --- 5. Scroll Reveal (Intersection Observer) ---
    function initScrollAnimations() {
        const revealElements = document.querySelectorAll(".scroll-reveal");

        const observerOptions = {
            root: null,
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    }

    // --- 6. Interactive RSVP & Wishes Guestbook ---
    const initialWishes = [
        {
            name: "Fathima & Family",
            attendance: "yes",
            message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair. Hearty congratulations to Shaheen and Nidha! Wishing you both a lifetime of happiness, love, and endless blessings."
        },
        {
            name: "Dr. Niyas Muhammed",
            attendance: "yes",
            message: "So happy to see this beautiful union! May Allah shower His mercy upon your new journey together. Excited for the reception!"
        },
        {
            name: "Aisha PT",
            attendance: "yes",
            message: "Wishing dearest Nidha and Shaheen a blessed married life. May Allah fill your home with peace (Sakinah) and joy."
        }
    ];

    function saveWishes(wishes) {
        try {
            localStorage.setItem("wedding_wishes", JSON.stringify(wishes));
            return true;
        } catch (e) {
            // Check for QuotaExceededError across different browsers
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014) {
                if (wishes.length > 1) {
                    // Delete the oldest wish (the first one at index 0)
                    wishes.shift();
                    // Try saving again
                    return saveWishes(wishes);
                }
            }
            console.error("Failed to save wishes:", e);
            return false;
        }
    }

    function getWishes() {
        const stored = localStorage.getItem("wedding_wishes");
        if (stored) {
            return JSON.parse(stored);
        } else {
            saveWishes(initialWishes);
            return initialWishes;
        }
    }

    function renderWishes() {
        const wishes = getWishes();
        wishesBoard.innerHTML = "";

        wishes.slice().reverse().forEach(wish => {
            const isAttending = wish.attendance === "yes";
            const statusLabel = isAttending ? "Attending" : "Declined";
            const statusClass = isAttending ? "attending" : "absent";

            const wishItem = document.createElement("div");
            wishItem.className = "wish-item";
            wishItem.innerHTML = `
                <div class="wish-header">
                    <span class="wish-author">${escapeHtml(wish.name)}</span>
                    <span class="wish-status ${statusClass}">${statusLabel}</span>
                </div>
                <p class="wish-text">${escapeHtml(wish.message)}</p>
            `;
            wishesBoard.appendChild(wishItem);
        });
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    rsvpForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const nameInput = document.getElementById("guestName").value.trim();
        const attendanceInput = document.getElementById("attendance").value;
        const messageInput = document.getElementById("duaMessage").value.trim();

        if (!nameInput || !attendanceInput || !messageInput) {
            alert("Please fill in all the required fields.");
            return;
        }

        const newWish = {
            name: nameInput,
            attendance: attendanceInput,
            message: messageInput
        };

        const currentWishes = getWishes();
        currentWishes.push(newWish);
        saveWishes(currentWishes);

        renderWishes();
        rsvpForm.reset();

        const submitBtn = document.getElementById("submitBtn");
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sent with Love! ✨";
        submitBtn.style.background = "linear-gradient(135deg, #2E7D32, #4CAF50, #2E7D32)";
        submitBtn.style.color = "#fff";
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = "";
            submitBtn.style.color = "";
            submitBtn.disabled = false;
        }, 3000);

        wishesBoard.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // Initial Wishes Render
    renderWishes();

    // --- 9. Scroll-Linked Background Video Play/Pause Control ---
    let scrollTimeout;
    let reverseInterval = null;
    let playbackDirection = 1; // 1 = forward, -1 = reverse

    function startReversePlayback(video) {
        if (reverseInterval) return; // Already running
        
        const fps = 24;
        const intervalTime = 1000 / fps;
        const decrement = (1 / fps) * (video.playbackRate || 1);

        reverseInterval = setInterval(() => {
            if (video.currentTime > 0.05) {
                video.currentTime = Math.max(0, video.currentTime - decrement);
            } else {
                video.currentTime = 0;
                clearInterval(reverseInterval);
                reverseInterval = null;
                playbackDirection = 1; // Reset to forward direction
            }
        }, intervalTime);
    }

    function stopReversePlayback() {
        if (reverseInterval) {
            clearInterval(reverseInterval);
            reverseInterval = null;
        }
    }

    const bgVideoHero = document.getElementById("bgVideoHero");
    const bgVideoInvitation = document.getElementById("bgVideoInvitation");

    if (bgVideoHero) {
        bgVideoHero.addEventListener("ended", () => {
            playbackDirection = -1;
            // Start reverse playback immediately if scrolling
            if (welcomeGate && welcomeGate.classList.contains("slide-up")) {
                startReversePlayback(bgVideoHero);
            }
        });
    }

    window.addEventListener("scroll", () => {
        // Only trigger scroll control after the gate has been opened
        if (!gateOpened) return;

        // Clear any active pause timer
        clearTimeout(scrollTimeout);
        
        // Determine active video
        const activeVideo = document.querySelector(".bg-video-container video.active");
        if (activeVideo) {
            if (activeVideo === bgVideoHero && playbackDirection === -1) {
                startReversePlayback(bgVideoHero);
            } else {
                if (activeVideo.paused) {
                    activeVideo.play().catch(err => {
                        console.log("Playback deferred:", err);
                    });
                }
            }
        }
        
        // Queue a pause action after 250ms of no scroll
        scrollTimeout = setTimeout(() => {
            const videos = document.querySelectorAll(".bg-video-container video");
            videos.forEach(video => {
                if (!video.paused) video.pause();
            });
            stopReversePlayback();
        }, 250);
    }, { passive: true });

    // --- 10. Background Video Switcher on Scroll ---
    const heroSection = document.getElementById("hero");

    if (bgVideoHero && bgVideoInvitation && heroSection) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Hero section in viewport -> show Hero video, hide Invitation video
                    bgVideoInvitation.classList.remove("active");
                    bgVideoHero.classList.add("active");
                    
                    // Pause inactive video
                    bgVideoInvitation.pause();
                } else {
                    // Hero section scrolled out -> show Invitation video, hide Hero video
                    bgVideoHero.classList.remove("active");
                    bgVideoInvitation.classList.add("active");
                    
                    // Pause inactive video
                    bgVideoHero.pause();
                }
            });
        }, {
            root: null,
            threshold: 0.1 // Trigger when 10% or more of Hero section is visible
        });

        videoObserver.observe(heroSection);
    }

    // --- 11. Scratch to Reveal Countdown ---
    const canvas = document.getElementById("scratchCanvas");
    const wrapper = document.querySelector(".countdown-reveal-wrapper");
    if (canvas && wrapper) {
        const ctx = canvas.getContext("2d");
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        function resizeCanvas() {
            canvas.width = wrapper.offsetWidth;
            canvas.height = wrapper.offsetHeight;
            drawOverlay();
        }

        function drawOverlay() {
            ctx.globalCompositeOperation = 'source-over';
            
            // Gold gradient styling
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, "#8E6E43");
            grad.addColorStop(0.5, "#D8C3A5");
            grad.addColorStop(1, "#8E6E43");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Dashed frame
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
            
            // Text instructions
            ctx.setLineDash([]);
            ctx.fillStyle = "#1A0D08"; // Dark chocolate text
            ctx.font = "bold 13px 'Montserrat', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Scratch to Reveal Countdown ✨", canvas.width / 2, canvas.height / 2);
        }

        // Initialize sizes
        resizeCanvas();
        // Wait a small delay to make sure layout is painted for clientWidth
        setTimeout(resizeCanvas, 300);
        window.addEventListener("resize", resizeCanvas);

        function scratch(e) {
            if (!isDrawing) return;
            e.preventDefault();
            
            const rect = canvas.getBoundingClientRect();
            let x, y;
            
            if (e.touches && e.touches[0]) {
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            } else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Smooth paths
            if (lastX !== 0 && lastY !== 0) {
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.lineWidth = 40;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
            
            lastX = x;
            lastY = y;
            
            checkScratchPercentage();
        }

        function startDrawing(e) {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            if (e.touches && e.touches[0]) {
                lastX = e.touches[0].clientX - rect.left;
                lastY = e.touches[0].clientY - rect.top;
            } else {
                lastX = e.clientX - rect.left;
                lastY = e.clientY - rect.top;
            }
        }

        function stopDrawing() {
            isDrawing = false;
            lastX = 0;
            lastY = 0;
        }

        let checked = false;
        function checkScratchPercentage() {
            if (checked) return;
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imgData.data;
            let transparentCount = 0;
            
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) {
                    transparentCount++;
                }
            }
            
            const percentage = (transparentCount / (canvas.width * canvas.height)) * 100;
            if (percentage > 35) {
                checked = true;
                canvas.style.opacity = "0";
                canvas.style.pointerEvents = "none";
                setTimeout(() => {
                    canvas.style.display = "none";
                }, 400);
            }
        }

        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", scratch);
        canvas.addEventListener("mouseup", stopDrawing);
        canvas.addEventListener("mouseleave", stopDrawing);

        canvas.addEventListener("touchstart", startDrawing);
        canvas.addEventListener("touchmove", scratch);
        canvas.addEventListener("touchend", stopDrawing);
    }

    // --- 11. Code & Copy Protection (Anti-Inspect / Anti-Copy) ---
    // Disable right-click context menu
    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    // Disable dragging of images/assets
    document.addEventListener("dragstart", (e) => {
        e.preventDefault();
    });

    // Block keyboard shortcuts for inspect element, print, view-source, select-all
    document.addEventListener("keydown", (e) => {
        // F12 key
        if (e.key === "F12" || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }

        // Ctrl + Shift + I/J/C (Developer Tools)
        if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }

        // Ctrl + U (View Source)
        if (e.ctrlKey && (e.key === "u" || e.key === "U" || e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }

        // Ctrl + S (Save Page)
        if (e.ctrlKey && (e.key === "s" || e.key === "S" || e.keyCode === 83)) {
            e.preventDefault();
            return false;
        }

        // Ctrl + A (Select All)
        if (e.ctrlKey && (e.key === "a" || e.key === "A" || e.keyCode === 65)) {
            e.preventDefault();
            return false;
        }

        // Ctrl + C (Copy)
        if (e.ctrlKey && (e.key === "c" || e.key === "C" || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl + P (Print)
        if (e.ctrlKey && (e.key === "p" || e.key === "P" || e.keyCode === 80)) {
            e.preventDefault();
            return false;
        }
    });
});
