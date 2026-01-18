# Tsono Landing Page Brief

> This document describes the Tsono motorcycle riding companion app for building a landing page. Use this to create a modern, compelling landing page that showcases the app's features to new users.

---

## App Overview

**Name:** Tsono
**Tagline:** "Ride Together. Never Ride Alone."
**Type:** Progressive Web App (PWA) for motorcycle riders
**Platform:** Mobile-first web app (iOS, Android, Desktop via browser)
**Region:** Currently focused on DFW (Dallas-Fort Worth) area, expandable

### What is Tsono?

Tsono is a real-time riding companion app designed specifically for motorcycle enthusiasts. It connects riders, enables group coordination, and provides essential safety features—all without requiring app store downloads. Just open the browser and ride.

---

## Brand Identity

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Hot Pink (Primary)** | `#ff4d94` | Buttons, CTAs, accents |
| **Purple (Secondary)** | `#6b21a8` | Gradients, highlights |
| **Slate Dark** | `#0f172a` | Text, dark mode background |
| **White** | `#ffffff` | Light mode background, text |
| **Gray** | `#475569` | Secondary text |

### Typography
- Clean, modern sans-serif fonts
- High contrast for readability while riding
- Large touch targets (44px minimum)

### Visual Style
- Gradient backgrounds (pink-to-purple)
- Glassmorphism effects (frosted glass panels)
- Smooth animations and transitions
- 3D map visualizations
- Dark mode default (rider preference)

---

## Key Features

