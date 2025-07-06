import { 
  metroLines, 
  stations, 
  categories, 
  attractions, 
  userPreferences,
  type MetroLine, 
  type Station, 
  type Category,
  type Attraction,
  type UserPreferences,
  type InsertMetroLine,
  type InsertStation,
  type InsertCategory,
  type InsertAttraction,
  type InsertUserPreferences,
  type StationWithLine,
  type AttractionWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, inArray, like, sql } from "drizzle-orm";

export interface IStorage {
  // Metro Lines
  getMetroLines(): Promise<MetroLine[]>;
  getMetroLineByCode(code: string): Promise<MetroLine | undefined>;
  
  // Stations
  getStations(lineId?: number, limit?: number, offset?: number): Promise<StationWithLine[]>;
  getStationById(id: number): Promise<StationWithLine | undefined>;
  getStationsByPopularity(limit?: number): Promise<StationWithLine[]>;
  searchStations(query: string, language: string): Promise<StationWithLine[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  
  // Attractions
  getAttractionsByStation(stationId: number): Promise<AttractionWithDetails[]>;
  getAttractionsByCategory(categoryId: number): Promise<AttractionWithDetails[]>;
  getRecommendedAttractions(limit?: number): Promise<AttractionWithDetails[]>;
  
  // User Preferences
  getUserPreferences(sessionId: string): Promise<UserPreferences | undefined>;
  updateUserPreferences(sessionId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
  addFavoriteStation(sessionId: string, stationId: number): Promise<void>;
  removeFavoriteStation(sessionId: string, stationId: number): Promise<void>;
  addVisitedStation(sessionId: string, stationId: number): Promise<void>;
  
  // Recommendations
  getPersonalizedRecommendations(sessionId: string, limit?: number): Promise<AttractionWithDetails[]>;
  getRandomStation(): Promise<StationWithLine | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getMetroLines(): Promise<MetroLine[]> {
    return await db.select().from(metroLines).orderBy(asc(metroLines.id));
  }

  async getMetroLineByCode(code: string): Promise<MetroLine | undefined> {
    const [line] = await db.select().from(metroLines).where(eq(metroLines.lineCode, code));
    return line || undefined;
  }

  async getStations(lineId?: number, limit = 50, offset = 0): Promise<StationWithLine[]> {
    const query = db
      .select({
        id: stations.id,
        name: stations.name,
        nameAr: stations.nameAr,
        lineId: stations.lineId,
        latitude: stations.latitude,
        longitude: stations.longitude,
        walkingTime: stations.walkingTime,
        popularityScore: stations.popularityScore,
        isPopular: stations.isPopular,
        isTrending: stations.isTrending,
        line: {
          id: metroLines.id,
          name: metroLines.name,
          nameAr: metroLines.nameAr,
          color: metroLines.color,
          lineCode: metroLines.lineCode,
        }
      })
      .from(stations)
      .leftJoin(metroLines, eq(stations.lineId, metroLines.id))
      .orderBy(desc(stations.popularityScore), asc(stations.name))
      .limit(limit)
      .offset(offset);

    if (lineId) {
      query.where(eq(stations.lineId, lineId));
    }

    const result = await query;
    
    // Get attractions for each station
    const stationsWithAttractions = await Promise.all(
      result.map(async (station) => {
        const stationAttractions = await this.getAttractionsByStation(station.id);
        return {
          ...station,
          line: station.line!,
          attractions: stationAttractions,
        };
      })
    );

    return stationsWithAttractions;
  }

  async getStationById(id: number): Promise<StationWithLine | undefined> {
    const [station] = await db
      .select({
        id: stations.id,
        name: stations.name,
        nameAr: stations.nameAr,
        lineId: stations.lineId,
        latitude: stations.latitude,
        longitude: stations.longitude,
        walkingTime: stations.walkingTime,
        popularityScore: stations.popularityScore,
        isPopular: stations.isPopular,
        isTrending: stations.isTrending,
        line: {
          id: metroLines.id,
          name: metroLines.name,
          nameAr: metroLines.nameAr,
          color: metroLines.color,
          lineCode: metroLines.lineCode,
        }
      })
      .from(stations)
      .leftJoin(metroLines, eq(stations.lineId, metroLines.id))
      .where(eq(stations.id, id));

    if (!station) return undefined;

    const stationAttractions = await this.getAttractionsByStation(id);
    
    return {
      ...station,
      line: station.line!,
      attractions: stationAttractions,
    };
  }

  async getStationsByPopularity(limit = 10): Promise<StationWithLine[]> {
    return this.getStations(undefined, limit, 0);
  }

  async searchStations(query: string, language: string): Promise<StationWithLine[]> {
    const searchField = language === 'ar' ? stations.nameAr : stations.name;
    const results = await db
      .select({
        id: stations.id,
        name: stations.name,
        nameAr: stations.nameAr,
        lineId: stations.lineId,
        latitude: stations.latitude,
        longitude: stations.longitude,
        walkingTime: stations.walkingTime,
        popularityScore: stations.popularityScore,
        isPopular: stations.isPopular,
        isTrending: stations.isTrending,
        line: {
          id: metroLines.id,
          name: metroLines.name,
          nameAr: metroLines.nameAr,
          color: metroLines.color,
          lineCode: metroLines.lineCode,
        }
      })
      .from(stations)
      .leftJoin(metroLines, eq(stations.lineId, metroLines.id))
      .where(like(searchField, `%${query}%`))
      .limit(20);

    const stationsWithAttractions = await Promise.all(
      results.map(async (station) => {
        const stationAttractions = await this.getAttractionsByStation(station.id);
        return {
          ...station,
          line: station.line!,
          attractions: stationAttractions,
        };
      })
    );

    return stationsWithAttractions;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getAttractionsByStation(stationId: number): Promise<AttractionWithDetails[]> {
    const result = await db
      .select({
        id: attractions.id,
        name: attractions.name,
        nameAr: attractions.nameAr,
        description: attractions.description,
        descriptionAr: attractions.descriptionAr,
        stationId: attractions.stationId,
        categoryId: attractions.categoryId,
        rating: attractions.rating,
        walkingTimeFromStation: attractions.walkingTimeFromStation,
        imageUrl: attractions.imageUrl,
        videoUrl: attractions.videoUrl,
        videoDuration: attractions.videoDuration,
        isRecommended: attractions.isRecommended,
        station: {
          id: stations.id,
          name: stations.name,
          nameAr: stations.nameAr,
          lineId: stations.lineId,
          latitude: stations.latitude,
          longitude: stations.longitude,
          walkingTime: stations.walkingTime,
          popularityScore: stations.popularityScore,
          isPopular: stations.isPopular,
          isTrending: stations.isTrending,
          line: {
            id: metroLines.id,
            name: metroLines.name,
            nameAr: metroLines.nameAr,
            color: metroLines.color,
            lineCode: metroLines.lineCode,
          }
        },
        category: {
          id: categories.id,
          name: categories.name,
          nameAr: categories.nameAr,
          icon: categories.icon,
          color: categories.color,
        }
      })
      .from(attractions)
      .leftJoin(stations, eq(attractions.stationId, stations.id))
      .leftJoin(metroLines, eq(stations.lineId, metroLines.id))
      .leftJoin(categories, eq(attractions.categoryId, categories.id))
      .where(eq(attractions.stationId, stationId));

    return result.map(item => ({
      ...item,
      station: {
        ...item.station!,
        line: item.station!.line!,
      },
      category: item.category!,
    }));
  }

  async getAttractionsByCategory(categoryId: number): Promise<AttractionWithDetails[]> {
    const result = await db
      .select({
        id: attractions.id,
        name: attractions.name,
        nameAr: attractions.nameAr,
        description: attractions.description,
        descriptionAr: attractions.descriptionAr,
        stationId: attractions.stationId,
        categoryId: attractions.categoryId,
        rating: attractions.rating,
        walkingTimeFromStation: attractions.walkingTimeFromStation,
        imageUrl: attractions.imageUrl,
        videoUrl: attractions.videoUrl,
        videoDuration: attractions.videoDuration,
        isRecommended: attractions.isRecommended,
        station: {
          id: stations.id,
          name: stations.name,
          nameAr: stations.nameAr,
          lineId: stations.lineId,
          latitude: stations.latitude,
          longitude: stations.longitude,
          walkingTime: stations.walkingTime,
          popularityScore: stations.popularityScore,
          isPopular: stations.isPopular,
          isTrending: stations.isTrending,
          line: {
            id: metroLines.id,
            name: metroLines.name,
            nameAr: metroLines.nameAr,
            color: metroLines.color,
            lineCode: metroLines.lineCode,
          }
        },
        category: {
          id: categories.id,
          name: categories.name,
          nameAr: categories.nameAr,
          icon: categories.icon,
          color: categories.color,
        }
      })
      .from(attractions)
      .leftJoin(stations, eq(attractions.stationId, stations.id))
      .leftJoin(metroLines, eq(stations.lineId, metroLines.id))
      .leftJoin(categories, eq(attractions.categoryId, categories.id))
      .where(eq(attractions.categoryId, categoryId));

    return result.map(item => ({
      ...item,
      station: {
        ...item.station!,
        line: item.station!.line!,
      },
      category: item.category!,
    }));
  }

  async getRecommendedAttractions(limit = 10): Promise<AttractionWithDetails[]> {
    const result = await db
      .select({
        id: attractions.id,
        name: attractions.name,
        nameAr: attractions.nameAr,
        description: attractions.description,
        descriptionAr: attractions.descriptionAr,
        stationId: attractions.stationId,
        categoryId: attractions.categoryId,
        rating: attractions.rating,
        walkingTimeFromStation: attractions.walkingTimeFromStation,
        imageUrl: attractions.imageUrl,
        videoUrl: attractions.videoUrl,
        videoDuration: attractions.videoDuration,
        isRecommended: attractions.isRecommended,
        station: {
          id: stations.id,
          name: stations.name,
          nameAr: stations.nameAr,
          lineId: stations.lineId,
          latitude: stations.latitude,
          longitude: stations.longitude,
          walkingTime: stations.walkingTime,
          popularityScore: stations.popularityScore,
          isPopular: stations.isPopular,
          isTrending: stations.isTrending,
          line: {
            id: metroLines.id,
            name: metroLines.name,
            nameAr: metroLines.nameAr,
            color: metroLines.color,
            lineCode: metroLines.lineCode,
          }
        },
        category: {
          id: categories.id,
          name: categories.name,
          nameAr: categories.nameAr,
          icon: categories.icon,
          color: categories.color,
        }
      })
      .from(attractions)
      .leftJoin(stations, eq(attractions.stationId, stations.id))
      .leftJoin(metroLines, eq(stations.lineId, metroLines.id))
      .leftJoin(categories, eq(attractions.categoryId, categories.id))
      .where(eq(attractions.isRecommended, true))
      .limit(limit);

    return result.map(item => ({
      ...item,
      station: {
        ...item.station!,
        line: item.station!.line!,
      },
      category: item.category!,
    }));
  }

  async getUserPreferences(sessionId: string): Promise<UserPreferences | undefined> {
    const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.sessionId, sessionId));
    return prefs || undefined;
  }

  async updateUserPreferences(sessionId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(sessionId);
    
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userPreferences.sessionId, sessionId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userPreferences)
        .values({ sessionId, ...preferences })
        .returning();
      return created;
    }
  }

  async addFavoriteStation(sessionId: string, stationId: number): Promise<void> {
    const prefs = await this.getUserPreferences(sessionId);
    const currentFavorites = prefs?.favoriteStations || [];
    
    if (!currentFavorites.includes(stationId)) {
      await this.updateUserPreferences(sessionId, {
        favoriteStations: [...currentFavorites, stationId]
      });
    }
  }

  async removeFavoriteStation(sessionId: string, stationId: number): Promise<void> {
    const prefs = await this.getUserPreferences(sessionId);
    const currentFavorites = prefs?.favoriteStations || [];
    
    await this.updateUserPreferences(sessionId, {
      favoriteStations: currentFavorites.filter(id => id !== stationId)
    });
  }

  async addVisitedStation(sessionId: string, stationId: number): Promise<void> {
    const prefs = await this.getUserPreferences(sessionId);
    const currentVisited = prefs?.visitedStations || [];
    
    if (!currentVisited.includes(stationId)) {
      await this.updateUserPreferences(sessionId, {
        visitedStations: [...currentVisited, stationId]
      });
    }
  }

  async getPersonalizedRecommendations(sessionId: string, limit = 6): Promise<AttractionWithDetails[]> {
    const prefs = await this.getUserPreferences(sessionId);
    
    if (!prefs || !prefs.preferredCategories || prefs.preferredCategories.length === 0) {
      return this.getRecommendedAttractions(limit);
    }

    const categoryIds = prefs.preferredCategories.map(Number);
    
    const result = await db
      .select({
        id: attractions.id,
        name: attractions.name,
        nameAr: attractions.nameAr,
        description: attractions.description,
        descriptionAr: attractions.descriptionAr,
        stationId: attractions.stationId,
        categoryId: attractions.categoryId,
        rating: attractions.rating,
        walkingTimeFromStation: attractions.walkingTimeFromStation,
        imageUrl: attractions.imageUrl,
        videoUrl: attractions.videoUrl,
        videoDuration: attractions.videoDuration,
        isRecommended: attractions.isRecommended,
        station: {
          id: stations.id,
          name: stations.name,
          nameAr: stations.nameAr,
          lineId: stations.lineId,
          latitude: stations.latitude,
          longitude: stations.longitude,
          walkingTime: stations.walkingTime,
          popularityScore: stations.popularityScore,
          isPopular: stations.isPopular,
          isTrending: stations.isTrending,
          line: {
            id: metroLines.id,
            name: metroLines.name,
            nameAr: metroLines.nameAr,
            color: metroLines.color,
            lineCode: metroLines.lineCode,
          }
        },
        category: {
          id: categories.id,
          name: categories.name,
          nameAr: categories.nameAr,
          icon: categories.icon,
          color: categories.color,
        }
      })
      .from(attractions)
      .leftJoin(stations, eq(attractions.stationId, stations.id))
      .leftJoin(metroLines, eq(stations.lineId, metroLines.id))
      .leftJoin(categories, eq(attractions.categoryId, categories.id))
      .where(inArray(attractions.categoryId, categoryIds))
      .orderBy(desc(attractions.rating))
      .limit(limit);

    return result.map(item => ({
      ...item,
      station: {
        ...item.station!,
        line: item.station!.line!,
      },
      category: item.category!,
    }));
  }

  async getRandomStation(): Promise<StationWithLine | undefined> {
    const [randomStation] = await db
      .select({
        id: stations.id,
        name: stations.name,
        nameAr: stations.nameAr,
        lineId: stations.lineId,
        latitude: stations.latitude,
        longitude: stations.longitude,
        walkingTime: stations.walkingTime,
        popularityScore: stations.popularityScore,
        isPopular: stations.isPopular,
        isTrending: stations.isTrending,
        line: {
          id: metroLines.id,
          name: metroLines.name,
          nameAr: metroLines.nameAr,
          color: metroLines.color,
          lineCode: metroLines.lineCode,
        }
      })
      .from(stations)
      .leftJoin(metroLines, eq(stations.lineId, metroLines.id))
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (!randomStation) return undefined;

    const stationAttractions = await this.getAttractionsByStation(randomStation.id);
    
    return {
      ...randomStation,
      line: randomStation.line!,
      attractions: stationAttractions,
    };
  }
}

export const storage = new DatabaseStorage();
