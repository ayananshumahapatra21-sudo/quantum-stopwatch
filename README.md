# ⏱️ Quantum Stopwatch

A state-of-the-art, visually stunning, and highly precise Stopwatch Web Application built with vanilla web technologies. It features frosted glass aesthetics (glassmorphism), ambient backlights, a dynamic radial progress sweep, real-time lap statistics, sound synthesizer clicks, and keyboard shortcuts.

![Stopwatch Preview Mockup](https://raw.githubusercontent.com/username/repository/main/preview-placeholder.png) *(Replace with actual screenshot once uploaded)*

---

## ✨ Features

- **Precision Timeline Engine**: Runs on a `requestAnimationFrame` loop combined with `performance.now()`, ensuring lag-free millisecond ticks in sync with your screen refresh rate.
- **Dynamic Radial Progress Ring**: An SVG-drawn outer ring that sweeps clockwise, visually tracking the progress of each minute.
- **Smart Context-Aware Controls**: Buttons adapt dynamically to the timer state:
  - **Idle**: Start is enabled; Reset & Lap are disabled.
  - **Running**: Pause & Lap are enabled; Reset is disabled.
  - **Paused**: Resume & Reset are enabled; Lap is disabled.
- **Lap Splits Dashboard**:
  - **Splits Log**: Captures lap number, individual split duration, and cumulative time.
  - **Delta Variance Tracking**: Calculates and shows the difference in time compared to the previous split—color-coded in green (faster) and red (slower).
  - **Real-Time Statistics**: Tracks Total Laps, Best (Fastest) Lap, Slowest Lap, and Average Lap.
  - **Best/Worst Highlights**: Dynamically flags and highlights the best and worst splits in the log list.
  - **Single Split Deletion**: Delete individual lap records; the remaining log timeline and stats automatically adjust.
- **Synthesized Audio Feedback**: Utilizes the native **Web Audio API** to generate organic click feedback for user actions. Includes a mute toggle.
- **Persistent Light/Dark Mode**: Transition-mapped design with theme preferences saved locally in the browser's `localStorage`.
- **CSV Data Exporting**: Download your recorded lap splits as a formatted `.csv` file.

---

## 🎹 Keyboard Shortcuts

Focus the page and use these quick keys to control the stopwatch:
- <kbd>Space</kbd> - Start / Pause / Resume
- <kbd>L</kbd> - Record Lap Split
- <kbd>R</kbd> - Reset Stopwatch (when paused)

---

## 📁 File Structure

```
stopwatch/
│── index.html    # Layout containing inline SVGs and structural nodes
│── style.css     # Frosted glass designs, gradients, and custom animations
│── script.js     # Sound synthesizer, precision ticker loop, and state handlers
└── README.md     # Project documentation
```

---

## 🚀 How to Run Locally

Since this is a client-side only static application, it does not require any compilers, bundlers, or servers. You can run it directly:

1. **Double Click**: Open the `index.html` file in any modern web browser.
2. **Local Server (Optional)**: If you have Python installed, you can spin up a local server inside the folder:
   ```bash
   python -m http.server 8080
   ```
   Then open `http://localhost:8080` in your web browser.

---

## 🛠️ Built With

- **HTML5** & **CSS3** (Vanilla Custom Properties & Keyframes)
- **JavaScript** (ES6+, requestAnimationFrame API)
- **Google Fonts** (Outfit, JetBrains Mono)
- **Web Audio API** (Oscillator & Gain Synthesis)