### 1. Real-Time Location Tracking
**The Core Experience**
- Live GPS tracking with 3-second updates
- See all nearby riders on a stunning 3D Mapbox map
- Heading-based map rotation (map points where you're going)
- Distance and ETA calculations to other riders

### 2. Group Ride Management
**Ride Together, Stay Together**
- Create rides with custom names and destinations
- Share 6-character invite codes for easy joining
- Real-time participant tracking during rides
- See all group members on the map simultaneously

### 3. Rider-to-Rider Signals
**Communicate Without Stopping**
- Tap to send signals: Slow Down, Speed Up, Hazard, Stop, Regroup, Go
- Visual and haptic notifications
- Signal queue system (never miss a message)
- Priority-based alerts (safety signals first)

### 4. Glove-Friendly Interface
**Designed for Riders, Not Commuters**
- Extra-large touch targets (50px+ buttons)
- Simple gestures (swipe to switch views)
- Pull-to-refresh for manual updates
- Minimal text input while riding

### 5. Nearby Rider Discovery
**Find Your Tribe**
- See riders within your vicinity
- View distance and arrival estimates
- Tap to view rider details on map
- Connect with local riding community

### 6. Progressive Web App
**No App Store Required**
- Install directly from browser
- Works offline with cached data
- Push notifications for signals
- Automatic updates (always latest version)
- Lightweight (~2MB vs 50MB+ native apps)

### 7. Safety Features
**Ride Smarter**
- Screen wake lock (display stays on)
- High-visibility signal notifications
- Emergency stop signals
- Hazard warnings from other riders

### 8. Smart Navigation
**Know Where You're Going**
- Set destinations with autocomplete search
- Saved favorite locations
- Recent destinations history
- Turn-by-turn awareness

---

## Feature Highlights for Landing Page Sections

### Hero Section
- **Headline:** "Ride Together. Never Ride Alone."
- **Subheadline:** "The real-time companion app for motorcycle riders. Track your crew, send signals, and never lose the group."
- **CTA:** "Start Riding Free" / "Open Tsono"
- **Visual:** 3D map with multiple rider markers, signal animation

### Feature Grid (3-4 cards)

**Card 1: Real-Time Tracking**
- Icon: Location pin / radar
- "See your entire group on a live 3D map. Know exactly where everyone is, every second."

**Card 2: Instant Signals**
- Icon: Lightning bolt / hand signal
- "Communicate without stopping. Tap to alert your crew—Slow Down, Hazard, Regroup, and more."

**Card 3: Group Rides**
- Icon: Users / motorcycle group
- "Create a ride, share a code, and everyone joins instantly. No accounts needed for guests."

**Card 4: Glove-Ready**
- Icon: Glove / touch hand
- "Designed for real riders. Big buttons, simple gestures, zero fumbling."

### Social Proof Section
- Target: 100+ riders in DFW
- Focus on community aspect
- Testimonial placeholders for early users

### How It Works (3 steps)
1. **Open Tsono** - No download required. Works in your browser.
2. **Create or Join** - Start a ride or enter a friend's code.
3. **Ride Together** - Track, signal, and stay connected.

### Comparison Section (vs Competitors)
| Feature | Tsono | Life360 | Rever | Tonit |
|---------|-------|---------|-------|-------|
| Motorcycle-focused | Yes | No | Partial | Yes |
| Real-time signals | Yes | No | No | Limited |
| No app download | Yes | No | No | No |
| Group tracking | Yes | Yes | Yes | Yes |
| Glove-friendly | Yes | No | No | Partial |
| Free tier | Yes | Yes | Yes | Yes |

---

## Target Audience

### Primary Users
- **Motorcycle enthusiasts** who ride in groups
- **Weekend riders** doing casual group cruises
- **Riding clubs** coordinating meetups and rides
- **Adventure riders** on longer trips

### User Personas

**"Group Gary"** - Rides every weekend with 4-8 friends. Hates when someone gets separated at a light. Wants to know everyone made it through.

**"Safety Sarah"** - Always worried about hazards ahead. Loves being able to warn the group about road debris or cops.

**"New Rider Nick"** - Just got his bike. Wants to find local riders and join group rides without the pressure of joining a formal club.

### Demographics
- Age: 25-55
- Location: Initially DFW, expanding to other metros
- Devices: iPhone and Android, mid-to-high-end phones
- Tech comfort: Moderate (can use apps, not developers)

---

## Differentiators

### Why Tsono Over Alternatives?

1. **Built FOR motorcyclists, BY riders**
   - Not a generic location app retrofitted for bikes
   - Every feature designed with gloves and helmets in mind

2. **Instant signals, not messaging**
   - One-tap communication
   - No typing, no voice commands
   - Visual + haptic feedback you can feel

3. **PWA = No friction**
   - Share a link, they're in
   - No "download this app first" barrier
   - Works on any modern device

4. **Real-time, not "check-ins"**
   - Live tracking, not periodic updates
   - See movement as it happens
   - 3-second refresh rate

5. **Privacy-first**
   - Only share location when you choose
   - Leave a ride anytime
   - No persistent tracking when not riding

---

## Monetization (Future)

### Free Tier
- Create/join rides
- Real-time tracking
- Basic signals
- Up to 10 riders per group

### Premium ($4.99/month)
- Unlimited group size
- Ride history and stats
- Advanced signals
- Priority support
- Route recording

---

## Technical Highlights (for credibility)

- **Real-time:** WebSocket connections for instant updates
- **3D Maps:** Mapbox GL with terrain and buildings
- **Offline-capable:** Service workers cache critical features
- **Battery-optimized:** Efficient GPS sampling
- **Secure:** JWT authentication, HTTPS everywhere

---

## Call-to-Action Options

- "Start Riding Free"
- "Open Tsono Now"
- "Find Riders Near You"
- "Create Your First Ride"
- "Join the Ride"

---

## Screenshots / Visual Assets Needed

1. **Hero shot:** Phone showing 3D map with multiple rider pins
2. **Signal screen:** Finger tapping the signal FAB (floating action button)
3. **Group view:** List of riders with distances
4. **Create ride:** Simple form with ride name and destination
5. **Join ride:** Enter code screen
6. **Dark mode:** Full app in dark theme
7. **Notification:** Signal received with haptic indicator

---

## Landing Page Structure Recommendation

```
[Nav: Logo | Features | How it Works | Download]

[Hero]
- Headline + Subheadline
- Phone mockup with live map
- Primary CTA button

[Features Grid]
- 4 feature cards with icons

[How It Works]
- 3-step process with illustrations

[Why Tsono]
- Comparison table or differentiator bullets

[Social Proof]
- User testimonials or stats

[Final CTA]
- "Ready to Ride?" + button

[Footer]
- Links, legal, social
```

---

## Tone of Voice

- **Confident but not arrogant** - We know riders, we are riders
- **Action-oriented** - Verbs over nouns (Ride, Track, Signal, Join)
- **Community-focused** - "Your crew," "Ride together," "Never alone"
- **No jargon** - Simple language, no tech-speak
- **Exciting** - This is about the thrill of riding, not just an app

---

## Sample Copy

**Hero:**
> "Your crew, your ride, your way. Tsono keeps your group connected in real-time—so you can focus on the road ahead."

**Feature intro:**
> "Designed by riders who got tired of losing friends at every stoplight."

**CTA context:**
> "No app store. No signup wall. Just open and ride."

**Closing:**
> "The road is better together. Start your first ride in seconds."

---

*This brief is designed to give another Claude instance everything needed to create a compelling, conversion-focused landing page for Tsono.*
