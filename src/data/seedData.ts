import { Appliance, Ingredient, Household, CoordinationCard, ShoppingItem } from "../types";

export const INITIAL_APPLIANCES: Appliance[] = [
  {
    id: "app-1",
    category: "Kitchen",
    model: "Airfryer XXL Combi 7000",
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80",
    specs: {
      wattage: 2225,
      capacity: "7.3L (1.4kg fries)",
      tempRangeC: "40–200°C",
      presets: ["Fries", "Chicken", "Fish", "Meat", "Veg", "Bake", "Reheat"],
      functions: ["Airfry", "Bake", "Grill", "Roast", "Dehydrate", "Keep Warm"]
    },
    connected: true,
    energy: {
      monthlyKWh: [
        { month: "Feb", kWh: 24.2, costEur: 7.26 },
        { month: "Mar", kWh: 28.5, costEur: 8.55 },
        { month: "Apr", kWh: 22.0, costEur: 6.60 },
        { month: "May", kWh: 26.8, costEur: 8.04 },
        { month: "Jun", kWh: 21.4, costEur: 6.42 },
        { month: "Jul", kWh: 23.5, costEur: 7.05 }
      ],
      estimatedMonthlyCostEur: 7.05,
      avgDailyHours: 0.8,
      peakHourUsagePct: 18,
      energyRating: "A+++ Efficiency"
    },
    lifespan: {
      installationDate: "2024-02-10",
      expectedLifespanYears: 8,
      operatingHours: 680,
      healthScorePct: 94,
      nextMaintenanceDate: "2026-09-15",
      maintenanceHistory: [
        { date: "2025-11-20", task: "Heating element check & deep basket clean", status: "Completed" },
        { date: "2026-04-12", task: "Firmware v2.4 update & sensor recalibration", status: "Completed" }
      ],
      componentHealth: [
        { name: "Heating Element", scorePct: 96, status: "Good" },
        { name: "Convection Fan", scorePct: 92, status: "Good" },
        { name: "Crisper Coating", scorePct: 95, status: "Good" }
      ]
    }
  },
  {
    id: "app-2",
    category: "Coffee",
    model: "Philips Series 5400 LatteGo Espresso",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebe02f2a698?auto=format&fit=crop&w=600&q=80",
    specs: {
      wattage: 1500,
      capacity: "1.8L water tank",
      tempRangeC: "88-96°C brewing",
      presets: ["Espresso", "Coffee", "Cappuccino", "Latte Macchiato", "Iced Coffee"],
      functions: ["Bean-to-cup", "LatteGo milk froth", "Extra shot", "Grind adjustment (12 steps)"]
    },
    connected: true,
    consumables: [
      { name: "Coffee beans", level: 22, daysLeft: 4 }
    ],
    energy: {
      monthlyKWh: [
        { month: "Feb", kWh: 18.5, costEur: 5.55 },
        { month: "Mar", kWh: 19.2, costEur: 5.76 },
        { month: "Apr", kWh: 17.8, costEur: 5.34 },
        { month: "May", kWh: 20.1, costEur: 6.03 },
        { month: "Jun", kWh: 18.0, costEur: 5.40 },
        { month: "Jul", kWh: 19.4, costEur: 5.82 }
      ],
      estimatedMonthlyCostEur: 5.82,
      avgDailyHours: 1.2,
      peakHourUsagePct: 12,
      energyRating: "A+ Efficiency"
    },
    lifespan: {
      installationDate: "2023-10-01",
      expectedLifespanYears: 7,
      operatingHours: 1140,
      healthScorePct: 88,
      nextMaintenanceDate: "2026-08-20",
      maintenanceHistory: [
        { date: "2025-08-10", task: "AquaClean Filter replaced", status: "Completed" },
        { date: "2026-01-15", task: "Brew group lubrication & descaling", status: "Completed" }
      ],
      componentHealth: [
        { name: "Ceramic Grinder", scorePct: 91, status: "Good" },
        { name: "Thermoblock Boiler", scorePct: 86, status: "Good" },
        { name: "AquaClean Filter", scorePct: 22, status: "Replace Soon" }
      ]
    }
  },
  {
    id: "app-3",
    category: "Climate Care",
    model: "Air Purifier Series 3000i",
    imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80",
    specs: {
      wattage: 60,
      capacity: "520 m³/h CADR",
      tempRangeC: "Room ambient",
      presets: ["Auto", "Sleep", "Turbo", "Allergen Mode"],
      functions: ["NanoProtect HEPA", "AeraSense PM2.5 monitoring", "Silent sleep mode"]
    },
    connected: true,
    consumables: [
      { name: "HEPA filter", level: 65, daysLeft: 90 }
    ],
    energy: {
      monthlyKWh: [
        { month: "Feb", kWh: 31.0, costEur: 9.30 },
        { month: "Mar", kWh: 29.5, costEur: 8.85 },
        { month: "Apr", kWh: 28.2, costEur: 8.46 },
        { month: "May", kWh: 34.0, costEur: 10.20 },
        { month: "Jun", kWh: 38.5, costEur: 11.55 },
        { month: "Jul", kWh: 36.2, costEur: 10.86 }
      ],
      estimatedMonthlyCostEur: 10.86,
      avgDailyHours: 18.0,
      peakHourUsagePct: 8,
      energyRating: "Ultra-low Standby Eco"
    },
    lifespan: {
      installationDate: "2023-05-15",
      expectedLifespanYears: 10,
      operatingHours: 9800,
      healthScorePct: 91,
      nextMaintenanceDate: "2026-11-01",
      maintenanceHistory: [
        { date: "2025-05-10", task: "AeraSense optical sensor clean", status: "Completed" },
        { date: "2026-02-01", task: "Pre-filter vacuum clean", status: "Completed" }
      ],
      componentHealth: [
        { name: "Inverter Fan Motor", scorePct: 95, status: "Good" },
        { name: "HEPA Layer Filter", scorePct: 65, status: "Good" },
        { name: "PM2.5 Laser Sensor", scorePct: 90, status: "Good" }
      ]
    }
  },
  {
    id: "app-4",
    category: "Garment Care",
    model: "7000 Series Handheld Garment Steamer",
    imageUrl: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80",
    specs: {
      wattage: 1600,
      capacity: "230ml detachable tank",
      tempRangeC: "140–160°C continuous steam",
      presets: ["Silk", "Synthetics", "Cotton", "Linen"],
      functions: ["OptimalTEMP technology (no burns)", "Continuous steam 28g/min", "Adjustable head"]
    },
    connected: true,
    energy: {
      monthlyKWh: [
        { month: "Feb", kWh: 6.2, costEur: 1.86 },
        { month: "Mar", kWh: 7.0, costEur: 2.10 },
        { month: "Apr", kWh: 5.8, costEur: 1.74 },
        { month: "May", kWh: 6.5, costEur: 1.95 },
        { month: "Jun", kWh: 8.1, costEur: 2.43 },
        { month: "Jul", kWh: 7.4, costEur: 2.22 }
      ],
      estimatedMonthlyCostEur: 2.22,
      avgDailyHours: 0.25,
      peakHourUsagePct: 25,
      energyRating: "A+ Quick Heat"
    },
    lifespan: {
      installationDate: "2024-01-20",
      expectedLifespanYears: 6,
      operatingHours: 120,
      healthScorePct: 97,
      nextMaintenanceDate: "2026-12-01",
      maintenanceHistory: [
        { date: "2025-07-15", task: "De-calc water flush", status: "Completed" }
      ],
      componentHealth: [
        { name: "Steam Pump", scorePct: 98, status: "Good" },
        { name: "OptimalTEMP Plate", scorePct: 96, status: "Good" }
      ]
    }
  },
  {
    id: "app-5",
    category: "Floor Care",
    model: "AquaTrio Cordless Wet & Dry Vacuum 9000",
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
    specs: {
      wattage: 25,
      capacity: "450ml clean water tank",
      tempRangeC: "Ambient",
      presets: ["Auto Eco", "Turbo Wet", "Dry Suction Only"],
      functions: ["Self-cleaning station", "High-speed counter-rotating brushes", "LED nozzle"]
    },
    connected: true,
    consumables: [
      { name: "Battery health", level: 78, daysLeft: 300 }
    ],
    energy: {
      monthlyKWh: [
        { month: "Feb", kWh: 4.8, costEur: 1.44 },
        { month: "Mar", kWh: 5.2, costEur: 1.56 },
        { month: "Apr", kWh: 4.5, costEur: 1.35 },
        { month: "May", kWh: 5.8, costEur: 1.74 },
        { month: "Jun", kWh: 6.1, costEur: 1.83 },
        { month: "Jul", kWh: 5.5, costEur: 1.65 }
      ],
      estimatedMonthlyCostEur: 1.65,
      avgDailyHours: 0.5,
      peakHourUsagePct: 10,
      energyRating: "Li-Ion Smart Eco Charge"
    },
    lifespan: {
      installationDate: "2024-04-01",
      expectedLifespanYears: 5,
      operatingHours: 180,
      healthScorePct: 92,
      nextMaintenanceDate: "2026-08-30",
      maintenanceHistory: [
        { date: "2025-10-10", task: "Counter-rotating microfiber brushes replaced", status: "Completed" }
      ],
      componentHealth: [
        { name: "25.2V Li-Ion Battery", scorePct: 78, status: "Good" },
        { name: "Wet Suction Motor", scorePct: 95, status: "Good" },
        { name: "Microfiber Brushes", scorePct: 88, status: "Good" }
      ]
    }
  }
];

