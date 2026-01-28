import { create } from 'zustand';
import { UserProfile, Store, Notification, InventoryFilters } from '@/types';

interface AppState {
  // User state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  
  // Store state
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  stores: Store[];
  setStores: (stores: Store[]) => void;
  
  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
  
  // Inventory filters
  filters: InventoryFilters;
  setFilters: (filters: Partial<InventoryFilters>) => void;
  resetFilters: () => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const defaultFilters: InventoryFilters = {
  search: '',
  marketing_status: [],
  order_control: [],
  min_days_aging: null,
  max_days_aging: null,
  min_quantity: null,
  max_quantity: null,
  store_id: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),
  
  // Store
  currentStore: null,
  setCurrentStore: (store) => set({ currentStore: store }),
  stores: [],
  setStores: (stores) => set({ stores }),
  
  // Notifications
  notifications: [],
  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.is_read).length 
  }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  unreadCount: 0,
  
  // Filters
  filters: defaultFilters,
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  resetFilters: () => set({ filters: defaultFilters }),
  
  // UI
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
