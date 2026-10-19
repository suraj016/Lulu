import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastState = {
  id: string;
  message: string;
  action?: 'open-cart';
} | null;

export type UiState = {
  cartOpen: boolean;
  searchOpen: boolean;
  accountOpen: boolean;
  mobileNavOpen: boolean;
  toast: ToastState;
};

const initialState: UiState = {
  cartOpen: false,
  searchOpen: false,
  accountOpen: false,
  mobileNavOpen: false,
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCart(state) {
      state.cartOpen = true;
      state.mobileNavOpen = false;
    },
    closeCart(state) {
      state.cartOpen = false;
    },
    toggleCart(state) {
      state.cartOpen = !state.cartOpen;
    },
    openSearch(state) {
      state.searchOpen = true;
      state.mobileNavOpen = false;
    },
    closeSearch(state) {
      state.searchOpen = false;
    },
    openAccount(state) {
      state.accountOpen = true;
      state.mobileNavOpen = false;
    },
    closeAccount(state) {
      state.accountOpen = false;
    },
    openMobileNav(state) {
      state.mobileNavOpen = true;
    },
    closeMobileNav(state) {
      state.mobileNavOpen = false;
    },
    showToast(
      state,
      action: PayloadAction<{ message: string; action?: 'open-cart' }>,
    ) {
      state.toast = {
        id: `${Date.now()}`,
        message: action.payload.message,
        action: action.payload.action,
      };
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  openSearch,
  closeSearch,
  openAccount,
  closeAccount,
  openMobileNav,
  closeMobileNav,
  showToast,
  clearToast,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
