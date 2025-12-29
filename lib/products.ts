// Products and add-ons configuration

export const T_SHIRT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"] as const;
export type TShirtSize = (typeof T_SHIRT_SIZES)[number];

export const T_SHIRT_COLORS = [
  { id: "royal", label: "Royal (Navy)" },
  { id: "olive", label: "Olive (Green)" },
  { id: "beige", label: "Beige (Sand)" },
] as const;
export type TShirtColor = (typeof T_SHIRT_COLORS)[number]["id"];

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "Other (International)"
] as const;

export const DIETARY_OPTIONS = [
  { id: "poultry", label: "Poultry" },
  { id: "beef", label: "Beef" },
  { id: "vegetarian", label: "Vegetarian" },
] as const;
export type DietaryOption = (typeof DIETARY_OPTIONS)[number]["id"];

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  maxQuantity?: number;
  requiresDetails?: "tshirt";
}

export const ADD_ONS: AddOn[] = [
  {
    id: "dinner-adult",
    name: "Extra Dinner Ticket (Adult)",
    description: "Kol Israel Dinner on July 10th",
    price: 6500, // $65.00
    maxQuantity: 10,
  },
  {
    id: "dinner-child",
    name: "Extra Dinner Ticket (Child)",
    description: "Children under 12 - July 10th dinner",
    price: 1700, // $17.00
    maxQuantity: 10,
  },
  {
    id: "lunch",
    name: "Extra Boxed Lunch",
    description: "Boxed lunch on July 11th (Shabbat)",
    price: 3000, // $30.00
    maxQuantity: 10,
  },
  {
    id: "tshirt",
    name: "Extra T-Shirt",
    description: "Conference t-shirt - select size & color",
    price: 2100, // $21.00
    maxQuantity: 10,
    requiresDetails: "tshirt",
  },
];

export interface TShirtSelection {
  size: TShirtSize;
  color: TShirtColor;
}

export interface RegistrationData {
  // Step 1: Contact Info
  firstName: string;
  familyName: string;
  email: string;
  phone: string;
  state: string;

  // Step 2: Products
  // Base registration always included (uses pricing from lib/pricing.ts)
  addOns: Record<string, number>; // addon id -> quantity

  // Step 3: T-shirt details
  // Index 0 is the included t-shirt, rest are extras
  tshirts: TShirtSelection[];

  // Step 4: Dietary
  dietaryPreference: DietaryOption;
  allergies: string;

  // Access code (if early access period)
  accessCode?: string;
}

export function calculateTotal(
  basePrice: number,
  addOns: Record<string, number>
): number {
  let total = basePrice;

  for (const addon of ADD_ONS) {
    const qty = addOns[addon.id] || 0;
    total += addon.price * qty;
  }

  return total;
}

export function getTShirtCount(addOns: Record<string, number>): number {
  // 1 included with registration + extras
  return 1 + (addOns["tshirt"] || 0);
}
