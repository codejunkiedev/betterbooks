import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import companyReducer from "./companySlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    company: companyReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;