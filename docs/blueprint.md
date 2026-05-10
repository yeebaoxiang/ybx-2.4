# **App Name**: EchoVision AI

## Core Features:

- Real-time Object Detection: Client-side object detection (e.g., using TensorFlow.js or ONNX.js with models similar to YOLOv8 Nano) performed on the live stream from the user's webcam, serving as an AI tool to identify objects and decide when to vocalize information.
- Multilingual Text-to-Speech Feedback: Utilize the Web Speech API (SpeechSynthesis) to provide audio descriptions of detected objects (when confidence > 60%), supporting English, Malay, and Mandarin as requested, replicating the functionality of flutter_tts.
- Accessible Web Interface: Develop a "Blind-First" web user interface featuring a full-screen live webcam view, large, high-contrast, touch-friendly interactive elements, and custom JavaScript to handle basic gesture recognition (e.g., double-tap to change language).
- Browser Permissions Management: Implement client-side logic to request and manage browser permissions for webcam access (for video input) and microphone (for potential future voice commands), crucial for the application's operation.
- External Video Source Integration: For the MVP, the application will leverage the client's standard webcam for real-time video processing. For future iterations addressing the GoPro requirement, a Next.js API route could be designed to accept and relay video streams from a custom intermediary server (acting as a bridge to the Open GoPro API) to the web client.

## Style Guidelines:

- The color scheme will be dark, enhancing readability and reducing eye strain for visually impaired users. The primary interactive color will be a bright, clear cyan (#8CD6EC) to stand out against the deep dark blue-green background (#212C2F). An accent color of teal (#33CCAD) will be used for subtle highlights and calls to action, providing high contrast and functionality.
- All text will use 'Inter', a grotesque sans-serif font known for its clarity, neutrality, and excellent readability across various sizes, making it suitable for a "Blind-First" UI. It is versatile for both headlines and short descriptions.
- Icons will be clear, simplistic, and high-contrast, utilizing bold outlines or filled shapes to ensure they are easily discernible. Accessible SVG icons will be employed to maintain crispness at different scales and support screen readers.
- The layout will emphasize a full-screen, unobstructed view of the camera feed. Interactive elements will be generously spaced, large, and located predictably, with logical grouping to support an intuitive, gesture-based user experience.
- Animations will be subtle, minimal, and purposeful, such as a gentle fade for state changes or a quick pulse on detected objects. This approach avoids distractions while providing necessary feedback without disorienting users.