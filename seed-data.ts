import { db } from "./db";
import { metroLines, stations, categories, attractions } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data
    await db.delete(attractions);
    await db.delete(stations);
    await db.delete(categories);
    await db.delete(metroLines);

    // Insert Metro Lines
    const insertedLines = await db.insert(metroLines).values([
      {
        name: "Blue Line",
        nameAr: "المسار الأزرق",
        color: "#0066CC",
        lineCode: "blue"
      },
      {
        name: "Red Line", 
        nameAr: "المسار الأحمر",
        color: "#E31837",
        lineCode: "red"
      },
      {
        name: "Orange Line",
        nameAr: "المسار البرتقالي", 
        color: "#FF6B35",
        lineCode: "orange"
      },
      {
        name: "Yellow Line",
        nameAr: "المسار الأصفر",
        color: "#FFD23F", 
        lineCode: "yellow"
      },
      {
        name: "Green Line",
        nameAr: "المسار الأخضر",
        color: "#00B04F",
        lineCode: "green"
      },
      {
        name: "Purple Line",
        nameAr: "المسار البنفسجي",
        color: "#8B5CF6",
        lineCode: "purple"
      }
    ]).returning();

    console.log(`Inserted ${insertedLines.length} metro lines`);

    // Insert Categories
    const insertedCategories = await db.insert(categories).values([
      {
        name: "Restaurants",
        nameAr: "مطاعم",
        icon: "🍽️",
        color: "#FF6B35"
      },
      {
        name: "Cafes",
        nameAr: "مقاهي", 
        icon: "☕",
        color: "#8B4513"
      },
      {
        name: "Shopping Malls",
        nameAr: "مراكز تسوق",
        icon: "🛍️",
        color: "#9D4EDD"
      },
      {
        name: "Parks",
        nameAr: "حدائق",
        icon: "🌳",
        color: "#00B04F"
      },
      {
        name: "Cultural Sites",
        nameAr: "مواقع ثقافية",
        icon: "🏛️", 
        color: "#FFD60A"
      },
      {
        name: "Medical Centers",
        nameAr: "مراكز طبية",
        icon: "🏥",
        color: "#E31837"
      },
      {
        name: "Historical Sites",
        nameAr: "مواقع تاريخية",
        icon: "🏰",
        color: "#6F4E37"
      },
      {
        name: "Museums",
        nameAr: "متاحف",
        icon: "🖼️",
        color: "#003566"
      }
    ]).returning();

    console.log(`Inserted ${insertedCategories.length} categories`);

    // Insert Blue Line Stations
    const blueLineStations = await db.insert(stations).values([
      {
        name: "First Bank",
        nameAr: "بنك الأول",
        lineId: insertedLines[0].id,
        popularityScore: 15,
        isPopular: false,
        isTrending: false,
        walkingTime: 3
      },
      {
        name: "Dr. Sulaiman Al Habib",
        nameAr: "د.سليمان الحبيب", 
        lineId: insertedLines[0].id,
        popularityScore: 29,
        isPopular: true,
        isTrending: true,
        walkingTime: 4
      },
      {
        name: "Financial District",
        nameAr: "المركز المالي",
        lineId: insertedLines[0].id,
        popularityScore: 17,
        isPopular: false,
        isTrending: true,
        walkingTime: 2
      },
      {
        name: "Al Muruj",
        nameAr: "المروج",
        lineId: insertedLines[0].id,
        popularityScore: 24,
        isPopular: true,
        isTrending: true,
        walkingTime: 5
      },
      {
        name: "King Fahd District",
        nameAr: "حي الملك فهد",
        lineId: insertedLines[0].id,
        popularityScore: 20,
        isPopular: true,
        isTrending: true,
        walkingTime: 3
      },
      {
        name: "King Fahd District 2",
        nameAr: "حي الملك فهد 2",
        lineId: insertedLines[0].id,
        popularityScore: 16,
        isPopular: false,
        isTrending: true,
        walkingTime: 4
      },
      {
        name: "Saudi Telecom Company",
        nameAr: "الاتصالات السعودية",
        lineId: insertedLines[0].id,
        popularityScore: 8,
        isPopular: true,
        isTrending: true,
        walkingTime: 2
      },
      {
        name: "Al Wurud 2",
        nameAr: "الورود 2",
        lineId: insertedLines[0].id,
        popularityScore: 13,
        isPopular: false,
        isTrending: true,
        walkingTime: 6
      },
      {
        name: "Al Urubah",
        nameAr: "العروبة",
        lineId: insertedLines[0].id,
        popularityScore: 26,
        isPopular: true,
        isTrending: true,
        walkingTime: 3
      },
      {
        name: "Alinma Bank",
        nameAr: "مصرف الإنماء",
        lineId: insertedLines[0].id,
        popularityScore: 24,
        isPopular: true,
        isTrending: true,
        walkingTime: 2
      }
    ]).returning();

    // Insert Red Line Stations
    const redLineStations = await db.insert(stations).values([
      {
        name: "King Saud University",
        nameAr: "جامعة الملك سعود",
        lineId: insertedLines[1].id,
        popularityScore: 13,
        isPopular: false,
        isTrending: true,
        walkingTime: 8
      },
      {
        name: "King Salman Oasis",
        nameAr: "واحة الملك سلمان",
        lineId: insertedLines[1].id,
        popularityScore: 4,
        isPopular: false,
        isTrending: false,
        walkingTime: 12
      },
      {
        name: "Technology City",
        nameAr: "المدينة التقنية",
        lineId: insertedLines[1].id,
        popularityScore: 21,
        isPopular: true,
        isTrending: true,
        walkingTime: 5
      },
      {
        name: "Specialist Hospital",
        nameAr: "التخصصي",
        lineId: insertedLines[1].id,
        popularityScore: 24,
        isPopular: true,
        isTrending: true,
        walkingTime: 3
      },
      {
        name: "Al Wurud",
        nameAr: "الورود",
        lineId: insertedLines[1].id,
        popularityScore: 19,
        isPopular: false,
        isTrending: true,
        walkingTime: 4
      }
    ]).returning();

    // Insert Orange Line Stations  
    const orangeLineStations = await db.insert(stations).values([
      {
        name: "Jeddah Road",
        nameAr: "طريق جدة",
        lineId: insertedLines[2].id,
        popularityScore: 1,
        isPopular: false,
        isTrending: false,
        walkingTime: 15
      },
      {
        name: "Tuwaiq",
        nameAr: "طويق",
        lineId: insertedLines[2].id,
        popularityScore: 7,
        isPopular: false,
        isTrending: false,
        walkingTime: 10
      },
      {
        name: "Al Doha",
        nameAr: "الدوح",
        lineId: insertedLines[2].id,
        popularityScore: 15,
        isPopular: true,
        isTrending: true,
        walkingTime: 6
      },
      {
        name: "Western Station",
        nameAr: "المحطة الغربية",
        lineId: insertedLines[2].id,
        popularityScore: 18,
        isPopular: false,
        isTrending: false,
        walkingTime: 8
      },
      {
        name: "Al Jaradiyah",
        nameAr: "الجرادية",
        lineId: insertedLines[2].id,
        popularityScore: 12,
        isPopular: false,
        isTrending: true,
        walkingTime: 7
      }
    ]).returning();

    console.log(`Inserted ${blueLineStations.length + redLineStations.length + orangeLineStations.length} stations`);

    // Insert Attractions
    const attractionsData = [
      // Blue Line - Dr. Sulaiman Al Habib attractions
      {
        name: "Kingdom Centre Tower",
        nameAr: "برج المملكة",
        description: "Iconic skyscraper with shopping and dining",
        descriptionAr: "ناطحة سحاب شهيرة مع التسوق والمطاعم",
        stationId: blueLineStations[1].id,
        categoryId: insertedCategories[2].id, // Shopping Malls
        rating: "4.8",
        walkingTimeFromStation: 3,
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        videoDuration: "2:30",
        isRecommended: true
      },
      {
        name: "Al Faisaliah Centre",
        nameAr: "مركز الفيصلية",
        description: "Luxury shopping and fine dining destination",
        descriptionAr: "وجهة تسوق فاخرة ومطاعم راقية",
        stationId: blueLineStations[1].id,
        categoryId: insertedCategories[0].id, // Restaurants
        rating: "4.6",
        walkingTimeFromStation: 5,
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        videoDuration: "1:45",
        isRecommended: true
      },
      // Blue Line - Al Muruj attractions
      {
        name: "Riyadh Gallery Mall",
        nameAr: "الرياض غاليري مول",
        description: "Modern shopping center with international brands",
        descriptionAr: "مركز تسوق حديث مع علامات تجارية عالمية",
        stationId: blueLineStations[3].id,
        categoryId: insertedCategories[2].id, // Shopping Malls
        rating: "4.5",
        walkingTimeFromStation: 2,
        imageUrl: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isRecommended: true
      },
      {
        name: "Starbucks Al Muruj",
        nameAr: "ستاربكس المروج",
        description: "Popular coffee chain with cozy atmosphere",
        descriptionAr: "سلسلة قهوة شهيرة بأجواء مريحة",
        stationId: blueLineStations[3].id,
        categoryId: insertedCategories[1].id, // Cafes
        rating: "4.3",
        walkingTimeFromStation: 4,
        imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isRecommended: false
      },
      // Red Line - Technology City attractions
      {
        name: "King Abdulaziz City for Science",
        nameAr: "مدينة الملك عبدالعزيز للعلوم",
        description: "Premier science and technology research hub",
        descriptionAr: "مركز رائد للبحوث العلمية والتقنية",
        stationId: redLineStations[2].id,
        categoryId: insertedCategories[4].id, // Cultural Sites
        rating: "4.7",
        walkingTimeFromStation: 3,
        imageUrl: "https://images.unsplash.com/photo-1559113398-c3b9c2db7ec9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        videoDuration: "3:15",
        isRecommended: true
      },
      // Red Line - Specialist Hospital attractions  
      {
        name: "Al Olaya District",
        nameAr: "حي العليا",
        description: "Business district with restaurants and cafes",
        descriptionAr: "منطقة أعمال مع مطاعم ومقاهي",
        stationId: redLineStations[3].id,
        categoryId: insertedCategories[0].id, // Restaurants
        rating: "4.4",
        walkingTimeFromStation: 2,
        imageUrl: "https://images.unsplash.com/photo-1552566618-ddd4748f053e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isRecommended: true
      },
      // Orange Line - Al Doha attractions
      {
        name: "Al Rajhi Grand Mosque",
        nameAr: "جامع الراجحي الكبير",
        description: "Beautiful mosque with Islamic architecture",
        descriptionAr: "مسجد جميل بعمارة إسلامية",
        stationId: orangeLineStations[2].id,
        categoryId: insertedCategories[4].id, // Cultural Sites
        rating: "4.9",
        walkingTimeFromStation: 1,
        imageUrl: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isRecommended: true
      }
    ];

    const insertedAttractions = await db.insert(attractions).values(attractionsData).returning();
    console.log(`Inserted ${insertedAttractions.length} attractions`);

    console.log("Database seeding completed successfully!");
    return {
      lines: insertedLines.length,
      stations: blueLineStations.length + redLineStations.length + orangeLineStations.length,
      categories: insertedCategories.length,
      attractions: insertedAttractions.length
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding
seedDatabase()
  .then((result) => {
    console.log("Seeding completed:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });