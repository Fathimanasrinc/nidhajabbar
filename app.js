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
