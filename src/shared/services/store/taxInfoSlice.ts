import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TaxRateInfo } from "../api/fbrTaxRates";

type TaxInfo = {
  taxRates: TaxRateInfo[];
};

const initialState: TaxInfo = {
  taxRates: [],
};

const taxInfoSlice = createSlice({
  name: "taxInfo",
  initialState,
  reducers: {
    setTaxRates: (state, action: PayloadAction<TaxRateInfo[]>) => {
      state.taxRates = action.payload;
    },
    clearTaxRates: (state) => {
      state.taxRates = [];
    },
  },
});

export const { setTaxRates, clearTaxRates } = taxInfoSlice.actions;

export default taxInfoSlice.reducer;
