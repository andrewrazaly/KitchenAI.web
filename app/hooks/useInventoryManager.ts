import { useReducer, useCallback, useEffect } from 'react';
import { useNotification } from '../components/Notification';
import { trackEvent } from '../components/GoogleAnalytics';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  purchaseDate: string;
  location: string;
  status: 'fresh' | 'expiring' | 'expired';
  image?: string;
}

interface InventoryState {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  selectedStatus: string;
  showAddForm: boolean;
  showEditModal: boolean;
  showBulkImport: boolean;
  editingItem: InventoryItem | null;
}

type InventoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: InventoryItem[] }
  | { type: 'SET_FILTERED_ITEMS'; payload: InventoryItem[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'SET_SELECTED_STATUS'; payload: string }
  | { type: 'TOGGLE_ADD_FORM' }
  | { type: 'TOGGLE_EDIT_MODAL' }
  | { type: 'TOGGLE_BULK_IMPORT' }
  | { type: 'SET_EDITING_ITEM'; payload: InventoryItem | null }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'CLEAR_FILTERS' };

const initialState: InventoryState = {
  items: [],
  filteredItems: [],
  isLoading: true,
  searchQuery: '',
  selectedCategory: 'all',
  selectedStatus: 'all',
  showAddForm: false,
  showEditModal: false,
  showBulkImport: false,
  editingItem: null,
};

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    
    case 'SET_FILTERED_ITEMS':
      return { ...state, filteredItems: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    
    case 'SET_SELECTED_STATUS':
      return { ...state, selectedStatus: action.payload };
    
    case 'TOGGLE_ADD_FORM':
      return { ...state, showAddForm: !state.showAddForm };
    
    case 'TOGGLE_EDIT_MODAL':
      return { ...state, showEditModal: !state.showEditModal };
    
    case 'TOGGLE_BULK_IMPORT':
      return { ...state, showBulkImport: !state.showBulkImport };
    
    case 'SET_EDITING_ITEM':
      return { ...state, editingItem: action.payload };
    
    case 'ADD_ITEM':
      const newItems = [...state.items, action.payload];
      return { ...state, items: newItems, showAddForm: false };
    
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id ? action.payload : item
      );
      return { 
        ...state, 
        items: updatedItems, 
        showEditModal: false, 
        editingItem: null 
      };
    
    case 'DELETE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return { ...state, items: filteredItems };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        searchQuery: '',
        selectedCategory: 'all',
        selectedStatus: 'all',
      };
    
    default:
      return state;
  }
}

export function useInventoryManager() {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const { showNotification } = useNotification();

  // Filter items based on search and filters
  const applyFilters = useCallback(() => {
    let filtered = state.items;

    // Apply search filter
    if (state.searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === state.selectedCategory);
    }

    // Apply status filter
    if (state.selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === state.selectedStatus);
    }

    dispatch({ type: 'SET_FILTERED_ITEMS', payload: filtered });
  }, [state.items, state.searchQuery, state.selectedCategory, state.selectedStatus]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Actions
  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setItems: (items: InventoryItem[]) => dispatch({ type: 'SET_ITEMS', payload: items }),
    setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    setSelectedCategory: (category: string) => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category }),
    setSelectedStatus: (status: string) => dispatch({ type: 'SET_SELECTED_STATUS', payload: status }),
    toggleAddForm: () => dispatch({ type: 'TOGGLE_ADD_FORM' }),
    toggleEditModal: () => dispatch({ type: 'TOGGLE_EDIT_MODAL' }),
    toggleBulkImport: () => dispatch({ type: 'TOGGLE_BULK_IMPORT' }),
    setEditingItem: (item: InventoryItem | null) => dispatch({ type: 'SET_EDITING_ITEM', payload: item }),
    clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' }),

    addItem: async (itemData: Omit<InventoryItem, 'id' | 'status'>) => {
      try {
        const newItem: InventoryItem = {
          ...itemData,
          id: Date.now().toString(),
          status: 'fresh' as const,
        };

        dispatch({ type: 'ADD_ITEM', payload: newItem });
        showNotification('Item added successfully!', 'success');
        trackEvent('inventory_item_added', 'inventory', itemData.category);
      } catch (error) {
        showNotification('Failed to add item', 'error');
      }
    },

    updateItem: async (updatedItem: InventoryItem) => {
      try {
        dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
        showNotification('Item updated successfully!', 'success');
        trackEvent('inventory_item_updated', 'inventory', updatedItem.category);
      } catch (error) {
        showNotification('Failed to update item', 'error');
      }
    },

    deleteItem: async (itemId: string) => {
      try {
        dispatch({ type: 'DELETE_ITEM', payload: itemId });
        showNotification('Item deleted successfully!', 'success');
        trackEvent('inventory_item_deleted', 'inventory');
      } catch (error) {
        showNotification('Failed to delete item', 'error');
      }
    },

    editItem: (item: InventoryItem) => {
      dispatch({ type: 'SET_EDITING_ITEM', payload: item });
      dispatch({ type: 'TOGGLE_EDIT_MODAL' });
    },
  };

  return {
    state,
    actions,
  };
} 