// Game variables
let gameRunning = false;
let gameArea = null;
let difficultyLevel = "medium";
let bubbleInterval = null;
let recognition = null;
let score = 0;
let currentLevel = 1;
let bubbleCount = 0;
let maxBubbles = 15;
let sequenceMode = false;
let sequenceBubbles = [];
let currentEnvironment = "sky"; // Default environment
let popSound, levelUpSound, winSound;
let gameTimer = null;
let gameTimeLimit = 30000; // Default: 30 seconds in milliseconds
let timerDisplay = null;
let timerInterval = null;
let secondsRemaining = 30; // Default to 30 seconds

// Speed settings for different difficulty levels
const difficulties = {
    "easy": {
        maxBubbles: 10,
        spawnInterval: 2000,
        speedMultiplier: 0.7
    },
    "medium": {
        maxBubbles: 15,
        spawnInterval: 1500,
        speedMultiplier: 1
    },
    "hard": {
        maxBubbles: 20,
        spawnInterval: 1000,
        speedMultiplier: 1.5
    }
};

// Environments configuration
const environments = ["sky", "underwater", "space", "forest"];

// Initialize the game when the page loads
window.addEventListener('load', initGame);

function initGame() {
    // Get DOM elements
    gameArea = document.getElementById('game-area');
    timerDisplay = document.getElementById('timer-display');
    
    // Initialize speech recognition
    setupSpeechRecognition();
    
    // Initialize audio
    setupAudio();
    
    // Display instructions to the user
    updateStatus("Say 'Start the game' to begin");
    
    // Add click event listener to the game area for bubble popping
    gameArea.addEventListener('click', function(e) {
        // Ignore clicks on the game area itself, only process bubbles
        if (e.target !== gameArea && e.target !== timerDisplay && 
            !e.target.classList.contains('timer-label') && 
            !e.target.classList.contains('in-game-timer') && 
            gameRunning) {
            popBubble(e.target);
        }
    });
    
    // Setup timer selection buttons
    setupTimerButtons();
}

function setupAudio() {
    // Create audio elements
    popSound = new Audio('sounds/bubblepopping.mp3');
    levelUpSound = new Audio('sounds/dersuperanton__level-up-voice.mp3');
    winSound = new Audio('sounds/cheer.mp3');
    
    // Preload sounds
    popSound.load();
    levelUpSound.load();
    winSound.load();
}

function setupSpeechRecognition() {
    // Check if the browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        updateStatus("Speech recognition is not supported in your browser. Please use Chrome.");
        return;
    }
    
    // Create speech recognition object
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    // Configure speech recognition
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    // Handle recognition results
    recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log("Recognized: ", transcript);
        
        // Process voice commands
        if (transcript.includes("start the game") || transcript.includes("start game")) {
            startGame();
        } else if (transcript.includes("easy")) {
            setDifficulty("easy");
        } else if (transcript.includes("medium")) {
            setDifficulty("medium");
        } else if (transcript.includes("hard")) {
            setDifficulty("hard");
        } else if (transcript.includes("stop") || transcript.includes("end") || transcript.includes("quit")) {
            stopGame();
        }
        
        // Timer setting voice commands
        // Check for "set timer to X seconds" pattern
        const timerMatch = transcript.match(/set timer to (\d+) seconds/i);
        if (timerMatch && timerMatch[1]) {
            const seconds = parseInt(timerMatch[1]);
            if (!isNaN(seconds) && seconds > 0 && seconds <= 120) {
                setGameTimer(seconds);
                
                // Also update the active button state if it matches a predefined value
                const timerButtons = document.querySelectorAll('.timer-btn');
                timerButtons.forEach(btn => {
                    if (parseInt(btn.getAttribute('data-time')) === seconds) {
                        timerButtons.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                });
                
                updateStatus(`Timer set to ${seconds} seconds`);
            }
        }
    };
    
    // Handle errors
    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
        updateStatus("Speech recognition error: " + event.error);
    };
    
    // Auto-restart recognition if it ends
    recognition.onend = function() {
        console.log("Recognition ended, restarting...");
        recognition.start();
    };
    
    // Start recognition
    try {
        recognition.start();
        console.log("Speech recognition started");
    } catch (e) {
        console.error("Error starting speech recognition:", e);
    }
}

