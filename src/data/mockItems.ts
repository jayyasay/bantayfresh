export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  daysLeft: number;
};

export const MOCK_ITEMS: InventoryItem[] = [
  { id: "BF-1001", name: "Romaine Lettuce", category: "Leafy Greens", daysLeft: 1 },
  { id: "BF-1002", name: "Cherry Tomatoes", category: "Produce", daysLeft: 2 },
  { id: "BF-1003", name: "Fresh Basil", category: "Herbs", daysLeft: 4 },
  { id: "BF-1004", name: "Strawberries", category: "Fruit", daysLeft: 1 },
  { id: "BF-1005", name: "Greek Yogurt", category: "Dairy", daysLeft: 6 },
  { id: "BF-1006", name: "Spinach", category: "Leafy Greens", daysLeft: 3 },
];
