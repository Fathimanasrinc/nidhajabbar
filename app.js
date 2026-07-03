document.addEventListener("DOMContentLoaded", () => {
    
    // --- Supabase Config & Client Initialization ---
    // Update these credentials with your actual Supabase Project URL and Anon Public Key:
    const SUPABASE_URL = 'https://ryuwogxpeiambcjkdxll.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dXdvZ3hwZWlhbWJjamtkeGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNDM5NjYsImV4cCI6MjA5ODYxOTk2Nn0.y2UUOXKtzP6evIVE6UviT1zYYAUCBR0Am1ezyFvNE3A';
    
    let supabase = null;
    let isSupabaseConfigured = false;
    
    if (typeof window.supabase !== 'undefined' && 
        SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
        SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        try {
            const { createClient } = window.supabase;
            supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            isSupabaseConfigured = true;
            console.log("Supabase successfully initialized.");
        } catch (e) {
            console.error("Failed to initialize Supabase client:", e);
        }
    } else {
        console.warn("Supabase is not configured yet. Falling back to local storage.");
    }
    
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
        const revealElements = document.querySelectorAll(".scroll-reveal, .slide-from-left, .slide-from-right");

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
    const initialWishes = [];

    function saveWishesLocal(wishes) {
        try {
            localStorage.setItem("wedding_wishes", JSON.stringify(wishes));
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014) {
                if (wishes.length > 1) {
                    wishes.shift();
                    return saveWishesLocal(wishes);
                }
            }
            console.error("Failed to save wishes locally:", e);
            return false;
        }
    }

    function getWishesLocal() {
        const stored = localStorage.getItem("wedding_wishes");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (!Array.isArray(parsed) || parsed.length === 0) {
                    saveWishesLocal(initialWishes);
                    return initialWishes;
                }
                
                let updated = [...parsed];
                let changed = false;
                initialWishes.forEach(dw => {
                    if (!parsed.some(w => w && w.name === dw.name)) {
                        updated.push(dw);
                        changed = true;
                    }
                });
                
                if (updated.length > 3) {
                    updated = updated.slice(updated.length - 3);
                    changed = true;
                }
                
                if (changed) {
                    saveWishesLocal(updated);
                }
                return updated;
            } catch (err) {
                console.error("Error parsing stored wishes:", err);
                saveWishesLocal(initialWishes);
                return initialWishes;
            }
        } else {
            saveWishesLocal(initialWishes);
            return initialWishes;
        }
    }

    async function renderWishes() {
        wishesBoard.innerHTML = `
            <div class="wish-item loading" style="text-align: center; height: 100px; border: none; background: transparent; box-shadow: none;">
                <p class="wish-text" style="color: var(--text-muted); font-size: 0.82rem; font-style: italic;">Loading blessings...</p>
            </div>
        `;
        
        let wishes = [];
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('wishes')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(3);
                
                if (error) throw error;
                
                if (data && data.length > 0) {
                    wishes = data.slice().reverse();
                } else {
                    wishes = initialWishes;
                }
            } catch (err) {
                console.error("Failed to fetch wishes from Supabase, using local storage:", err);
                wishes = getWishesLocal();
            }
        } else {
            wishes = getWishesLocal();
        }

        wishesBoard.innerHTML = "";

        if (wishes.length === 0) {
            wishesBoard.innerHTML = `
                <div class="wish-item loading" style="text-align: center; height: 100px; border: none; background: transparent; box-shadow: none;">
                    <p class="wish-text" style="color: var(--text-muted); font-size: 0.82rem; font-style: italic;">
                        No prayers or wishes left yet.<br>Be the first to send your blessings! ✨
                    </p>
                </div>
            `;
            return;
        }

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
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    rsvpForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById("guestName").value.trim();
        const attendanceInput = document.getElementById("attendance").value;
        const guestCountInput = document.getElementById("guestCount").value;
        const messageInput = document.getElementById("duaMessage").value.trim();

        if (!nameInput || !attendanceInput || !messageInput) {
            alert("Please fill in all the required fields.");
            return;
        }

        const guestCount = parseInt(guestCountInput, 10) || 1;
        const newWish = {
            name: nameInput,
            attendance: attendanceInput,
            guest_count: guestCount,
            message: messageInput
        };

        const submitBtn = document.getElementById("submitBtn");
        submitBtn.disabled = true;

        if (isSupabaseConfigured) {
            try {
                const { error } = await supabase
                    .from('wishes')
                    .insert([
                        {
                            name: newWish.name,
                            attendance: newWish.attendance,
                            guest_count: newWish.guest_count,
                            message: newWish.message
                        }
                    ]);
                
                if (error) throw error;
                console.log("Wish successfully saved to Supabase.");
            } catch (err) {
                console.error("Failed to save to Supabase, saving locally:", err);
                saveWishLocally(newWish);
            }
        } else {
            saveWishLocally(newWish);
        }

        await renderWishes();
        rsvpForm.reset();

        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sent with Love! ✨";
        submitBtn.style.background = "linear-gradient(135deg, #2E7D32, #4CAF50, #2E7D32)";
        submitBtn.style.color = "#fff";

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

    function saveWishLocally(newWish) {
        const currentWishes = getWishesLocal();
        currentWishes.push(newWish);
        while (currentWishes.length > 3) {
            currentWishes.shift();
        }
        saveWishesLocal(currentWishes);
    }

    // --- 7. Admin Login & Stats Dashboard ---
    const adminTriggerBtn = document.getElementById("adminTriggerBtn");
    const adminModal = document.getElementById("adminModal");
    const adminCloseBtn = document.getElementById("adminCloseBtn");
    const adminLoginForm = document.getElementById("adminLoginForm");
    const adminId = document.getElementById("adminId");
    const adminPass = document.getElementById("adminPass");
    const loginErrorMsg = document.getElementById("loginErrorMsg");
    const adminLoginView = document.getElementById("adminLoginView");
    const adminDashboardView = document.getElementById("adminDashboardView");
    const statTotalAttending = document.getElementById("statTotalAttending");
    const statTotalWishes = document.getElementById("statTotalWishes");
    const adminGuestListBody = document.getElementById("adminGuestListBody");

    if (adminTriggerBtn && adminModal && adminCloseBtn) {
        adminTriggerBtn.addEventListener("click", () => {
            adminModal.classList.remove("hidden");
            adminLoginView.classList.remove("hidden");
            adminDashboardView.classList.add("hidden");
            adminLoginForm.reset();
            loginErrorMsg.classList.add("hidden");
        });

        adminCloseBtn.addEventListener("click", () => {
            adminModal.classList.add("hidden");
        });

        adminModal.addEventListener("click", (e) => {
            if (e.target === adminModal) {
                adminModal.classList.add("hidden");
            }
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const idVal = adminId.value.trim();
            const passVal = adminPass.value.trim();

            if (idVal === "nidha213" && passVal === "nidha@123") {
                loginErrorMsg.classList.add("hidden");
                adminLoginView.classList.add("hidden");
                adminDashboardView.classList.remove("hidden");
                await loadAdminDashboardData();
            } else {
                loginErrorMsg.classList.remove("hidden");
            }
        });
    }

    async function loadAdminDashboardData() {
        adminGuestListBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; font-style: italic; color: var(--text-muted); padding: 20px;">Loading guest details...</td>
            </tr>
        `;

        let rsvps = [];
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from('wishes')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                rsvps = data || [];
            } catch (err) {
                console.error("Failed to load wishes from Supabase for dashboard:", err);
                rsvps = getWishesLocal();
            }
        } else {
            rsvps = getWishesLocal();
        }

        renderAdminDashboard(rsvps);
    }

    function renderAdminDashboard(rsvps) {
        const totalWishes = rsvps.length;
        
        let totalAttending = 0;
        rsvps.forEach(rsvp => {
            if (rsvp.attendance === "yes") {
                const count = parseInt(rsvp.guest_count, 10) || 1;
                totalAttending += count;
            }
        });

        statTotalWishes.textContent = totalWishes;
        statTotalAttending.textContent = totalAttending;

        adminGuestListBody.innerHTML = "";
        if (rsvps.length === 0) {
            adminGuestListBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; font-style: italic; color: var(--text-muted); padding: 15px;">No RSVPs found.</td>
                </tr>
            `;
            return;
        }

        rsvps.forEach(rsvp => {
            const isAttending = rsvp.attendance === "yes";
            const statusLabel = isAttending ? "Yes" : "No";
            const statusBadgeClass = isAttending ? "status-badge yes" : "status-badge no";
            const guestCountText = isAttending ? (rsvp.guest_count || 1) : 0;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 500; color: var(--gold-dark);">${escapeHtml(rsvp.name)}</td>
                <td><span class="${statusBadgeClass}">${statusLabel}</span></td>
                <td style="font-weight: 600;">${guestCountText}</td>
                <td class="message-cell">${escapeHtml(rsvp.message)}</td>
            `;
            adminGuestListBody.appendChild(tr);
        });
    }

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