export const INITIAL_HOUSEHOLD: Household = {
  members: 2,
  dietaryPrefs: ["dairy-free"],
  offPeakWindow: "23:00-06:00"
};

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: "ing-1", name: "Salmon fillets", location: "Fridge", quantity: "2 portions", expiryDate: "Expiring in 2 days", useSoon: true },
  { id: "ing-2", name: "Almond milk", location: "Fridge", quantity: "1 Liter", expiryDate: "Fresh (6 days)" },
  { id: "ing-3", name: "Baby spinach", location: "Fridge", quantity: "1 bag (200g)", expiryDate: "Expiring tomorrow", useSoon: true },
  { id: "ing-4", name: "Extra virgin olive oil", location: "Pantry", quantity: "500ml bottle" },
  { id: "ing-5", name: "Arabica coffee beans", location: "Pantry", quantity: "250g bag" },
  { id: "ing-6", name: "Jasmine rice", location: "Pantry", quantity: "1 kg" },
  { id: "ing-7", name: "Organic frozen berries", location: "Freezer", quantity: "500g pack" }
];

export const INITIAL_STANDING_CARDS: CoordinationCard[] = [
  {
    id: "card-stand-1",
    title: "Coffee beans ~4 days left",
    category: "Coffee & Pantry",
    explanation: "Consumable level is at 22%. Reorder now to avoid missing your morning brew.",
    action: { label: "Reorder Coffee Beans", type: "reorder" },
    status: "pending",
    isStanding: true
  },
  {
    id: "card-stand-2",
    title: "Vacuum battery at 78% — healthy",
    category: "Floor Care",
    explanation: "Optimal charge lifecycle. Scheduled maintenance check recommended next month.",
    action: { label: "Schedule Maintenance", type: "schedule" },
    status: "pending",
    isStanding: true
  }
];

