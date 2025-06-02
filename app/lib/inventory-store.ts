// In-memory store for inventory items (temporary solution)
// In production, this would be replaced with a real database
export const inventoryStore = new Map<string, any[]>(); 