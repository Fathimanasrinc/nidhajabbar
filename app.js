document.addEventListener("DOMContentLoaded", () => {
    
    // --- DOM Elements ---
    const welcomeGate = document.getElementById("welcomeGate");
    const openInviteBtn = document.getElementById("openInviteBtn");
    const mainContent = document.getElementById("mainContent");
    const bgMusic = document.getElementById("bgMusic");
    const audioToggle = document.getElementById("audioToggle");
    const rsvpForm = document.getElementById("rsvpForm");
    const wishesBoard = document.getElementById("wishesBoard");

    // --- 1. Gate Unlock & Music Play ---
    openInviteBtn.addEventListener("click", () => {
        // Unlock main scroll
        mainContent.classList.remove("hidden-scroll");
        
        // Slide up gate screen
        welcomeGate.classList.add("slide-up");
        
        // Show floating music control
        audioToggle.classList.remove("hidden");
        
        // Play Background Music
        playAudio();

        // Initialize scroll animations
        initScrollAnimations();
        
        // Remove gate from DOM after transition completes to save resources
        setTimeout(() => {
            welcomeGate.style.display = "none";
        }, 1200);
    });

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

    // --- 3. Interactive Scratch-and-Reveal Canvas ---
    const scratchCanvas = document.getElementById("scratchCanvas");
    
    if (scratchCanvas) {
        initScratchCard(scratchCanvas);
    }

    function initScratchCard(canvas) {
        const ctx = canvas.getContext("2d");
        
        // Set canvas responsive layout size
        const width = 340;
        const height = 220;
        canvas.width = width;
        canvas.height = height;

        // Fill with a premium reflective gold gradient
        const goldGrad = ctx.createLinearGradient(0, 0, width, height);
        goldGrad.addColorStop(0, '#A68050');
        goldGrad.addColorStop(0.2, '#F3E5D0');
        goldGrad.addColorStop(0.5, '#D3B683');
        goldGrad.addColorStop(0.8, '#F3E5D0');
        goldGrad.addColorStop(1, '#A68050');
        ctx.fillStyle = goldGrad;
        ctx.fillRect(0, 0, width, height);

        // Draw double gold borders inside
        ctx.strokeStyle = "rgba(62, 12, 12, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.strokeStyle = "rgba(62, 12, 12, 0.15)";
        ctx.lineWidth = 1;
        ctx.strokeRect(14, 14, width - 28, height - 28);

        // Draw 8-point Islamic Star ornament in the background center
        drawIslamicStarOrnament(ctx, width / 2, height / 2 - 35, 8, 22, 12);

        // Draw Instruction Texts
        ctx.fillStyle = '#3E0C0C';
        ctx.font = 'bold 12px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCRATCH WITH MOUSE OR FINGER', width / 2, height / 2 + 15);
        ctx.font = 'italic 11px "Playfair Display", serif';
        ctx.fillStyle = 'rgba(62, 12, 12, 0.8)';
        ctx.fillText('To Reveal the Invitation', width / 2, height / 2 + 35);

        // Interaction States
        let isDrawing = false;
        let isRevealed = false;

        function getCoordinates(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function erase(x, y) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 22, 0, Math.PI * 2);
            ctx.fill();
        }

        function checkScratchState() {
            if (isRevealed) return;
            
            // Analyze pixels (check alpha values)
            const imgData = ctx.getImageData(0, 0, width, height);
            const pixels = imgData.data;
            let transparentCount = 0;
            
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) {
                    transparentCount++;
                }
            }
            
            const scratchPercentage = (transparentCount / (pixels.length / 4)) * 100;
            
            // If more than 40% is scratched, reveal automatically
            if (scratchPercentage > 40) {
                isRevealed = true;
                canvas.classList.add("fade-out");
                
                // Remove prompt instructions
                const scratchHint = document.getElementById("scratchHint");
                if (scratchHint) {
                    scratchHint.style.opacity = "0";
                    setTimeout(() => scratchHint.style.display = "none", 800);
                }
                
                // Reveal the slide-up button
                openInviteBtn.classList.remove("hidden-btn");
                openInviteBtn.classList.add("reveal-btn");
            }
        }

        // Draw helper ornament
        function drawIslamicStarOrnament(c, cx, cy, spikes, outerRadius, innerRadius) {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            let step = Math.PI / spikes;

            c.beginPath();
            c.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                c.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                c.lineTo(x, y);
                rot += step;
            }
            c.lineTo(cx, cy - outerRadius);
            c.closePath();
            c.strokeStyle = 'rgba(62, 12, 12, 0.2)';
            c.lineWidth = 1.5;
            c.stroke();
            
            // Draw tiny inner ring
            c.beginPath();
            c.arc(cx, cy, 6, 0, Math.PI * 2);
            c.stroke();
        }

        // --- Touch/Mouse Event Listeners ---
        function startScratch(e) {
            isDrawing = true;
            const pos = getCoordinates(e);
            erase(pos.x, pos.y);
        }

        function moveScratch(e) {
            if (!isDrawing) return;
            e.preventDefault(); // Prevents touch drag behavior (scrolling)
            const pos = getCoordinates(e);
            erase(pos.x, pos.y);
        }

        function endScratch() {
            isDrawing = false;
            checkScratchState();
        }

        // Desktop Events
        canvas.addEventListener("mousedown", startScratch);
        canvas.addEventListener("mousemove", moveScratch);
        window.addEventListener("mouseup", endScratch);

        // Mobile Events
        canvas.addEventListener("touchstart", startScratch);
        canvas.addEventListener("touchmove", moveScratch);
        canvas.addEventListener("touchend", endScratch);
    }

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

    function getWishes() {
        const stored = localStorage.getItem("wedding_wishes");
        if (stored) {
            return JSON.parse(stored);
        } else {
            localStorage.setItem("wedding_wishes", JSON.stringify(initialWishes));
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
        localStorage.setItem("wedding_wishes", JSON.stringify(currentWishes));

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
});
