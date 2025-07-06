import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserPreferencesSchema } from "@shared/schema";
import { z } from "zod";

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Metro Lines
  app.get("/api/metro-lines", async (req, res) => {
    try {
      const lines = await storage.getMetroLines();
      res.json(lines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metro lines" });
    }
  });

  app.get("/api/metro-lines/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const line = await storage.getMetroLineByCode(code);
      if (!line) {
        return res.status(404).json({ message: "Metro line not found" });
      }
      res.json(line);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metro line" });
    }
  });

  // Stations
  app.get("/api/stations", async (req, res) => {
    try {
      const lineId = req.query.lineId ? parseInt(req.query.lineId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const stations = await storage.getStations(lineId, limit, offset);
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stations" });
    }
  });

  app.get("/api/stations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const station = await storage.getStationById(id);
      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }
      res.json(station);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch station" });
    }
  });

  app.get("/api/stations/popular", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const stations = await storage.getStationsByPopularity(limit);
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular stations" });
    }
  });

  app.get("/api/stations/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const language = req.query.lang as string || 'ar';
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const stations = await storage.searchStations(query, language);
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: "Failed to search stations" });
    }
  });

  app.get("/api/stations/random", async (req, res) => {
    try {
      const station = await storage.getRandomStation();
      if (!station) {
        return res.status(404).json({ message: "No stations available" });
      }
      res.json(station);
    } catch (error) {
      res.status(500).json({ message: "Failed to get random station" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Attractions
  app.get("/api/attractions/station/:stationId", async (req, res) => {
    try {
      const stationId = parseInt(req.params.stationId);
      const attractions = await storage.getAttractionsByStation(stationId);
      res.json(attractions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attractions" });
    }
  });

  app.get("/api/attractions/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const attractions = await storage.getAttractionsByCategory(categoryId);
      res.json(attractions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attractions by category" });
    }
  });

  app.get("/api/attractions/recommended", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const attractions = await storage.getRecommendedAttractions(limit);
      res.json(attractions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommended attractions" });
    }
  });

  // User Preferences
  app.get("/api/user/preferences", async (req, res) => {
    try {
      let sessionId = req.headers['x-session-id'] as string;
      
      if (!sessionId) {
        sessionId = generateSessionId();
        res.setHeader('X-Session-Id', sessionId);
      }
      
      const preferences = await storage.getUserPreferences(sessionId);
      res.json(preferences || { sessionId, preferredCategories: [], visitedStations: [], favoriteStations: [], language: 'ar' });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.put("/api/user/preferences", async (req, res) => {
    try {
      let sessionId = req.headers['x-session-id'] as string;
      
      if (!sessionId) {
        sessionId = generateSessionId();
        res.setHeader('X-Session-Id', sessionId);
      }

      const validatedData = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.updateUserPreferences(sessionId, validatedData);
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user preferences" });
      }
    }
  });

  app.post("/api/user/favorites/:stationId", async (req, res) => {
    try {
      let sessionId = req.headers['x-session-id'] as string;
      
      if (!sessionId) {
        sessionId = generateSessionId();
        res.setHeader('X-Session-Id', sessionId);
      }

      const stationId = parseInt(req.params.stationId);
      await storage.addFavoriteStation(sessionId, stationId);
      res.json({ message: "Station added to favorites" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite station" });
    }
  });

  app.delete("/api/user/favorites/:stationId", async (req, res) => {
    try {
      let sessionId = req.headers['x-session-id'] as string;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID required" });
      }

      const stationId = parseInt(req.params.stationId);
      await storage.removeFavoriteStation(sessionId, stationId);
      res.json({ message: "Station removed from favorites" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite station" });
    }
  });

  app.post("/api/user/visited/:stationId", async (req, res) => {
    try {
      let sessionId = req.headers['x-session-id'] as string;
      
      if (!sessionId) {
        sessionId = generateSessionId();
        res.setHeader('X-Session-Id', sessionId);
      }

      const stationId = parseInt(req.params.stationId);
      await storage.addVisitedStation(sessionId, stationId);
      res.json({ message: "Station marked as visited" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark station as visited" });
    }
  });

  // Personalized Recommendations
  app.get("/api/user/recommendations", async (req, res) => {
    try {
      let sessionId = req.headers['x-session-id'] as string;
      
      if (!sessionId) {
        sessionId = generateSessionId();
        res.setHeader('X-Session-Id', sessionId);
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const recommendations = await storage.getPersonalizedRecommendations(sessionId, limit);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch personalized recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
