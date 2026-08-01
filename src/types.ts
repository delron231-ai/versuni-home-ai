export type Category = "Kitchen" | "Coffee" | "Climate Care" | "Garment Care" | "Floor Care";

export interface Consumable {
  name: string;
  level: number; // 0 - 100
  daysLeft?: number;
}

export interface ApplianceSpecs {
  wattage?: number;
  capacity?: string;
  tempRangeC?: string;
  presets?: string[];
  functions?: string[];
  [key: string]: any;
}

export interface MaintenanceRecord {
  date: string;
  task: string;
  status: "Completed" | "Pending" | "Scheduled";
}

export interface EnergyData {
  monthlyKWh: { month: string; kWh: number; costEur: number }[];
  estimatedMonthlyCostEur: number;
  avgDailyHours: number;
  peakHourUsagePct: number;
  energyRating: string;
}

export interface ApplianceLifespan {
  installationDate: string;
  expectedLifespanYears: number;
  operatingHours: number;
  healthScorePct: number;
  nextMaintenanceDate: string;
  maintenanceHistory: MaintenanceRecord[];
  componentHealth: { name: string; scorePct: number; status: "Good" | "Needs Attention" | "Replace Soon" }[];
}

export interface Appliance {
  id: string;
  category: Category;
  model: string;
  imageUrl?: string;
  specs: ApplianceSpecs;
  connected: boolean;
  consumables?: Consumable[];
  energy?: EnergyData;
  lifespan?: ApplianceLifespan;
}

export type StorageLocation = "Fridge" | "Pantry" | "Freezer";

export interface Ingredient {
  id: string;
  name: string;
  location: StorageLocation;
  quantity: string;
  expiryDate?: string;
  useSoon?: boolean;
}

export interface Household {
  members: number;
  dietaryPrefs: string[];
  offPeakWindow: string; // e.g. "23:00-06:00"
}

export interface Recipe {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  category: "Airfryer" | "Coffee" | "Baking" | "Quick Meals" | "Healthy" | "Breakfast";
  bookId?: string;
  prepTimeMin: number;
  cookTimeMin: number;
  servings: number;
  caloriesKcal?: number;
  difficulty: "Easy" | "Medium" | "Chef";
  rating: number;
  reviewCount: number;
  targetApplianceCategory: Category;
  suggestedApplianceModel: string;
  applianceSettings: {
    preset: string;
    tempC?: number;
    timeMin: number;
    midCookAction?: string;
  };
  ingredients: { name: string; amount: string; have?: boolean }[];
  steps: { stepNumber: number; instruction: string; tip?: string }[];
  tags: string[];
}

export interface RecipeBook {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  author: string;
  recipeCount: number;
  category: string;
  description: string;
  featuredRecipes: Recipe[];
}

export interface SavedRecipe {
  id: string;
  dish: string;
  ingredients: { name: string; have: boolean }[];
  steps: string[];
  applianceSettings: {
    preset?: string;
    tempC?: number;
    timeMin?: number;
    midCookAction?: string;
  };
  appliedAppliance: string;
  savedAt?: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  addedFrom?: string;
}

export type ActionType = "approve" | "schedule" | "reorder";

export interface CoordinationAction {
  label: string;
  type: ActionType;
}

export type CardStatus = "pending" | "active" | "scheduled" | "dismissed";

export interface CoordinationCard {
  id: string;
  title: string;
  category: string;
  explanation: string;
  action: CoordinationAction;
  status: CardStatus;
  scheduledTime?: string;
  activeUntil?: string;
  isStanding?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  ts: number;
}

export interface CareRoutineResult {
  category: Category;
  applianceModel: string;
  title: string;
  details: Record<string, string | number | string[]>;
  summary: string;
  instructions: string[];
}
