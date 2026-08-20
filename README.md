# Motion Coach AI

MOTIONMATE — AI MOVEMENT COACH

Create a polished, clickable prototype called MOTIONMATE — “Move better. Train smarter.” Integrate the provided Gym Pose Coach functionality: real-time pose tracking, joint-angle/biomechanical analysis, exercise recognition, repetition counting, form scoring, exercise-specific feedback and voice coaching.

CORE REQUIREMENT — REAL CAMERA + OFFLINE

The exercise screen MUST request and use the user's actual webcam/mobile camera, not a simulated video. Show the live camera feed in real time with pose landmarks/skeleton overlaid and update rep count, angles and form feedback continuously.

Support two modes:
LIVE MODE: real-time camera → local pose detection → instant feedback.
OFFLINE MODE: user can record/save exercise video without internet, then run analysis locally when possible and view results later. Clearly show “Offline Mode” and recording status. Design the system so core pose processing can run on-device without sending video to a server.

If camera permission is denied, show a clear permission message and fallback to uploading/recording a video.

DESIGN

Human-designed sports-tech UI: light/off-white background, dark charcoal text, one accent color, subtle borders/shadows, medium-radius cards, Inter/Manrope/DM Sans. Avoid neon, excessive gradients, glassmorphism, holograms and robotic AI visuals.

ATHLETE FLOW

Login → Dashboard → Exercise → Live Camera → Feedback → Show Me How → Summary → Progress.

Dashboard: “Good afternoon, Rahul”, score, weekly improvement, sessions and Movement Fingerprint (Balance, Stability, Flexibility, Coordination, Control).

Exercise selection: Squat, Push-up, Bicep Curl, Overhead Press, Deadlift, Lunge, Plank.

Camera screen:
LIVE/ OFFLINE indicator, actual camera preview, pose skeleton, rep counter, form score, posture, balance, alignment, depth and cadence. Add Voice Coach ON/OFF.

SIGNATURE FEATURES

Show Me How: compare “Your Movement” vs “Target Movement” with visual correction overlay.

Voice Coach: natural live cues such as “Good form!” or “Keep your back straight.”

Fatigue Insight: detect declining movement consistency across reps.

School Mode: one camera → multiple athletes → coach insights.

COACH

Dashboard with athletes, scores, improvement and alerts. Athlete profile shows strengths, weaknesses, progress and training insights.

Use realistic sample data, but make the camera and exercise-analysis architecture real, not a fake animated dashboard. Prioritize a convincing working demo over many screens.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/362f49eb-4e95-43aa-adbc-52a4069dd94f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