export const INITIAL_SHOPPING: ShoppingItem[] = [
  { id: "shop-1", name: "Oat milk (Barista Blend)", addedFrom: "System suggestion" }
];

export const AVAILABLE_CATALOG_MODELS: Record<string, { model: string; specs: any }[]> = {
  Kitchen: [
    {
      model: "Airfryer XXL Combi 7000",
      specs: { wattage: 2225, capacity: "7.3L", tempRangeC: "40–200°C", presets: ["Fries", "Chicken", "Fish", "Meat", "Veg", "Bake"], functions: ["Airfry", "Bake", "Grill", "Roast"] }
    },
    {
      model: "Airfryer Compact 3000",
      specs: { wattage: 1400, capacity: "4.1L", tempRangeC: "80–200°C", presets: ["Fries", "Snacks", "Cake"], functions: ["Airfry", "Reheat"] }
    },
    {
      model: "Multi-Cooker All-in-One",
      specs: { wattage: 1000, capacity: "6.0L", tempRangeC: "40–160°C", presets: ["Pressure cook", "Slow cook", "Saute", "Steam", "Yogurt"], functions: ["Dual pressure valve", "Keep warm"] }
    }
  ],
  Coffee: [
    {
      model: "Philips Series 5400 LatteGo Espresso",
      specs: { wattage: 1500, capacity: "1.8L water", tempRangeC: "88-96°C", presets: ["Espresso", "Coffee", "Cappuccino", "Latte Macchiato"], functions: ["Bean-to-cup", "LatteGo milk"] }
    },
    {
      model: "Philips Series 3200 LatteGo Espresso",
      specs: { wattage: 1500, capacity: "1.8L water", tempRangeC: "88-96°C", presets: ["Espresso", "Coffee", "Cappuccino"], functions: ["LatteGo milk"] }
    },
    {
      model: "Philips Drip Filter Machine 7000",
      specs: { wattage: 1000, capacity: "1.2L glass jug", tempRangeC: "92-96°C", presets: ["Intense Brew", "Timer Start"], functions: ["Aroma twister"] }
    }
  ],
  "Climate Care": [
    {
      model: "Air Purifier Series 3000i",
      specs: { wattage: 60, capacity: "520 m³/h CADR", tempRangeC: "Ambient", presets: ["Auto", "Sleep", "Turbo", "Allergen"], functions: ["NanoProtect HEPA", "AeraSense PM2.5"] }
    },
    {
      model: "2-in-1 Air Dehumidifier & Purifier Series 5000",
      specs: { wattage: 350, capacity: "25L/day dehumidification", tempRangeC: "5-35°C", presets: ["Auto Dry", "Laundry Dry", "Purifier Only"], functions: ["HEPA filter", "Humidity sensor"] }
    }
  ],
  "Garment Care": [
    {
      model: "7000 Series Handheld Garment Steamer",
      specs: { wattage: 1600, capacity: "230ml tank", tempRangeC: "140-160°C", presets: ["Silk", "Synthetics", "Cotton", "Linen"], functions: ["OptimalTEMP", "Continuous steam"] }
    },
    {
      model: "PerfectCare 8000 Series Steam Generator Iron",
      specs: { wattage: 2700, capacity: "1.8L tank", tempRangeC: "OptimalTEMP auto", presets: ["Auto steam sensor", "Vertical steam"], functions: ["SteamGlide Elite", "No burns guaranteed"] }
    }
  ],
  "Floor Care": [
    {
      model: "AquaTrio Cordless Wet & Dry Vacuum 9000",
      specs: { wattage: 25, capacity: "450ml clean water tank", tempRangeC: "Ambient", presets: ["Auto Eco", "Turbo Wet", "Dry Suction"], functions: ["Self-cleaning station", "Counter-rotating brushes"] }
    },
    {
      model: "HomeRun Robot Vacuum & Mop 7000",
      specs: { wattage: 36, capacity: "AquaStation self-empty", tempRangeC: "Ambient", presets: ["Dry Vacuum", "Wet Mop", "Vacuum + Mop"], functions: ["LiDAR navigation", "360 obstacle detection"] }
    }
  ]
};
