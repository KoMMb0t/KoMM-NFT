/**
 * KoMM Portal – Backend Server
 *
 * Verantwortlich für:
 * - Off-Chain-Datenhaltung (Benutzerprofile, Lazy-Mint-Voucher)
 * - Konnektor-System (OpenSea, Rarible API-Integration)
 * - WebSocket-Echtzeit-Updates (Gebote, Preisänderungen)
 * - Blockchain-Event-Indexierung
 *
 * Techstack: NestJS / Express + PostgreSQL + Redis + Socket.io
 */

import express from "express";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// ─── API Routes ──────────────────────────────────────────────────────────────

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "KoMM Portal API", version: "0.1.0" });
});

// Lazy-Mint Voucher speichern (KOSTENLOS für Creator)
app.post("/api/vouchers", async (req, res) => {
  // Speichert den signierten Voucher in PostgreSQL
  // Kein Minting, keine Gas-Kosten – nur Datenbank-Eintrag
  const { voucher, metadata } = req.body;
  // TODO: PostgreSQL Insert
  res.json({ success: true, message: "Voucher gespeichert (kostenlos)" });
});

// Listings abrufen (aggregiert: eigene + externe Plattformen)
app.get("/api/listings", async (req, res) => {
  const { source, sort, page, limit } = req.query;
  // TODO: Aggregation aus eigenem Contract + Konnektoren
  res.json({ listings: [], total: 0, page: 1 });
});

// Konnektor: Cross-Listing auf externen Plattformen
app.post("/api/connectors/cross-list", async (req, res) => {
  const { listingId, platforms } = req.body;
  // TODO: Seaport-Order für OpenSea generieren, Rarible SDK nutzen
  res.json({ success: true, listedOn: platforms });
});

// ─── WebSocket Events (Echtzeit-Updates) ─────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Raum für spezifische Auktionen
  socket.on("join:auction", (listingId: string) => {
    socket.join(`auction:${listingId}`);
  });

  socket.on("leave:auction", (listingId: string) => {
    socket.leave(`auction:${listingId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Funktion zum Broadcasten neuer Gebote
export function broadcastBid(listingId: string, bid: any) {
  io.to(`auction:${listingId}`).emit("new:bid", bid);
}

// Funktion zum Broadcasten von Verkäufen
export function broadcastSale(listingId: string, sale: any) {
  io.emit("new:sale", sale);
}

// ─── Server Start ────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`\n  KoMM Portal API running on port ${PORT}`);
  console.log(`  WebSocket ready for real-time updates\n`);
});
