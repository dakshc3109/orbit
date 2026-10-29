<div align="center">

<h1>✦ Orbit</h1>

<h3>Real-Time Multiplayer Tic-Tac-Toe</h3>

<p>
  A polished, cloud-connected game built to demonstrate real-time product development,
  responsive interface design, and practical frontend architecture.
</p>

<p>
  <a href="https://github.com/dakshc3109/orbit">
    <img src="https://img.shields.io/badge/Source%20Code-GitHub-181717?style=for-the-badge&logo=github" alt="Source code on GitHub">
  </a>
  <a href="https://orbit.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel" alt="Live demo on Vercel">
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=111111" alt="JavaScript">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 18 or newer">
  <img src="https://img.shields.io/badge/Express.js-Local%20Server-000000?style=flat-square&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/Firebase-Anonymous%20Auth-FFCA28?style=flat-square&logo=firebase&logoColor=111111" alt="Firebase Anonymous Authentication">
  <img src="https://img.shields.io/badge/Firebase-Realtime%20Database-FFCA28?style=flat-square&logo=firebase&logoColor=111111" alt="Firebase Realtime Database">
  <img src="https://img.shields.io/badge/Vercel-Ready-000000?style=flat-square&logo=vercel" alt="Vercel ready">
  <img src="https://img.shields.io/badge/Responsive-Mobile%20%26%20Desktop-62DDF5?style=flat-square" alt="Responsive design">
</p>

<p>
  <a href="#live-product-flow">Overview</a> ·
  <a href="#highlights">Features</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-run-locally">Run locally</a> ·
  <a href="#-deploy-to-vercel">Deploy</a>
</p>

</div>

---

Orbit is a browser-based multiplayer Tic-Tac-Toe experience. A player creates a private room, shares a short room code, and plays against another person with the board synchronized instantly across both devices.

The project is intentionally lightweight: the frontend is built with standard web technologies, Firebase provides authentication and realtime state synchronization, and Vercel can host the production application without a long-running custom server.

> **Technology note:** This project uses standard HTML, CSS, and modern JavaScript rather than Next.js or Tailwind CSS. Node.js and Express are included only for local static-file serving; Firebase is the production realtime backend.

## Live product flow

1. A player opens Orbit and chooses **Create a room**.
2. Orbit generates a unique five-character room code.
3. The second player enters the code through **Join a room**.
4. Both players are assigned a symbol:
   - Player 1: `X`
   - Player 2: `O`
5. Moves, turns, wins, draws, and rematches synchronize in real time.

## Highlights

- **Real-time multiplayer rooms** powered by Firebase Realtime Database
- **Anonymous authentication** so players can join without creating an account
- **Server-backed shared state** instead of relying on browser-only state
- **Atomic room joins and moves** using Firebase transactions
- **Turn-aware controls** that prevent players from moving out of order
- Automatic **win, draw, and loss detection**
- **Play Again** resets the game for both players
- Room cleanup when a player disconnects
- Five-character, human-readable room codes
- Responsive glassmorphism-inspired interface for mobile and desktop
- Accessible labels for board cells, controls, status text, and result dialogs
- Deployable to Vercel with no persistent Node.js WebSocket server

## Product and design decisions

Orbit uses a deliberately focused visual language:

- Deep charcoal background for a calm game-room atmosphere
- Cyan `X` and pink `O` markers for immediate player distinction
- High-contrast status messages for turn and connection state
- Subtle hover, scale, and marker-entry animations
- A compact layout that remains comfortable on touch screens
- A clear room-code presentation so inviting another player takes seconds

The interface avoids unnecessary menus and keeps the primary action visible at every stage: create, join, make a move, or play again.

## Technology

| Area | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 with responsive layouts and custom animations |
| Client logic | Modern browser JavaScript using ES modules |
| Local development server | Node.js 18+ and Express |
| Authentication | Firebase Anonymous Authentication |
| Realtime state | Firebase Realtime Database |
| Production hosting | Vercel |
| Source control | Git and GitHub |

## Architecture

```text
┌──────────────────────┐
│  Player browser A    │
└──────────┬───────────┘
           │
           ├────────────── Firebase Anonymous Auth
           │
┌──────────▼───────────┐
│ Firebase Realtime DB  │
│ rooms/{roomCode}     │
└──────────▲───────────┘
           │
           ├────────────── Real-time listeners
           │
┌──────────┴───────────┐
│  Player browser B    │
└──────────────────────┘
```

Each room stores:

- The nine-cell board
- The current turn
- Game status
- Winner, when applicable
- The two authenticated anonymous players
- A last-updated timestamp

The browser subscribes to the room with a Firebase realtime listener. A move is applied through a transaction so simultaneous writes do not silently overwrite each other.

## Project structure

```text
.
├── public/
│   ├── app.js              Firebase integration and game behavior
│   ├── index.html          Semantic page structure and accessible markup
│   └── styles.css          Responsive visual design and animations
├── database.rules.json     Firebase Realtime Database rules
├── firebase.json            Firebase CLI configuration
├── package.json             Local scripts and dependencies
├── server.js                Local static-file server
└── vercel.json              Vercel deployment configuration
```

## Run locally

### Requirements

- Node.js 18 or newer
- A Firebase project
- Firebase Anonymous Authentication enabled
- Firebase Realtime Database created

### Install and start

```bash
git clone https://github.com/dakshc3109/orbit.git
cd orbit
npm install
npm start
```

Open:

```text
http://localhost:3000
```

To test multiplayer locally, open the URL in two separate browser tabs or windows. Create a room in one tab and join its code in the other.

### Validate before deployment

```bash
npm run check
```

This checks the syntax of both the local server and browser JavaScript.

## Firebase configuration

### Enable Anonymous Authentication

In Firebase Console:

1. Open **Build → Authentication**.
2. Open **Sign-in method**.
3. Enable **Anonymous**.
4. Save the provider.

### Create Realtime Database

1. Open **Build → Realtime Database**.
2. Create the database.
3. Choose the database region.
4. Publish the rules from [database.rules.json](./database.rules.json).

### Add authorized domains

In **Authentication → Settings → Authorized domains**, add:

```text
localhost
127.0.0.1
your-project.vercel.app
```

Add a custom domain too if one is connected to the Vercel project.

### Firebase web configuration

The browser Firebase configuration is stored in [public/app.js](./public/app.js). Firebase web API keys are designed to be included in client applications. Never commit Firebase service-account JSON files, private keys, or Admin SDK credentials.

If you use another Firebase project, replace the `firebaseConfig` object with the configuration from:

```text
Firebase Console → Project settings → Your apps → Web app
```

## Deploy to Vercel

The recommended production setup is:

```text
GitHub       → source code and version history
Vercel       → frontend hosting and deployments
Firebase     → authentication and realtime game data
```

### Deployment steps

1. Push the project to a GitHub repository.
2. Open [Vercel](https://vercel.com) and choose **Add New Project**.
3. Import the GitHub repository.
4. Use these settings:

   ```text
   Framework preset: Other
   Root directory: project root
   Build command: leave empty
   Output directory: public
   ```

5. Deploy the project.
6. Add the generated Vercel domain to Firebase Authorized domains.
7. Test the deployed URL in two browser windows.

The [vercel.json](./vercel.json) file configures the `public` output directory.

## Database rules and trust model

The included rules require Firebase authentication before a user can access room data:

```json
{
  "rules": {
    ".write": false,
    "rooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

This is suitable for a small demonstration and portfolio application using anonymous players. The client handles room capacity, move ordering, and game rules.

For a larger or adversarial production environment, game validation should move to a trusted backend or Firebase Cloud Functions. That backend could validate every move, enforce room membership server-side, rate-limit requests, and remove abandoned rooms automatically.

## Scalability

The application does not keep rooms in a single Node.js process. Room data lives in Firebase, so multiple players and approximately 5–10 simultaneous rooms can operate independently without requiring a persistent WebSocket server.

For a larger public launch, consider:

- Firebase App Check
- Server-side move validation with Cloud Functions
- Rate limiting and abuse monitoring
- Automatic expiration for abandoned rooms
- Analytics and error monitoring
- A persistent player identity system

## Future improvements

- Invite links that open a room directly
- Player display names and avatars
- Match history and rematch statistics
- Spectator mode
- Sound and reduced-motion preferences
- Light theme
- Automated end-to-end multiplayer tests
- Cloud Functions for authoritative game validation

## Why this project

Orbit demonstrates more than a static game board. It combines:

- Product-focused interface design
- Responsive frontend implementation
- Realtime distributed state
- Authentication without unnecessary onboarding
- Transaction-based concurrency handling
- Deployment-ready project organization
- Clear separation between presentation, client behavior, and cloud services

It is a compact example of turning a familiar game into a reliable, inviting, and deployable web product.

## License

This project is available for educational and portfolio use. Add a formal license here if the repository will be distributed publicly.
