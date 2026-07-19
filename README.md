# Calm Web Journey 

A relaxing, endless driving experience built entirely with [Three.js](https://threejs.org/). Take a peaceful trip down a procedurally generated infinite road, surrounded by beautiful low-poly scenery.

## Features 

*   **Endless Procedural World**: Drive forward infinitely as the world (road, trees, mountains, clouds) generates and loops seamlessly around you like a treadmill.
*   **Dynamic Day/Night Cycle**: A complete cycle featuring a glowing sun, a moon, and a starry night sky. 
*   **Dynamic Weather System**: Experience changing atmospheric conditions, including clear skies, heavy fog, and rainstorms.
*   **Responsive Lighting & Headlights**: The environment's lighting adapts perfectly to the time of day and weather. Your van's headlights automatically turn on during night-time or heavy fog!
*   **Relaxing Van Model**: A custom, low-poly stylized van built entirely out of Three.js primitives.
*   **Highly Optimized**: Features InstancedMeshes, static matrix caching, and optimized polygon counts to ensure a silky-smooth framerate.

## How to Play 

Use your keyboard to drive the van:
*   **W / Up Arrow**: Accelerate
*   **S / Down Arrow**: Brake / Reverse
*   **A / Left Arrow**: Steer Left
*   **D / Right Arrow**: Steer Right

*Note: The steering is designed to keep you on the endless road. You cannot turn around completely!*

## Technologies Used 

*   HTML5
*   JavaScript
*   Three.js (WebGL)

## Setup & Running Locally 

Since this is a client-side Three.js application, you can simply run it by serving the directory with any local web server.

1. Clone the repository.
2. Start a local server. If you have Node.js installed, you can run:
   ```bash
   npx serve .
   ```
   Or with Python:
   ```bash
   python -m http.server
   ```
3. Open the provided `localhost` link in your web browser.
