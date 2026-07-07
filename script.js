// State variables
let startTime = 0;
let elapsedTime = 0;
let running = false;
let animationFrameId = null;
let lapRecords = [];
let audioCtx = null;
let isMuted = false;

// DOM Elements
const hrsDigit = document.getElementById('hours');
const minsDigit = document.getElementById('minutes');
const secsDigit = document.getElementById('seconds');
const msDigit = document.getElementById('milliseconds');
const stateLabel = document.getElementById('timer-state-label');
const progressRingBar = document.getElementById('progress-ring-bar');
const currentLapIndicator = document.getElementById('current-lap-time');

const btnPrimary = document.getElementById('btn-primary');
const btnPrimaryText = document.getElementById('btn-primary-text');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const btnReset = document.getElementById('btn-reset');
const btnLap = document.getElementById('btn-lap');
const lapsDashboard = document.getElementById('laps-dashboard');
const lapsList = document.getElementById('laps');

const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const audioToggle = document.getElementById('audio-toggle');
const soundOnIcon = document.getElementById('sound-on-icon');
const soundOffIcon = document.getElementById('sound-off-icon');
const exportBtn = document.getElementById('btn-export');

// Initialize preferences on load
document.addEventListener('DOMContentLoaded', () => {
    // Load theme
    const savedTheme = localStorage.getItem('stopwatch-theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
    
    // Load muted state
    const savedMuted = localStorage.getItem('stopwatch-muted');
    if (savedMuted === 'true') {
        isMuted = true;
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
    }
    
    updateDisplay();
    updateButtonsUI();
});

// Synthesized Web Audio API Sound Generator
function playSound(type) {
    if (isMuted) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        
        if (type === 'start') {
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'pause') {
            osc.frequency.setValueAtTime(550, now);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'lap') {
            osc.frequency.setValueAtTime(1000, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
        } else if (type === 'reset') {
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'toggle') {
            osc.frequency.setValueAtTime(450, now);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        }
    } catch (e) {
        console.warn("Audio context not supported or failed to initialize", e);
    }
}

// Utility: Format Milliseconds to Object
function formatTime(timeMs) {
    const hours = Math.floor(timeMs / 3600000);
    const minutes = Math.floor((timeMs % 3600000) / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor(timeMs % 1000);

    return {
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        milliseconds: String(ms).padStart(3, "0"),
        formatted: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(ms).padStart(3, "0")}`
    };
}

// Render loop tick
function tick() {
    if (!running) return;
    elapsedTime = performance.now() - startTime;
    updateDisplay();
    animationFrameId = requestAnimationFrame(tick);
}

// Update UI Digits and Radial Ring
function updateDisplay() {
    const formatted = formatTime(elapsedTime);
    hrsDigit.textContent = formatted.hours;
    minsDigit.textContent = formatted.minutes;
    secsDigit.textContent = formatted.seconds;
    msDigit.textContent = formatted.milliseconds;
    
    // Progress Ring bar mapping (sweeps 0 to 60 seconds)
    const progress = (elapsedTime % 60000) / 60000;
    const offset = 553 - (progress * 553);
    progressRingBar.style.strokeDashoffset = offset;
    
    // Update live current lap split display
    const lastCumulative = lapRecords.length > 0 ? lapRecords[lapRecords.length - 1].cumulativeTime : 0;
    const currentLapTime = elapsedTime - lastCumulative;
    const formattedLap = formatTime(currentLapTime);
    currentLapIndicator.textContent = `Lap ${lapRecords.length + 1}: ${formattedLap.minutes}:${formattedLap.seconds}.${formattedLap.milliseconds}`;
}

// Update Button Attributes and Text
function updateButtonsUI() {
    if (running) {
        stateLabel.textContent = 'RUNNING';
        stateLabel.classList.add('running');
        
        btnPrimary.classList.add('running-btn');
        btnPrimaryText.textContent = 'Pause';
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        
        // Reset disabled, Lap enabled
        btnReset.classList.add('disabled');
        btnReset.setAttribute('disabled', 'true');
        btnLap.classList.remove('disabled');
        btnLap.removeAttribute('disabled');
    } else {
        stateLabel.classList.remove('running');
        btnPrimary.classList.remove('running-btn');
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        
        if (elapsedTime === 0) {
            stateLabel.textContent = 'READY';
            btnPrimaryText.textContent = 'Start';
            
            // Both disabled
            btnReset.classList.add('disabled');
            btnReset.setAttribute('disabled', 'true');
            btnLap.classList.add('disabled');
            btnLap.setAttribute('disabled', 'true');
        } else {
            stateLabel.textContent = 'PAUSED';
            btnPrimaryText.textContent = 'Resume';
            
            // Reset enabled, Lap disabled
            btnReset.classList.remove('disabled');
            btnReset.removeAttribute('disabled');
            btnLap.classList.add('disabled');
            btnLap.setAttribute('disabled', 'true');
        }
    }
}

// Trigger Primary (Start/Pause) Action
function handlePrimaryAction() {
    if (!running) {
        // Start or Resume
        playSound('start');
        running = true;
        startTime = performance.now() - elapsedTime;
        animationFrameId = requestAnimationFrame(tick);
    } else {
        // Pause
        playSound('pause');
        running = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    }
    updateButtonsUI();
}

// Trigger Lap Action
function handleLapAction() {
    if (!running) return;
    playSound('lap');
    
    const lastCumulative = lapRecords.length > 0 ? lapRecords[lapRecords.length - 1].cumulativeTime : 0;
    const lapTime = elapsedTime - lastCumulative;
    
    const newLap = {
        id: Date.now() + '-' + Math.floor(Math.random() * 1000),
        number: lapRecords.length + 1,
        lapTime: lapTime,
        cumulativeTime: elapsedTime
    };
    
    lapRecords.push(newLap);
    renderLaps();
}

// Trigger Reset Action
function handleResetAction() {
    if (running) return; // Can only reset when paused
    playSound('reset');
    
    running = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    elapsedTime = 0;
    lapRecords = [];
    
    updateDisplay();
    updateButtonsUI();
    renderLaps();
}

// Delete Specific Lap Row
function deleteLap(id) {
    playSound('reset');
    const index = lapRecords.findIndex(l => l.id === id);
    if (index !== -1) {
        lapRecords.splice(index, 1);
        
        // Recalculate lap numbers to keep them sequential
        lapRecords.forEach((lap, i) => {
            lap.number = i + 1;
        });
        
        // Recalculate individual lap times based on the remaining cumulative timeline
        lapRecords.forEach((lap, i) => {
            const prevCum = i > 0 ? lapRecords[i - 1].cumulativeTime : 0;
            lap.lapTime = lap.cumulativeTime - prevCum;
        });
        
        renderLaps();
    }
}

// Recalculate Statistics
function updateStatistics() {
    if (lapRecords.length === 0) {
        document.getElementById('stat-total-laps').textContent = '0';
        document.getElementById('stat-best-lap').textContent = '--:--.--';
        document.getElementById('stat-worst-lap').textContent = '--:--.--';
        document.getElementById('stat-avg-lap').textContent = '--:--.--';
        return;
    }
    
    const totalLaps = lapRecords.length;
    document.getElementById('stat-total-laps').textContent = totalLaps;
    
    let minTime = Infinity;
    let maxTime = -Infinity;
    let sumTime = 0;
    
    lapRecords.forEach(lap => {
        if (lap.lapTime < minTime) minTime = lap.lapTime;
        if (lap.lapTime > maxTime) maxTime = lap.lapTime;
        sumTime += lap.lapTime;
    });
    
    const avgTime = sumTime / totalLaps;
    
    const minFormatted = formatTime(minTime);
    const maxFormatted = formatTime(maxTime);
    const avgFormatted = formatTime(avgTime);
    
    document.getElementById('stat-best-lap').textContent = `${minFormatted.minutes}:${minFormatted.seconds}.${minFormatted.milliseconds}`;
    document.getElementById('stat-worst-lap').textContent = `${maxFormatted.minutes}:${maxFormatted.seconds}.${maxFormatted.milliseconds}`;
    document.getElementById('stat-avg-lap').textContent = `${avgFormatted.minutes}:${avgFormatted.seconds}.${avgFormatted.milliseconds}`;
}

// Render Laps List and Update Dashboard
function renderLaps() {
    lapsList.innerHTML = '';
    
    if (lapRecords.length === 0) {
        lapsDashboard.classList.add('hidden');
        return;
    }
    
    lapsDashboard.classList.remove('hidden');
    
    // Find min and max times to highlight fastest and slowest
    let minTime = Infinity;
    let maxTime = -Infinity;
    
    if (lapRecords.length >= 2) {
        lapRecords.forEach(lap => {
            if (lap.lapTime < minTime) minTime = lap.lapTime;
            if (lap.lapTime > maxTime) maxTime = lap.lapTime;
        });
    }
    
    // Render laps in reverse order (newest at the top)
    const reversedLaps = [...lapRecords].reverse();
    
    reversedLaps.forEach(lap => {
        const li = document.createElement('li');
        
        const isBest = lapRecords.length >= 2 && lap.lapTime === minTime;
        const isWorst = lapRecords.length >= 2 && lap.lapTime === maxTime;
        
        if (isBest) li.classList.add('lap-best');
        if (isWorst) li.classList.add('lap-worst');
        
        const lapFormatted = formatTime(lap.lapTime);
        const cumFormatted = formatTime(lap.cumulativeTime);
        
        // Calculate difference with previous lap if available
        let deltaHtml = '';
        const prevLap = lapRecords.find(l => l.number === lap.number - 1);
        if (prevLap) {
            const diff = lap.lapTime - prevLap.lapTime;
            const diffSign = diff >= 0 ? '+' : '-';
            const diffAbs = Math.abs(diff);
            const diffFormatted = formatTime(diffAbs);
            const displayDiff = `${diffSign}${diffFormatted.minutes}:${diffFormatted.seconds}.${diffFormatted.milliseconds}`;
            const diffClass = diff >= 0 ? 'lap-slower' : 'lap-faster';
            deltaHtml = `<span class="lap-delta ${diffClass}">${displayDiff}</span>`;
        }
        
        li.innerHTML = `
            <div class="lap-left-group">
                <span class="lap-number">Lap ${String(lap.number).padStart(2, '0')}</span>
                ${isBest ? '<span class="lap-badge">Best</span>' : ''}
                ${isWorst ? '<span class="lap-badge">Worst</span>' : ''}
            </div>
            <div class="lap-times">
                ${deltaHtml}
                <span class="lap-split-time">${lapFormatted.minutes}:${lapFormatted.seconds}.${lapFormatted.milliseconds}</span>
                <span class="lap-cum-time" style="font-size:0.75rem; color:var(--text-muted); margin-left:4px;" title="Total time at this lap">${cumFormatted.minutes}:${cumFormatted.seconds}.${cumFormatted.milliseconds}</span>
                <button class="lap-delete-btn" data-id="${lap.id}" title="Delete this split">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        `;
        
        lapsList.appendChild(li);
    });
    
    // Attach deletion handlers
    const deleteButtons = lapsList.querySelectorAll('.lap-delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            deleteLap(id);
        });
    });
    
    updateStatistics();
}

// Event Listeners for Controls
btnPrimary.addEventListener('click', handlePrimaryAction);
btnLap.addEventListener('click', handleLapAction);
btnReset.addEventListener('click', handleResetAction);

// Theme toggle
themeToggle.addEventListener('click', () => {
    playSound('toggle');
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        localStorage.setItem('stopwatch-theme', 'light');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        localStorage.setItem('stopwatch-theme', 'dark');
    }
});

// Audio toggle
audioToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    localStorage.setItem('stopwatch-muted', isMuted);
    
    if (isMuted) {
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
    } else {
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
        playSound('toggle');
    }
});

// Export lap split logs to CSV
exportBtn.addEventListener('click', () => {
    playSound('toggle');
    if (lapRecords.length === 0) return;
    
    let csvContent = "Lap Number,Lap Time (ms),Lap Time (Formatted),Cumulative Time (ms),Cumulative Time (Formatted)\n";
    lapRecords.forEach(lap => {
        const lapFormatted = formatTime(lap.lapTime).formatted;
        const cumFormatted = formatTime(lap.cumulativeTime).formatted;
        csvContent += `${lap.number},${lap.lapTime},${lapFormatted},${lap.cumulativeTime},${cumFormatted}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `quantum_stopwatch_laps_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Keyboard Shortcuts Listener
document.addEventListener('keydown', (e) => {
    // Ignore shortcut triggers if focusing input elements (not applicable here, but safe practice)
    if (e.target !== document.body && e.target.tagName !== 'HTML') {
        return;
    }
    
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handlePrimaryAction();
    } else if (e.key.toLowerCase() === 'l') {
        handleLapAction();
    } else if (e.key.toLowerCase() === 'r') {
        handleResetAction();
    }
});
