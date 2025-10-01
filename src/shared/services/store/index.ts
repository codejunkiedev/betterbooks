import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import companyReducer from "./companySlice";
import uiReducer from "./uiSlice";
import taxInfoReducer from "./taxInfoSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    company: companyReducer,
    ui: uiReducer,
    taxInfo: taxInfoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