function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    score = 0;
    currentLevel = 1;
    updateScore();
    updateLevel();
    updateStatus("Pop as many bubbles as you can!");
    changeEnvironment("sky");
    
    // Reset and start the timer with the selected duration
    updateTimerDisplay();
    
    // Start the countdown timer - use 1000ms (1 second) interval for accurate timing
    timerInterval = setInterval(function() {
        secondsRemaining--;
        updateTimerDisplay();
        
        if (secondsRemaining <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
    
    // Start creating bubbles
    createBubble();
    bubbleInterval = setInterval(createBubble, difficulties[difficultyLevel].spawnInterval);
    
    // Set game timer to end after selected duration
    gameTimer = setTimeout(() => {
        endGame(true);
    }, gameTimeLimit);
}

function stopGame() {
    if (!gameRunning) return;
    
    gameRunning = false;
    updateStatus("Game stopped. Say 'Start the game' to begin again.");
    
    clearInterval(bubbleInterval);
    
    // Clear the game timer if it exists
    if (gameTimer) {
        clearTimeout(gameTimer);
        gameTimer = null;
    }
    
    // Clear the timer display interval
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Reset timer display to the selected value (not hardcoded)
    updateTimerDisplay();
    
    // Remove all bubbles
    const bubbles = document.querySelectorAll('.bubble');
    bubbles.forEach(bubble => {
        bubble.remove();
    });
}

function endGame(timeUp = false) {
    if (!gameRunning) return;
    
    gameRunning = false;
    clearInterval(bubbleInterval);
    
    // Clear the game timer if it exists
    if (gameTimer) {
        clearTimeout(gameTimer);
        gameTimer = null;
    }
    
    // Clear the timer display interval
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Show end game message
    updateStatus(timeUp ? "Time's up! Final score: " + score : "Game ended! Final score: " + score);
    
    // Play winning sound
    winSound.play();
    
    // Create confetti effect
    createConfetti();
    
    // Remove all bubbles
    const bubbles = document.querySelectorAll('.bubble');
    bubbles.forEach(bubble => {
        bubble.remove();
    });
}

function setDifficulty(level) {
    if (!["easy", "medium", "hard"].includes(level)) return;
    
    difficultyLevel = level;
    document.getElementById('difficulty').textContent = `Current difficulty: ${level.charAt(0).toUpperCase() + level.slice(1)}`;
    
    // Update the bubble interval if the game is running
    if (gameRunning) {
        clearInterval(bubbleInterval);
        bubbleInterval = setInterval(createBubble, difficulties[difficultyLevel].spawnInterval);
    }
}

function createBubble() {
    if (!gameRunning) return;
    
    const bubbleCount = document.querySelectorAll('.bubble').length;
    
    // Don't create more bubbles than the maximum allowed
    if (bubbleCount >= difficulties[difficultyLevel].maxBubbles) return;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // Random size between 30px and 80px
    const size = Math.floor(Math.random() * 50) + 30;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    // Random position within game area
    const maxX = gameArea.clientWidth - size;
    const maxY = gameArea.clientHeight - size;
    const posX = Math.floor(Math.random() * maxX);
    const posY = Math.floor(Math.random() * maxY);
    bubble.style.left = `${posX}px`;
    bubble.style.top = `${posY}px`;
    
    // Random color
    const hue = Math.floor(Math.random() * 360);
    bubble.style.backgroundColor = `hsla(${hue}, 100%, 70%, 0.7)`;
    
    // Random float animation duration based on difficulty
    const duration = (Math.random() * 5 + 3) / difficulties[difficultyLevel].speedMultiplier;
    bubble.style.animation = `float ${duration}s infinite ease-in-out`;
    
    // Add data attribute for points (smaller bubbles are worth more)
    const points = Math.floor(100 / size * 10);
    bubble.dataset.points = points;
    
    // Sequence bubbles logic (for levels 3 and above)
    if (currentLevel >= 3 && Math.random() < 0.2 && sequenceBubbles.length < 3) {
        bubble.classList.add('sequence-bubble');
        bubble.dataset.sequenceNumber = sequenceBubbles.length + 1;
        bubble.textContent = sequenceBubbles.length + 1;
        bubble.style.display = 'flex';
        bubble.style.justifyContent = 'center';
        bubble.style.alignItems = 'center';
        bubble.style.fontSize = `${size / 2}px`;
        bubble.style.fontWeight = 'bold';
        sequenceBubbles.push(bubble);
    }
    
    // Auto-remove bubble after some time
    setTimeout(() => {
        if (bubble.parentNode === gameArea) {
            bubble.remove();
            
            // If it was a sequence bubble, remove it from the array
            if (bubble.classList.contains('sequence-bubble')) {
                const index = sequenceBubbles.indexOf(bubble);
                if (index > -1) {
                    sequenceBubbles.splice(index, 1);
                }
            }
        }
    }, duration * 1500);
    
    // Add to game area
    gameArea.appendChild(bubble);
}

function popBubble(bubble) {
    if (!bubble || !bubble.classList.contains('bubble')) return;
    
    // Play pop sound immediately on click
    playPopSound();
    
    // Handle sequence bubbles
    if (bubble.classList.contains('sequence-bubble')) {
        const sequenceNumber = parseInt(bubble.dataset.sequenceNumber);
        
        // Check if this is the next bubble in the sequence
        if (sequenceNumber === 1) {
            // Start the sequence mode
            sequenceMode = true;
            
            // Remove this bubble
            bubble.classList.add('popping');
            
            // Update score
            updateScore(parseInt(bubble.dataset.points) * 2);
            
            // Remove from sequence array
            sequenceBubbles.shift();
            
            // Update the remaining sequence numbers
            sequenceBubbles.forEach((b, i) => {
                b.dataset.sequenceNumber = i + 1;
                b.textContent = i + 1;
            });
            
            setTimeout(() => bubble.remove(), 300);
        }
        return;
    }
    
    // Handle normal bubbles
    bubble.classList.add('popping');
    
    // Add points based on bubble size (smaller = more points)
    updateScore(parseInt(bubble.dataset.points));
    
    // Remove bubble after animation completes
    setTimeout(() => bubble.remove(), 300);
    
    // Check if level should be increased
    if (score >= currentLevel * 500) {
        increaseLevel();
    }
}

function playPopSound() {
    // Clone the sound to allow multiple plays
    const sound = popSound.cloneNode();
    sound.play();
}

function updateScore(points = 0) {
    score += points;
    document.getElementById('score').textContent = `Score: ${score}`;
}

function updateLevel() {
    document.getElementById('level').textContent = `Level: ${currentLevel}`;
}

function increaseLevel() {
    currentLevel++;
    updateLevel();
    
    // Play level up sound
    levelUpSound.play();
    
    // Show level up message
    const oldStatus = document.getElementById('status').textContent;
    updateStatus(`Level ${currentLevel}! Keep going!`);
    setTimeout(() => updateStatus(oldStatus), 2000);
    
    // Change environment every 2 levels
    if (currentLevel % 2 === 0) {
        const envIndex = Math.floor(currentLevel / 2) % environments.length;
        changeEnvironment(environments[envIndex]);
    }
    
    // Increase difficulty
    if (currentLevel % 3 === 0) {
        // Make bubbles move faster and appear more frequently
        clearInterval(bubbleInterval);
        const newInterval = difficulties[difficultyLevel].spawnInterval * 0.9;
        bubbleInterval = setInterval(createBubble, newInterval);
    }
}

function changeEnvironment(env) {
    // Remove all environment classes
    gameArea.classList.remove('sky', 'underwater', 'space', 'forest');
    
    // Add the new environment class
    if (env !== "sky") { // Sky is the default
        gameArea.classList.add(env);
    }
    
    currentEnvironment = env;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function createConfetti() {
    const confettiCount = 200;
    const container = document.body;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = getRandomColor();
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function getRandomColor() {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function updateTimerDisplay() {
    if (timerDisplay) {
        timerDisplay.textContent = secondsRemaining;
        
        // Add visual emphasis when time is running low
        if (secondsRemaining <= 3) {
            timerDisplay.classList.add('time-critical');
        } else {
            timerDisplay.classList.remove('time-critical');
        }
    }
}

function setupTimerButtons() {
    const timerButtons = document.querySelectorAll('.timer-btn');
    
    // Add click event listeners to each timer button
    timerButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            timerButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get timer value from data attribute
            const seconds = parseInt(this.getAttribute('data-time'));
            
            // Update game timer settings
            setGameTimer(seconds);
        });
    });
    
    // Initialize with default value (30 seconds)
    setGameTimer(30);
}

function setGameTimer(seconds) {
    // Update timer variables
    secondsRemaining = seconds;
    gameTimeLimit = seconds * 1000; // Convert to milliseconds
    
    // Update the timer display
    if (timerDisplay) {
        timerDisplay.textContent = secondsRemaining;
    }
    
    console.log(`Timer set to ${seconds} seconds`);
}
