import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  runTransaction,
  update
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbgrl5ierFtHvxWDAbCkniVZZGy4Afwog",
  authDomain: "tictaccloud-f353c.firebaseapp.com",
  databaseURL: "https://tictaccloud-f353c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tictaccloud-f353c",
  storageBucket: "tictaccloud-f353c.firebasestorage.app",
  messagingSenderId: "865702912890",
  appId: "1:865702912890:web:417445f8e43c0cabd1acc3",
  measurementId: "G-4YHJGDELQT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const elements = {
  landing: document.querySelector("#landing"),
  game: document.querySelector("#game"),
  board: document.querySelector("#board"),
  roomInput: document.querySelector("#roomInput"),
  error: document.querySelector("#error"),
  turn: document.querySelector("#turnText"),
  players: document.querySelector("#playersText"),
  waiting: document.querySelector("#waitingText"),
  modal: document.querySelector("#resultModal"),
  resultIcon: document.querySelector("#resultIcon"),
  resultTitle: document.querySelector("#resultTitle"),
  resultCopy: document.querySelector("#resultCopy"),
  roomCode: document.querySelector("#roomCode"),
  copyButton: document.querySelector("#copyBtn")
};

const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
let currentUser = null;
let currentRoomCode = null;
let gameState = null;
let stopRoomListener = null;

document.querySelector("#createBtn").addEventListener("click", createRoom);
document.querySelector("#joinBtn").addEventListener("click", joinRoom);
document.querySelector("#againBtn").addEventListener("click", playAgain);
document.querySelector("#leaveBtn").addEventListener("click", leaveRoom);
elements.roomInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") joinRoom();
});
elements.copyButton.addEventListener("click", copyRoomCode);

setPersistence(auth, inMemoryPersistence)
  .then(() => signInAnonymously(auth))
  .then(({ user }) => {
    currentUser = user;
  })
  .catch((error) => {
    console.error("Firebase anonymous sign-in failed:", error);
    showError(getFirebaseAuthError(error));
  });

async function createRoom() {
  clearError();
  if (!currentUser) return showError("Connecting to Firebase. Please try again in a moment.");

  try {
    const code = createRoomCode();
    const roomReference = ref(database, `rooms/${code}`);
    const result = await runTransaction(roomReference, (room) => room || {
        board: Array(9).fill(""),
        turn: "X",
        status: "waiting",
        winner: null,
        players: { [currentUser.uid]: { symbol: "X", joinedAt: Date.now() } },
        updatedAt: Date.now()
      });

    if (!result.committed) {
      showError("That room code was already taken. Please try again.");
      return;
    }

    try {
      await enterRoom(code);
    } catch (error) {
      showError(getDatabaseError(error));
      console.error("Firebase room listener setup failed:", error);
    }
  } catch (error) {
    showError(getDatabaseError(error));
    console.error("Firebase room creation failed:", error);
  }
}

async function joinRoom() {
  clearError();
  const code = elements.roomInput.value.trim().toUpperCase();
  if (!currentUser) return showError("Connecting to Firebase. Please try again in a moment.");
  if (code.length !== 5) return showError("Enter the 5-character room code.");

  try {
    const roomReference = ref(database, `rooms/${code}`);
    const result = await runTransaction(roomReference, (room) => {
      if (!room || room.players?.[currentUser.uid]) return room;
      const players = Object.keys(room.players || {});
      if (players.length >= 2) return;
      return {
        ...room,
        status: "playing",
        players: { ...room.players, [currentUser.uid]: { symbol: "O", joinedAt: Date.now() } },
        updatedAt: Date.now()
      };
    });

    if (!result.committed || !result.snapshot.exists()) {
      showError("That room was not found or is already full.");
      return;
    }
    await enterRoom(code);
  } catch (error) {
    showError(getDatabaseError(error));
    console.error("Firebase room join failed:", error);
  }
}

async function enterRoom(code) {
  if (stopRoomListener) stopRoomListener();
  currentRoomCode = code;
  const roomReference = ref(database, `rooms/${code}`);
  await onDisconnect(ref(database, `rooms/${code}/players/${currentUser.uid}`)).remove();
  stopRoomListener = onValue(roomReference, (snapshot) => {
    if (!snapshot.exists()) {
      showError("This room has closed.");
      return leaveRoom();
    }
    gameState = { ...snapshot.val(), roomCode: code };
    elements.landing.classList.add("hidden");
    elements.game.classList.remove("hidden");
    renderGame();
  });
}

