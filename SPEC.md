# IrisComm - Ultra-Advanced Hackathon-Winning Specification

## 1. Concept & Vision

**IrisComm** is a revolutionary AI-powered assistive communication platform that transforms eye movements into fluent speech and text. Built for people with motor disabilities (ALS, stroke, spinal cord injuries, cerebral palsy, TBI, MS), it provides a complete communication ecosystem with neural network visualization, real-time emotion detection, and generative AI predictions.

**Core Philosophy:** Transform the clinical feel of assistive technology into an engaging, futuristic experience through immersive 3D environments and gamified interactions.

---

## 2. Design Language

### Aesthetic Direction

**"Cosmic Neural Interface"** - A deep space aesthetic combined with neural network visualizations. Think cyberpunk meets medical precision.

### Color Palette

```css
--bg-primary: #05070a /* Deep space black */ --bg-secondary: #0a0e17
  /* Midnight blue */ --accent-primary: #4f46e5 /* Indigo */
  --accent-secondary: #06b6d4 /* Cyan */ --accent-tertiary: #8b5cf6 /* Purple */
  --accent-warm: #ec4899 /* Pink */ --accent-glow: #3b82f6 /* Electric blue */
  --text-primary: #ffffff --text-secondary: rgba(255, 255, 255, 0.7)
  --text-muted: rgba(255, 255, 255, 0.5) --success: #10b981 --warning: #f59e0b
  --emergency: #ef4444;
```

### Typography

- **Display:** Inter (Black 900) - For titles and hero text
- **Body:** Inter (Regular 400) - For content
- **Mono:** JetBrains Mono - For keyboard keys and technical elements
- **Fallback:** system-ui, -apple-system, sans-serif

### Spatial System

- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Border radius: 8px (small), 16px (medium), 24px (large), 32px (cards)
- Glass blur: 20-60px depending on depth

### Motion Philosophy

- **Micro-interactions:** 150-300ms with spring physics (stiffness: 400, damping: 25)
- **Page transitions:** 500-700ms with 3D transforms (rotateX, scale, blur)
- **Hover effects:** Scale 1.02-1.08 with glow intensification
- **Loading states:** Pulsing rings, particle streams, neural pulse animations

### Visual Assets

- **Icons:** Lucide React (consistent stroke weight, rounded caps)
- **3D Elements:** React Three Fiber with custom shaders
- **Backgrounds:** Three.js galaxy with stars, nebula particles, neural networks
- **Effects:** Post-processing (bloom, chromatic aberration, vignette, glitch)

---

## 3. Layout & Structure

