// In-memory store for inventory items (temporary solution)
// In production, this would be replaced with a real database
export const inventoryStore = new Map<string, any[]>();

// Initialize with some sample data for development
const initializeStore = () => {
  const userId = 'dev-user';
  if (!inventoryStore.has(userId)) {
    const sampleItems = [
      {
        id: 'sample-1',
        name: 'Sample Milk',
        category: 'Dairy',
        quantity: 1,
        unit: 'gallon',
        expiry_date: '2024-02-15',
        purchase_date: '2024-02-08',
        location: 'Refrigerator',
        user_id: userId,
        created_at: new Date().toISOString()
      },
      {
        id: 'sample-2',
        name: 'Sample Bread',
        category: 'Bakery',
        quantity: 1,
        unit: 'loaf',
        expiry_date: '2024-02-20',
        purchase_date: '2024-02-10',
        location: 'Pantry',
        user_id: userId,
        created_at: new Date().toISOString()
      }
    ];
    inventoryStore.set(userId, sampleItems);
  }
};

// Initialize the store
initializeStore(); 