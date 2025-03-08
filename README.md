# Bubble Burst Bonanza

A fun voice-controlled bubble popping game where players can pop bubbles using mouse clicks and control the game using voice commands.

## Features

- Voice command control: start/stop the game and change difficulty levels
- Adjustable timer: select game duration from 10 to 60 seconds
- Multiple difficulty levels: Easy, Medium, and Hard
- Dynamic environments that change as you progress
- Confetti celebration when the game ends
- Sound effects for popping bubbles and level-ups
- Grid mode: divide the game area into numbered cells and pop bubbles by saying the cell number
- Audio feedback for correct and wrong selections in grid mode

## How to Play

1. Select your game duration using buttons or say "Set timer to X seconds"
2. Say "Start the game" or click the start button to begin
3. Pop as many bubbles as you can before time runs out
4. Try to achieve higher levels for bonus environments and challenges
5. Enable grid mode to pop bubbles by saying their cell number (1-9) instead of clicking

## Voice Commands

- "Start the game" - Begins the game
- "Easy", "Medium", "Hard" - Change difficulty level
- "Stop" or "End" - Stops the current game
- "Set timer to X seconds" - Changes the game duration
- "Enable grid" or "Disable grid" - Toggles the grid mode
- Numbers "1" through "9" - Pop bubbles in the corresponding grid cell (when grid mode is enabled)

## Setup & Installation

### Running with a Local Server (Recommended)

For proper functioning of audio and speech recognition, it's recommended to run the game using a local web server:

#### Using Python (easiest method):

1. Make sure you have Python installed on your computer
2. Open a terminal/command prompt
3. Navigate to the game directory:
   ```
   cd path/to/game_with_speech_commands3
   ```
4. Start a simple HTTP server:
   - For Python 3:
     ```
     python -m http.server 8000
     ```
   - For Python 2:
     ```
     python -m SimpleHTTPServer 8000
     ```
5. Open your browser and go to:
   ```
   http://localhost:8000
   ```

#### Alternative methods:

- **Using Node.js:**
  1. Install the `http-server` package:
     ```
     npm install -g http-server
     ```
  2. Run the server:
     ```
     http-server -p 8000
     ```

- **Using Visual Studio Code:**
  1. Install the "Live Server" extension
  2. Right-click on the index.html file
  3. Select "Open with Live Server"

### Running Directly (Not Recommended)

You can also open the index.html file directly in a modern web browser, but speech recognition and audio features may not work correctly due to browser security restrictions.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Web Speech API

## Browser Support

Chrome is recommended for best speech recognition support.