### Navigation Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    IrisComm                              │
├─────────────────────────────────────────────────────────┤
│  [Home] [Calibrate] [Communicate] [Speech] [Phrases]   │
│                                       [Emergency] [Settings] │
└─────────────────────────────────────────────────────────┘
```

### Screen Flow

1. **Loading** → Neural initialization animation
2. **Landing** → Hero with 3D eye logo, feature overview
3. **Calibration** → Camera setup, gaze tracking setup
4. **Communication** → Main typing interface (keyboard + output)
5. **Speech** → Voice output controls and emotion synthesis
6. **Phrases** → Quick phrase boards and favorites
7. **Emergency** → Alert configuration and testing
8. **Settings** → Customization options

### Responsive Strategy

- **Desktop (1200px+):** Full 3D effects, expanded keyboard
- **Tablet (768-1199px):** Reduced particles, touch-optimized
- **Mobile (< 768px):** Simplified UI, essential effects only

---

## 4. Features & Interactions

### 4.1 Eye Tracking System

**Technology:** MediaPipe Face Mesh + Custom Gaze Detection

**Gestures:**
| Gesture | Action |
|---------|--------|
| Blink (single) | Select highlighted key |
| Double blink | Speak current message |
| Left wink | Backspace |
| Right wink | Space |
| Eyebrow raise | Toggle prediction panel |
| Sustained gaze (2s) | Emergency trigger |
| Gaze direction | Navigate keyboard grid |

**Calibration Flow:**

1. Camera permission request
2. Face positioning guide (silhouette overlay)
3. 9-point calibration grid
4. Validation with accuracy score
5. Save profile or retry

### 4.2 Communication Interface

**Keyboard Layouts:**

1. **QWERTY** - Standard keyboard
2. **ABC** - Alphabetical order
3. **Phrase Grid** - Common phrases
4. **Numbers/Symbols** - Extended input

**Glassmorphic Keyboard Keys:**

- Default: Semi-transparent, subtle border glow
- Hover: Scale 1.05, intensified glow, ripple effect
- Selected: Full accent color, pulse animation
- Disabled: 50% opacity, no interactions

**Typing Flow:**

1. Gaze highlights row
2. Dwell time (1.5s default) selects row
3. Gaze navigates to key
4. Dwell selects key
5. Key animates with ripple + optional sound
6. Character appears in output

### 4.3 AI Predictions (Groq Integration)

**Features:**

- Real-time next-word suggestions (Groq API)
- Context-aware phrase completion
- Learning user typing patterns
- Custom phrase training

**UI:**

- Floating suggestion chips above keyboard
- Tap to select suggestion
- Auto-complete on confident predictions

### 4.4 Speech Output

**Voice Options:**

- Web Speech API (free, all browsers)
- Pitch/rate adjustment (0.5x - 2x)
- Emotion-aware modulation (happy pitch up, urgent speed up)

**Emotion Detection:**

- MediaPipe Face Mesh expressions
- Happy, Sad, Angry, Surprised, Neutral
- Affects voice tone automatically

### 4.5 Emergency System

**Triggers:**

- Sustained gaze (2s)
- Physical button
- Voice command (if available)

**Actions:**

- Screen flash red
- Vibration (if supported)
- SMS to emergency contacts (Twilio)
- Push notification
- Play loud alert sound
- Call preset number

**Configuration:**

- Add/remove emergency contacts
- Custom message templates
- Test mode

### 4.6 Phrase Boards

**Categories:**

- Basic Needs: Water, Food, Bathroom, Help, Pain
- Emotions: Happy, Sad, Angry, Tired, Anxious
- Actions: Yes, No, More, Stop, Please
- Medical: Medication, Doctor, Hospital
- Social: Family, Friends, Alone
- Custom: User-defined phrases

**Features:**

- Favorite pinning
- Recent phrases
- Contextual suggestions
- Drag-and-drop organization

### 4.7 Gamification

**Daily Challenges:**

- "Send 3 unique messages"
- "Use 5 different phrases"
- "Practice calibration for 2 minutes"

**Achievements:**

- First message sent
- 100 messages milestone
- Perfect calibration streak
- Emergency drill completed

**Progress Tracking:**

- XP points system
- Galaxy-themed badges
- Weekly progress reports

### 4.8 Analytics Dashboard (Caregiver View)

**Metrics:**

- Messages sent per day/week/month
- Most used phrases
- Average typing speed
- Error rate
- Emergency usage
- Session duration
- Emotion trends

**Sharing:**

- PDF export
- Secure caregiver link
- Integration with medical records

---

## 5. Component Inventory

### Navigation Bar

- **Default:** Glass background, muted icons
- **Active:** Accent glow, filled icon
- **Hover:** Scale 1.1, tooltip
- **Emergency:** Red accent, pulsing

### Glass Cards

- **Default:** 20px blur, 10% white
- **Hover:** Scale 1.02, shadow lift
- **Active:** 30px blur, accent border

### Holographic Buttons

- **Default:** Gradient background, shine sweep
- **Hover:** Glow aura, scale 1.05
- **Active:** Pressed effect, ripple
- **Disabled:** 50% opacity
- **Loading:** Spinner overlay

### Keyboard Keys

- **Default:** Glass, key letter
- **Highlighted:** Row/column glow
- **Selected:** Accent fill, pulse
- **Pressed:** Scale down, ripple out

### Suggestion Chips

- **Default:** Pill shape, subtle bg
- **Hover:** Accent border
- **Active:** Fill with checkmark

### Output Display

- **Empty:** Placeholder text
- **Typing:** Blinking cursor
- **Complete:** Full message, actions
- **Speaking:** Sound wave animation

### Calibration Overlay

- **Camera feed:** Full screen
- **Face guide:** Oval silhouette
- **Progress:** 9-point dots
- **Complete:** Success checkmark

---

## 6. Technical Approach

### Stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4 + CSS variables
- **3D:** React Three Fiber + Drei + Postprocessing
- **Animation:** Framer Motion
- **State:** Zustand
- **Eye Tracking:** MediaPipe Face Mesh (browser)
- **AI:** Groq API (cloud) / TensorFlow.js (offline)
- **Speech:** Web Speech API
- **Storage:** IndexedDB (offline), localStorage (settings)

### Key Files

```
app/
├── page.tsx                    # Landing page
├── advanced/page.tsx           # Main app container
├── ultra-advanced/page.tsx    # Full-featured app
components/
├── 3d/NeuralNetwork.tsx       # 3D neural network
├── ui/
│   ├── glass-card.tsx
│   ├── keyboard.tsx            # Eye-tracking keyboard
│   ├── calibration.tsx        # Eye calibration
│   ├── phrase-board.tsx
│   ├── output-display.tsx
│   ├── prediction-panel.tsx
│   ├── emergency-modal.tsx
│   └── settings-panel.tsx
hooks/
├── useEyeTracking.ts          # Eye tracking hook
├── useSpeech.ts               # Speech synthesis
├── useGroqAI.ts               # AI predictions
├── useEmotion.ts              # Emotion detection
└── useGestures.ts             # Gesture recognition
lib/
├── store.ts                   # Zustand store
├── mediaPipe.ts               # MediaPipe setup
└── constants.ts               # Phrases, config
```

### API Design

**Groq AI Endpoint:**

```typescript
POST /api/groq
Body: { text: string, context?: string[] }
Response: { suggestions: string[], completed: string }
```

**Emergency Alert:**

```typescript
POST /api/emergency
Body: { type: 'sms' | 'call' | 'push', contact: string, message: string }
Response: { success: boolean, timestamp: string }
```

### Offline Strategy

- Service Worker for app shell caching
- IndexedDB for user data and preferences
- TensorFlow.js models bundled
- Fallback to basic Web Speech if no API

### Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Eye tracking latency: < 50ms
- Animation: 60fps
- Bundle size: < 500KB initial

---

## 7. Advanced Features (Hackathon Winners)

### Generative AI Communication

- Full sentence completion from few words
- Context-aware suggestions (time, location, conversation)
- Personalized phrase generation

### Multi-Modal Input

- Eye tracking (primary)
- Voice (when available)
- Head movement (alternative)
- Switch scanning (accessibility)

### Neural Avatar

- 3D face mesh mapped to 3D model
- Real-time expression mirroring
- Eye gaze visualization
- For video calls

### IoT Integration

- WebBluetooth for smart devices
- MQTT for home automation
- Eye-controlled lights/fans/TV

### AR Overlay (WebXR)

- Floating keyboard in real space
- Object recognition → phrase suggestion
- Spatial typing with gaze

### Voice Cloning (Future)

- User voice banking
- Emotional speech synthesis
- Personalized TTS voice

---

## 8. Accessibility Compliance

### WCAG 2.1 AA

- High contrast mode toggle
- Keyboard navigation fallback
- Screen reader compatible
- Reduced motion option
- Focus indicators
- Color-blind safe palette

### AAC Standards

- Symbol-based communication support
- Customizable dwell time
- Multiple input modalities
- Predictive text options

---

## 9. Success Metrics

- **Demo Impact:** "Wow" moment with AR + eye tracking
- **Technical Depth:** 10+ integrated technologies
- **Real-world Use:** Works offline, privacy-focused
- **Innovation:** Generative AI + gesture fusion
- **Presentation:** Live demo with airplane mode