async function makeMove(index) {
  const roomReference = ref(database, `rooms/${currentRoomCode}`);
  await runTransaction(roomReference, (room) => {
    const player = room?.players?.[currentUser.uid];
    if (!room || !player || room.status !== "playing" || room.turn !== player.symbol || room.board[index]) return;
    const board = [...room.board];
    board[index] = player.symbol;
    const winner = getWinner(board);
    return {
      ...room,
      board,
      status: winner ? "won" : board.every(Boolean) ? "draw" : "playing",
      winner: winner ? player.symbol : null,
      turn: winner || board.every(Boolean) ? room.turn : player.symbol === "X" ? "O" : "X",
      updatedAt: Date.now()
    };
  });
}

async function playAgain() {
  if (!currentRoomCode || Object.keys(gameState.players || {}).length !== 2) return;
  await update(ref(database, `rooms/${currentRoomCode}`), {
    board: Array(9).fill(""),
    turn: "X",
    status: "playing",
    winner: null,
    updatedAt: Date.now()
  });
}

async function leaveRoom() {
  if (stopRoomListener) stopRoomListener();
  if (currentRoomCode && currentUser) {
    await set(ref(database, `rooms/${currentRoomCode}/players/${currentUser.uid}`), null);
  }
  currentRoomCode = null;
  window.location.reload();
}

function renderGame() {
  const players = Object.values(gameState.players || {});
  const player = gameState.players?.[currentUser.uid];
  const active = gameState.status === "playing";
  const hasOpponent = players.length === 2;

  elements.roomCode.textContent = gameState.roomCode;
  elements.players.textContent = `${players.length} / 2 players`;
  elements.turn.innerHTML = !hasOpponent
    ? "Waiting for opponent"
    : active && gameState.turn === player?.symbol
      ? "<span>Your turn</span>"
      : active ? "Opponent's turn" : "Game complete";
  elements.waiting.textContent = !hasOpponent
    ? "Share your room code to invite a friend."
    : active ? `You are playing as ${player?.symbol}.` : "";
  elements.board.replaceChildren(...gameState.board.map((mark, index) => {
    const cell = document.createElement("button");
    cell.className = `cell ${mark ? mark.toLowerCase() : ""}`;
    cell.textContent = mark || "";
    cell.disabled = !active || Boolean(mark) || gameState.turn !== player?.symbol;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", mark ? `${mark} at position ${index + 1}` : `Empty position ${index + 1}`);
    cell.addEventListener("click", () => makeMove(index));
    return cell;
  }));
  if (gameState.status === "won" || gameState.status === "draw") showResult();
  else elements.modal.classList.add("hidden");
}

function showResult() {
  const player = gameState.players?.[currentUser.uid];
  const didWin = gameState.winner === player?.symbol;
  elements.resultIcon.textContent = gameState.status === "draw" ? "≋" : didWin ? "✦" : "○";
  elements.resultTitle.textContent = gameState.status === "draw" ? "It's a draw" : didWin ? "You won!" : "Close one.";
  elements.resultCopy.textContent = gameState.status === "draw" ? "A perfectly balanced game." : didWin ? "That was a beautiful three in a row." : "Your opponent got there first.";
  elements.modal.classList.remove("hidden");
}

function getWinner(board) {
  const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  return lines.some(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
}

function createRoomCode() {
  return Array.from({ length: 5 }, () => codeAlphabet[Math.floor(Math.random() * codeAlphabet.length)]).join("");
}

async function copyRoomCode() {
  try {
    await navigator.clipboard.writeText(gameState.roomCode);
    elements.copyButton.textContent = "Copied!";
    setTimeout(() => { elements.copyButton.textContent = "Copy code"; }, 1500);
  } catch {
    elements.copyButton.textContent = gameState.roomCode;
  }
}

function showError(message) { elements.error.textContent = message; }
function clearError() { elements.error.textContent = ""; }

function getFirebaseAuthError(error) {
  switch (error.code) {
    case "auth/operation-not-allowed":
      return "Enable Anonymous Authentication in Firebase Console → Authentication → Sign-in method.";
    case "auth/unauthorized-domain":
      return "Add this website domain in Firebase Console → Authentication → Settings → Authorized domains.";
    case "auth/network-request-failed":
      return "Firebase could not be reached. Check your internet connection and try again.";
    default:
      return `Firebase sign-in failed (${error.code || "unknown error"}). Check the browser console for details.`;
  }
}

function getDatabaseError(error) {
  const errorCode = error?.code || "unknown error";

  switch (errorCode) {
    case "PERMISSION_DENIED":
      return "Firebase denied this room action. Publish the secure database rules, then refresh both tabs.";
    case "NETWORK_ERROR":
      return "Firebase could not be reached. Check your internet connection and try again.";
    default:
      return `Firebase room action failed (${errorCode}): ${error?.message || "No details were returned."}`;
  }
}
