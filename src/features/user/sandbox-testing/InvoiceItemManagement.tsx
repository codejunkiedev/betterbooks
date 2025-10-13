import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/shared/hooks/useRedux";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/Table";
import { Badge } from "@/shared/components/Badge";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/Dialog";
import { useToast } from "@/shared/hooks/useToast";
import {
  InvoiceItemForm,
  InvoiceItemCalculated,
  InvoiceRunningTotals,
  HSCodeSearchResult,
  UOMCode,
} from "@/shared/types/invoice";
import {
  calculateInvoiceItem,
  calculateRunningTotalsForCalculatedItems,
  validateInvoiceItem,
  formatCurrency,
  formatQuantity,
  formatTaxRateDisplay,
  isThirdScheduleItem,
} from "@/shared/utils/invoiceCalculations";
import { SYSTEM_DEFAULTS } from "@/shared/constants/invoiceDefaults";
import {
  getHSCodeDetails as getCachedHSCodeDetails,
  cacheHSCode,
  bulkCacheHSCodes,
} from "@/shared/services/supabase/invoice";
import { getFbrConfigStatus } from "@/shared/services/supabase/fbr";
import { Plus, Trash2, Edit, MoveUp, MoveDown } from "lucide-react";
import { getAllHSCodes, getSroSchedule, getSroItem } from "@/shared/services/api/fbr";
import { getUOMCodes } from "@/shared/services/api/fbr";
import { fetchTaxRates, type TaxRateInfo } from "@/shared/services/api/fbrTaxRates";
import { TaxScenario } from "@/shared/constants";
import {
  getHSCodesFromCache,
  saveHSCodesToCache,
  getUOMCodesFromCache,
  saveUOMCodesToCache,
} from "@/shared/utils/fbrDataCache";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/shared/services/store";
import { setTaxRates } from "@/shared/services/store/taxInfoSlice";
import type { SroScheduleResponse, SroItemResponse } from "@/shared/types/fbr";

interface InvoiceItemManagementProps {
  items: InvoiceItemCalculated[];
  onItemsChange: (items: InvoiceItemCalculated[]) => void;
  onRunningTotalsChange: (totals: InvoiceRunningTotals) => void;
  scenario?: TaxScenario | null;
  sellerProvinceId?: number | null;
  environment?: "sandbox" | "production";
  className?: string;
}

export function InvoiceItemManagement({
  items,
  onItemsChange,
  onRunningTotalsChange,
  scenario,
  sellerProvinceId,
  environment = "sandbox",
  className = "",
}: InvoiceItemManagementProps) {
  const { user } = useAppSelector((state) => state.user);
  const { toast } = useToast();
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<InvoiceItemForm>({
    hs_code: "",
    item_name: "",
    quantity: SYSTEM_DEFAULTS.DEFAULT_QUANTITY,
    unit_price: SYSTEM_DEFAULTS.MIN_UNIT_PRICE,
    uom_code: "",
    tax_rate: SYSTEM_DEFAULTS.MIN_TAX_RATE,
    tax_unit: "percentage",
    invoice_note: "",
    is_third_schedule: false,
    sroScheduleNo: "",
    sroItemSerialNo: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hsCodeSearchTerm, setHsCodeSearchTerm] = useState("");
  const [hsCodeResults, setHsCodeResults] = useState<HSCodeSearchResult[]>([]);
  const [isSearchingHSCodes, setIsSearchingHSCodes] = useState(false);
  const [uomOptions, setUomOptions] = useState<UOMCode[]>([]);
  const [allHSCodes, setAllHSCodes] = useState<HSCodeSearchResult[]>([]);
  const [isCaching, setIsCaching] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [filteredUomOptions, setFilteredUomOptions] = useState<UOMCode[]>([]);
  const [availableTaxRates, setAvailableTaxRates] = useState<TaxRateInfo[]>([]);
  const [isLoadingTaxRates, setIsLoadingTaxRates] = useState(false);
  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRateInfo | null>(null);
  const [sroScheduleOptions, setSroScheduleOptions] = useState<SroScheduleResponse[]>([]);
  const [sroItemOptions, setSroItemOptions] = useState<SroItemResponse[]>([]);
  const [isLoadingSroSchedules, setIsLoadingSroSchedules] = useState(false);
  const [isLoadingSroItems, setIsLoadingSroItems] = useState(false);
  const [selectedSroSchedule, setSelectedSroSchedule] = useState<SroScheduleResponse | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const getUomDescription = (uomId: string | number | undefined | null): string => {
    if (!uomId) return "N/A";
    const uom = uomOptions.find((option) => option.uoM_ID.toString() === uomId.toString());
    return uom ? uom.description : uomId.toString();
  };

  // Fetch tax rates based on scenario's transaction_type_id
  const fetchTaxRatesForScenario = useCallback(async () => {
    if (!scenario?.saleTypeId || !user?.id || !sellerProvinceId) {
      console.log("No scenario or user or seller province id");
      return;
    }

    setIsLoadingTaxRates(true);
    try {
      const rates = await fetchTaxRates(scenario.saleTypeId, sellerProvinceId, user.id, environment);
      setAvailableTaxRates(rates);
      dispatch(setTaxRates(rates));
    } catch (error) {
      console.error("Error fetching tax rates:", error);

      // Set a default tax rate when API fails
      const defaultRate: TaxRateInfo = {
        rateId: 0,
        description: "Default tax rate (API unavailable)",
        value: SYSTEM_DEFAULTS.MIN_TAX_RATE,
        unit: "percentage",
        formattedValue: `${SYSTEM_DEFAULTS.MIN_TAX_RATE}%`,
      };

      setAvailableTaxRates([defaultRate]);
      dispatch(setTaxRates([defaultRate]));

      toast({
        title: "Warning",
        description:
          "FBR tax rate API is currently unavailable. This may be due to server issues or invalid parameters. Using default rate. You can manually adjust the tax rate.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTaxRates(false);
    }
  }, [dispatch, scenario?.saleTypeId, sellerProvinceId, toast, user?.id, environment]);

  // Fetch SRO schedule numbers based on selected tax rate
  const fetchSroScheduleNumbers = useCallback(
    async (rateId: number) => {
      if (!user?.id || !sellerProvinceId) {
        return;
      }

      setIsLoadingSroSchedules(true);
      try {
        const fbrConfig = await getFbrConfigStatus(user.id);
        const apiKey = environment === "sandbox" ? fbrConfig.sandbox_api_key : fbrConfig.production_api_key;

        if (!apiKey) {
          toast({
            title: "API Key Required",
            description: "FBR API key is required to fetch SRO schedule numbers.",
            variant: "destructive",
          });
          return;
        }

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, "0")}-${today.toLocaleDateString("en-US", {
          month: "short",
        })}-${today.getFullYear()}`;

        const response = await getSroSchedule(apiKey, {
          rateId: rateId,
          date: dateStr,
          originationSupplier: sellerProvinceId,
        });

        if (response.success) {
          setSroScheduleOptions(response.data);
        } else {
          console.error("Error fetching SRO schedules:", response.message);
          setSroScheduleOptions([]);
        }
      } catch (error) {
        console.error("Error fetching SRO schedules:", error);
        setSroScheduleOptions([]);
      } finally {
        setIsLoadingSroSchedules(false);
      }
    },
    [user?.id, sellerProvinceId, toast, environment]
  );

  // Fetch SRO items based on selected SRO schedule
  const fetchSroItems = useCallback(
    async (sroId: number) => {
      if (!user?.id) {
        return;
      }

      setIsLoadingSroItems(true);
      try {
        const fbrConfig = await getFbrConfigStatus(user.id);
        const apiKey = environment === "sandbox" ? fbrConfig.sandbox_api_key : fbrConfig.production_api_key;

        if (!apiKey) {
          toast({
            title: "API Key Required",
            description: "FBR API key is required to fetch SRO items.",
            variant: "destructive",
          });
          return;
        }

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

        const response = await getSroItem(apiKey, {
          date: today,
          sroId: sroId,
        });

        if (response.success) {
          setSroItemOptions(response.data);
        } else {
          console.error("Error fetching SRO items:", response.message);
          setSroItemOptions([]);
        }
      } catch (error) {
        console.error("Error fetching SRO items:", error);
        setSroItemOptions([]);
      } finally {
        setIsLoadingSroItems(false);
      }
    },
    [user?.id, toast, environment]
  );

  // Fetch tax rates when scenario changes
  useEffect(() => {
    if (scenario?.saleTypeId && sellerProvinceId) {
      fetchTaxRatesForScenario();
    }
  }, [scenario?.saleTypeId, sellerProvinceId, fetchTaxRatesForScenario]);

  const filterUomOptionsByHSCode = useCallback(
    async (hsCode: string) => {
      if (!hsCode) {
        setFilteredUomOptions(uomOptions);
        return;
      }

      try {
        const fbrConfig = await getFbrConfigStatus(user?.id || "");
        const apiKey = environment === "sandbox" ? fbrConfig.sandbox_api_key : fbrConfig.production_api_key;

        if (!apiKey) {
          setFilteredUomOptions(uomOptions);
          return;
        }

        const { getHSCodeUOMMapping } = await import("@/shared/services/api/fbr");
        const response = await getHSCodeUOMMapping(apiKey, hsCode);

        if (response.success && response.data && response.data.length > 0) {
          setFilteredUomOptions(response.data);
        } else {
          setFilteredUomOptions(uomOptions);
        }
      } catch {
        setFilteredUomOptions(uomOptions);
      }
    },
    [uomOptions, user?.id, environment]
  );

  useEffect(() => {
    if (!items || items.length === 0) {
      onRunningTotalsChange({
        total_items: 0,
        total_value_excluding_tax: 0,
        total_sales_tax: 0,
        total_amount: 0,
      });
      return;
    }

    const totals = calculateRunningTotalsForCalculatedItems(items);
    onRunningTotalsChange(totals);
  }, [items, onRunningTotalsChange]);

  const loadFbrApiKeyAndAllData = useCallback(async () => {
    if (!user?.id || isCaching) return;

    try {
      setIsCaching(true);
      const fbrConfig = await getFbrConfigStatus(user.id);
      const apiKey = environment === "sandbox" ? fbrConfig.sandbox_api_key : fbrConfig.production_api_key;

      if (!apiKey) {
        toast({
          title: "FBR API Not Configured",
          description: "Please configure your FBR API credentials first",
          variant: "destructive",
        });
        return;
      }

      if (allHSCodes.length > 0) {
        setHasLoadedData(true);
        return;
      }

      if (allHSCodes.length === 0) {
        const cachedHSCodes = getHSCodesFromCache();
        if (cachedHSCodes && cachedHSCodes.length > 0) {
          setAllHSCodes(cachedHSCodes);
          toast({
            title: "HS Codes Loaded",
            description: `Loaded ${cachedHSCodes.length} HS codes from cache`,
            variant: "default",
          });
        } else {
          const hsCodeResponse = await getAllHSCodes(apiKey);

          if (hsCodeResponse.success) {
            setAllHSCodes(hsCodeResponse.data);
            saveHSCodesToCache(hsCodeResponse.data);
            toast({
              title: "HS Codes Loaded",
              description: `Fetched ${hsCodeResponse.data.length} HS codes from FBR API`,
              variant: "default",
            });

            try {
              const { checkCacheStatus } = await import("@/shared/services/supabase/invoice");
              const cacheStatus = await checkCacheStatus();

              if (!cacheStatus.hasData) {
                const hsCodeCache = hsCodeResponse.data.map((item) => ({
                  hs_code: item.hS_CODE,
                  description: item.description,
                  default_uom: uomOptions.length > 0 ? uomOptions[0].uoM_ID.toString() : "50",
                  default_tax_rate: SYSTEM_DEFAULTS.MIN_TAX_RATE,
                  is_third_schedule: isThirdScheduleItem(item.hS_CODE),
                }));

                const batchSize = 50;
                for (let i = 0; i < hsCodeCache.length; i += batchSize) {
                  const batch = hsCodeCache.slice(i, i + batchSize);
                  await bulkCacheHSCodes(batch);
                }
              }
            } catch {
              toast({
                title: "Error",
                description: "Failed to cache HS codes. Please check your API configuration and try again.",
                variant: "destructive",
              });
            }
          } else {
            throw new Error(hsCodeResponse.message);
          }
        }
      }

      // Load UOM codes from cache first, then from API if needed
      const cachedUOMCodes = getUOMCodesFromCache();
      if (cachedUOMCodes && cachedUOMCodes.length > 0) {
        const uniqueUomOptions = cachedUOMCodes.filter(
          (uom, index, self) => index === self.findIndex((u) => u.uoM_ID === uom.uoM_ID)
        );
        setUomOptions(uniqueUomOptions);
        toast({
          title: "UOM Codes Loaded",
          description: `Loaded ${uniqueUomOptions.length} UOM codes from cache`,
          variant: "default",
        });
      } else {
        const uomResponse = await getUOMCodes(apiKey);

        if (uomResponse.success && uomResponse.data && uomResponse.data.length > 0) {
          const uniqueUomOptions = uomResponse.data.filter(
            (uom, index, self) => index === self.findIndex((u) => u.uoM_ID === uom.uoM_ID)
          );
          setUomOptions(uniqueUomOptions);
          saveUOMCodesToCache(uniqueUomOptions);
          toast({
            title: "UOM Codes Loaded",
            description: `Fetched ${uniqueUomOptions.length} UOM codes from FBR API`,
            variant: "default",
          });
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load data from FBR API. Please check your API configuration and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCaching(false);
      setHasLoadedData(true);
    }
  }, [user?.id, toast, allHSCodes.length, uomOptions, isCaching, environment]);

  useEffect(() => {
    if (!hasLoadedData && user?.id) {
      loadFbrApiKeyAndAllData();
    }
  }, [loadFbrApiKeyAndAllData, hasLoadedData, user?.id]);

  useEffect(() => {
    setFilteredUomOptions(uomOptions);
  }, [uomOptions]);

  const searchHSCodesFromFrontend = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setHsCodeResults([]);
        return;
      }

      if (!allHSCodes.length) {
        toast({
          title: "No HS Codes Available",
          description: "Please wait for HS codes to load from FBR API",
          variant: "default",
        });
        return;
      }

      setIsSearchingHSCodes(true);

      setTimeout(() => {
        const searchTermLower = searchTerm.toLowerCase();
        const filteredResults = allHSCodes
          .filter((item) => {
            const hsCode = item.hS_CODE?.toString() || "";
            const description = item.description?.toString() || "";

            return (
              hsCode.toLowerCase().includes(searchTermLower) || description.toLowerCase().includes(searchTermLower)
            );
          })
          .slice(0, 50);

        setHsCodeResults(filteredResults);
        setIsSearchingHSCodes(false);
      }, 0);
    },
    [allHSCodes, toast]
  );

  const handleHSCodeSearch = useCallback(
    (term: unknown) => {
      debounce((term: unknown) => {
        searchHSCodesFromFrontend(term as string);
      }, 100)(term);
    },
    [searchHSCodesFromFrontend]
  );

  const handleHSCodeSelect = async (hsCode: string) => {
    try {
      const selectedHSCode = allHSCodes.find((item) => item.hS_CODE === hsCode);

      if (!selectedHSCode) {
        toast({
          title: "Error",
          description: "Selected HS code not found",
          variant: "destructive",
        });
        return;
      }

      let hsCodeDetails = await getCachedHSCodeDetails(hsCode);

      if (!hsCodeDetails) {
        hsCodeDetails = {
          hs_code: hsCode,
          description: selectedHSCode.description,
          default_uom: uomOptions.length > 0 ? uomOptions[0].uoM_ID.toString() : "50",
          default_tax_rate: SYSTEM_DEFAULTS.MIN_TAX_RATE,
          is_third_schedule: isThirdScheduleItem(hsCode),
        };

        try {
          await cacheHSCode(hsCodeDetails);
        } catch {
          // Optional caching
        }
      }

      if (hsCodeDetails) {
        setFormData((prev) => ({
          ...prev,
          hs_code: hsCode,
          item_name: selectedHSCode.description,
          tax_rate: hsCodeDetails.default_tax_rate || SYSTEM_DEFAULTS.MIN_TAX_RATE,
          is_third_schedule: hsCodeDetails.is_third_schedule || isThirdScheduleItem(hsCode),
        }));
      }

      setHsCodeSearchTerm(hsCode);
      setHsCodeResults([]);

      await filterUomOptionsByHSCode(hsCode);

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.hs_code;
        return newErrors;
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to select HS code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormChange = (field: keyof InvoiceItemForm, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    if (field === "hs_code" && !value) {
      setFilteredUomOptions(uomOptions);
    }
  };

  const validateForm = (): boolean => {
    const validation = validateInvoiceItem(formData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleSaveItem = () => {
    if (!validateForm()) return;

    // Special handling for SN022 (Potassium Chlorate) - apply compound tax
    let modifiedFormData = { ...formData };
    if (scenario?.id === "SN022") {
      // Potassium Chlorate has compound tax: 18% + Rs. 60 per kg
      modifiedFormData.tax_unit = "compound" as any;
      modifiedFormData.fixed_rate_per_unit = 60; // Rs. 60 per kilogram
      modifiedFormData.tax_rate = 18; // 18% percentage component
    }

    const calculatedItem = calculateInvoiceItem(modifiedFormData);

    if (editingItemIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editingItemIndex] = calculatedItem;
      onItemsChange(updatedItems);
    } else {
      onItemsChange([...items, calculatedItem]);
    }

    setIsAddItemOpen(false);
    setEditingItemIndex(null);
    setFormData({
      hs_code: "",
      item_name: "",
      quantity: SYSTEM_DEFAULTS.DEFAULT_QUANTITY,
      unit_price: SYSTEM_DEFAULTS.MIN_UNIT_PRICE,
      uom_code: "",
      tax_rate: SYSTEM_DEFAULTS.MIN_TAX_RATE,
      tax_unit: "percentage",
      invoice_note: "",
      is_third_schedule: false,
      sroScheduleNo: "",
      sroItemSerialNo: "",
    });
    setValidationErrors({});
    setHsCodeSearchTerm("");
    setHsCodeResults([]);
    setFilteredUomOptions(uomOptions);
    setSelectedTaxRate(null);
    setSelectedSroSchedule(null);
    setSroScheduleOptions([]);
    setSroItemOptions([]);

    toast({
      title: "Success",
      description: editingItemIndex !== null ? "Item updated successfully" : "Item added successfully",
    });
  };

  const handleEditItem = (index: number) => {
    const item = items[index];
    setFormData({
      id: item.id,
      hs_code: item.hs_code,
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      uom_code: item.uom_code,
      tax_rate: item.tax_rate,
      tax_unit: item.tax_unit || "percentage",
      mrp_including_tax: item.mrp_including_tax || 0,
      mrp_excluding_tax: item.mrp_excluding_tax || 0,
      invoice_note: item.invoice_note || "",
      is_third_schedule: item.is_third_schedule,
      sroScheduleNo: item.sroScheduleNo || "",
      sroItemSerialNo: item.sroItemSerialNo || "",
    });
    setEditingItemIndex(index);
    setIsAddItemOpen(true);

    const currentTaxRate = availableTaxRates.find(
      (rate) => rate.value === item.tax_rate && rate.unit === (item.tax_unit || "percentage")
    );
    if (currentTaxRate) {
      setSelectedTaxRate(currentTaxRate);
      if (item.sroScheduleNo) {
        fetchSroScheduleNumbers(currentTaxRate.rateId);
      }
    }
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
    toast({
      title: "Success",
      description: "Item deleted successfully",
    });
  };

  const handleMoveItem = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= items.length) return;

    const updatedItems = [...items];
    [updatedItems[fromIndex], updatedItems[toIndex]] = [updatedItems[toIndex], updatedItems[fromIndex]];
    onItemsChange(updatedItems);
  };

  const openAddModal = () => {
    setFormData({
      hs_code: "",
      item_name: "",
      quantity: SYSTEM_DEFAULTS.DEFAULT_QUANTITY,
      unit_price: SYSTEM_DEFAULTS.MIN_UNIT_PRICE,
      uom_code: "",
      tax_rate: SYSTEM_DEFAULTS.MIN_TAX_RATE,
      tax_unit: "percentage",
      invoice_note: "",
      is_third_schedule: false,
      sroScheduleNo: "",
      sroItemSerialNo: "",
    });
    setValidationErrors({});
    setHsCodeSearchTerm("");
    setHsCodeResults([]);
    setEditingItemIndex(null);
    setIsAddItemOpen(true);
    setFilteredUomOptions(uomOptions);
    setSelectedTaxRate(null);
    setSelectedSroSchedule(null);
    setSroScheduleOptions([]);
    setSroItemOptions([]);
  };

  const runningTotals =
    items && items.length > 0
      ? calculateRunningTotalsForCalculatedItems(items)
      : {
          total_items: 0,
          total_value_excluding_tax: 0,
          total_sales_tax: 0,
          total_amount: 0,
        };

  function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Invoice Items</h3>
            <Button onClick={openAddModal} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No items added yet. Click "Add Item" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>HS Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead className="text-right">Tax Rate</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(items || []).map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-mono text-sm">{item.hs_code || "N/A"}</div>
                          {item.is_third_schedule && (
                            <Badge variant="secondary" className="text-xs">
                              3rd Schedule
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate cursor-help" title={`Full Description: ${item.item_name || "N/A"}`}>
                          {item.item_name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatQuantity(item.quantity || 0)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.unit_price || 0)}</TableCell>
                      <TableCell className="font-mono">{getUomDescription(item.uom_code)}</TableCell>
                      <TableCell className="text-right">
                        {scenario?.id === "SN022"
                          ? formatTaxRateDisplay(18, "compound", 60) // Potassium Chlorate compound rate
                          : formatTaxRateDisplay(item.tax_rate || 0, item.tax_unit || "percentage", item.fixed_rate_per_unit)
                        }
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(item.total_amount || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditItem(index)} title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveItem(index, "up")}
                            disabled={index === 0}
                            title="Move Up"
                          >
                            <MoveUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveItem(index, "down")}
                            disabled={index === items.length - 1}
                            title="Move Down"
                          >
                            <MoveDown className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(index)} title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {items && items.length > 0 && runningTotals && (
        <Card>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{runningTotals.total_items || 0}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Items</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(runningTotals.total_value_excluding_tax || 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Value Excluding Tax</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">
                  {formatCurrency(runningTotals.total_sales_tax || 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Sales Tax</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {formatCurrency(runningTotals.total_amount || 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Amount</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItemIndex !== null ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>
              {editingItemIndex !== null
                ? "Modify the details of this invoice item below."
                : "Enter the details for a new invoice item below."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hs-code">HS Code *</Label>
              <div className="relative">
                <Input
                  id="hs-code"
                  placeholder="Search HS Code..."
                  value={hsCodeSearchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setHsCodeSearchTerm(value);
                    handleHSCodeSearch(value);
                  }}
                  className={validationErrors.hs_code ? "border-red-500" : ""}
                />
                {isSearchingHSCodes && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {validationErrors.hs_code && <p className="text-sm text-red-500">{validationErrors.hs_code}</p>}

              {hsCodeResults.length > 0 && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {hsCodeResults.map((result) => (
                    <div
                      key={result.hS_CODE}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleHSCodeSelect(result.hS_CODE)}
                    >
                      <div className="font-mono text-sm font-semibold">{result.hS_CODE}</div>
                      <div className="text-sm text-gray-600">{result.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-name">Product Description *</Label>
              <Input
                id="item-name"
                value={formData.item_name}
                onChange={(e) => handleFormChange("item_name", e.target.value)}
                placeholder="Enter product description..."
                className={validationErrors.item_name ? "border-red-500" : ""}
              />
              {validationErrors.item_name && <p className="text-sm text-red-500">{validationErrors.item_name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={SYSTEM_DEFAULTS.MIN_QUANTITY}
                  step="0.001"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange("quantity", parseFloat(e.target.value) || 0)}
                  className={validationErrors.quantity ? "border-red-500" : ""}
                  placeholder="e.g., 1.5 kg, 0.75 L"
                />
                {validationErrors.quantity && <p className="text-sm text-red-500">{validationErrors.quantity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-price">Unit Price *</Label>
                <Input
                  id="unit-price"
                  type="number"
                  min={SYSTEM_DEFAULTS.MIN_UNIT_PRICE}
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => handleFormChange("unit_price", parseFloat(e.target.value) || 0)}
                  className={validationErrors.unit_price ? "border-red-500" : ""}
                />
                {validationErrors.unit_price && <p className="text-sm text-red-500">{validationErrors.unit_price}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="uom">Unit of Measure *</Label>
                <Select
                  {...(formData.uom_code ? { value: formData.uom_code } : {})}
                  onValueChange={(value) => handleFormChange("uom_code", value)}
                >
                  <SelectTrigger className={validationErrors.uom_code ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select UoM" />
                  </SelectTrigger>
                  <SelectContent>
                    {(filteredUomOptions.length > 0 ? filteredUomOptions : uomOptions).length > 0 ? (
                      (filteredUomOptions.length > 0 ? filteredUomOptions : uomOptions).map((uom, index) => (
                        <SelectItem key={`${uom.uoM_ID}-${index}`} value={uom.description}>
                          {uom.description}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_data__" disabled>
                        No UoM options available. Check API configuration.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {validationErrors.uom_code && <p className="text-sm text-red-500">{validationErrors.uom_code}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-rate">
                  Tax Rate{" "}
                  {selectedTaxRate
                    ? `(${
                        selectedTaxRate.unit === "percentage" ? "%" : selectedTaxRate.unit === "rupee" ? "Rs." : "Fixed"
                      })`
                    : "(%)"}{" "}
                  *
                </Label>
                {isLoadingTaxRates ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-500">Loading tax rates...</span>
                  </div>
                ) : availableTaxRates.length > 0 ? (
                  <Select
                    value={selectedTaxRate?.rateId.toString() || ""}
                    onValueChange={(value) => {
                      const rate = availableTaxRates.find((r) => r.rateId.toString() === value);
                      if (rate) {
                        setSelectedTaxRate(rate);
                        setFormData((prev) => ({
                          ...prev,
                          tax_rate: rate.value,
                          tax_unit: rate.unit,
                          sroScheduleNo: "",
                          sroItemSerialNo: "",
                        }));
                        setSelectedSroSchedule(null);
                        setSroItemOptions([]);
                        fetchSroScheduleNumbers(rate.rateId);
                      }
                    }}
                  >
                    <SelectTrigger className={validationErrors.tax_rate ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select tax rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTaxRates.map((rate) => (
                        <SelectItem key={rate.rateId} value={rate.rateId.toString()}>
                          {rate.formattedValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="tax-rate"
                    type="number"
                    min={SYSTEM_DEFAULTS.MIN_TAX_RATE}
                    max={SYSTEM_DEFAULTS.MAX_TAX_RATE}
                    step="0.01"
                    value={formData.tax_rate}
                    onChange={(e) => handleFormChange("tax_rate", parseFloat(e.target.value) || 0)}
                    className={validationErrors.tax_rate ? "border-red-500" : ""}
                    placeholder="Enter tax rate"
                  />
                )}
                {validationErrors.tax_rate && <p className="text-sm text-red-500">{validationErrors.tax_rate}</p>}
              </div>
            </div>

            {/* {formData.is_third_schedule && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mrp-including-tax">MRP Including Tax</Label>
                  <Input
                    id="mrp-including-tax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.mrp_including_tax || ""}
                    onChange={(e) => handleFormChange("mrp_including_tax", parseFloat(e.target.value) || 0)}
                    className={validationErrors.mrp_including_tax ? "border-red-500" : ""}
                  />
                  {validationErrors.mrp_including_tax && (
                    <p className="text-sm text-red-500">{validationErrors.mrp_including_tax}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrp-excluding-tax">MRP Excluding Tax</Label>
                  <Input
                    id="mrp-excluding-tax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.mrp_excluding_tax || ""}
                    onChange={(e) => handleFormChange("mrp_excluding_tax", parseFloat(e.target.value) || 0)}
                    className={validationErrors.mrp_excluding_tax ? "border-red-500" : ""}
                    disabled
                  />
                  {validationErrors.mrp_excluding_tax && (
                    <p className="text-sm text-red-500">{validationErrors.mrp_excluding_tax}</p>
                  )}
                </div>
              </div>
            )} */}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sro-schedule-no">SRO Schedule No</Label>
                  {!selectedTaxRate ? (
                    <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/30">
                      Please select a tax rate first
                    </div>
                  ) : isLoadingSroSchedules ? (
                    <div className="flex items-center space-x-2 p-2 border rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-500">Loading SRO schedules...</span>
                    </div>
                  ) : sroScheduleOptions.length > 0 ? (
                    <Select
                      value={selectedSroSchedule?.srO_ID.toString() || ""}
                      onValueChange={(value) => {
                        const schedule = sroScheduleOptions.find((s) => s.srO_ID.toString() === value);
                        if (schedule) {
                          setSelectedSroSchedule(schedule);
                          setFormData((prev) => ({ ...prev, sroScheduleNo: schedule.srO_DESC, sroItemSerialNo: "" }));
                          setSroItemOptions([]);
                          fetchSroItems(schedule.srO_ID);
                        }
                      }}
                    >
                      <SelectTrigger className={validationErrors.sroScheduleNo ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select SRO Schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {sroScheduleOptions.map((schedule) => (
                          <SelectItem key={schedule.srO_ID} value={schedule.srO_ID.toString()}>
                            {schedule.srO_DESC}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="sro-schedule-no"
                      value={formData.sroScheduleNo || ""}
                      onChange={(e) => handleFormChange("sroScheduleNo", e.target.value)}
                      placeholder="Enter SRO Schedule No manually"
                      className={validationErrors.sroScheduleNo ? "border-red-500" : ""}
                    />
                  )}
                  {validationErrors.sroScheduleNo && (
                    <p className="text-sm text-red-500">{validationErrors.sroScheduleNo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sro-item-serial-no">SRO Item Number</Label>
                  {!selectedTaxRate ? (
                    <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/30">
                      Please select a tax rate first
                    </div>
                  ) : !selectedSroSchedule && sroScheduleOptions.length > 0 ? (
                    <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/30">
                      Please select an SRO schedule first
                    </div>
                  ) : isLoadingSroItems ? (
                    <div className="flex items-center space-x-2 p-2 border rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-500">Loading SRO items...</span>
                    </div>
                  ) : sroItemOptions.length > 0 ? (
                    <Select
                      value={formData.sroItemSerialNo || ""}
                      onValueChange={(value) => {
                        const item = sroItemOptions.find((i) => i.srO_ITEM_DESC === value);
                        if (item) {
                          setFormData((prev) => ({ ...prev, sroItemSerialNo: item.srO_ITEM_DESC }));
                        }
                      }}
                    >
                      <SelectTrigger className={validationErrors.sroItemSerialNo ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select SRO Item" />
                      </SelectTrigger>
                      <SelectContent>
                        {sroItemOptions.map((item) => (
                          <SelectItem key={item.srO_ITEM_ID} value={item.srO_ITEM_DESC}>
                            {item.srO_ITEM_DESC}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="sro-item-serial-no"
                      value={formData.sroItemSerialNo || ""}
                      onChange={(e) => handleFormChange("sroItemSerialNo", e.target.value)}
                      placeholder="Enter SRO Item Number manually"
                      className={validationErrors.sroItemSerialNo ? "border-red-500" : ""}
                    />
                  )}
                  {validationErrors.sroItemSerialNo && (
                    <p className="text-sm text-red-500">{validationErrors.sroItemSerialNo}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>{editingItemIndex !== null ? "Update Item" : "Add Item"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
