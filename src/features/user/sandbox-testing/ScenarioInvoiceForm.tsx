import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/services/store";
import { useToast } from "@/shared/hooks/useToast";
import { useInvoiceValidation } from "@/shared/hooks/useInvoiceValidation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/Label";
import { Textarea } from "@/shared/components/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Badge } from "@/shared/components/Badge";
import { Alert, AlertDescription } from "@/shared/components/Alert";
import { InvoiceValidationModal } from "./InvoiceValidationModal";
import { FBRSubmissionModal } from "./FBRSubmissionModal";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/Tooltip";
import { Play, Target, FileText, AlertCircle, Trash2, Eye, CheckCircle } from "lucide-react";
import { getProvinceCodes, getFbrProfileForSellerData, addSuccessfulScenario } from "@/shared/services/supabase/fbr";
import { FBRInvoiceData, FBRInvoicePayload, InvoiceFormData, InvoiceItemCalculated } from "@/shared/types/invoice";
import { generateRandomSampleData, generateScenarioSpecificSampleData } from "@/shared/data/fbrSampleData";
import { generateFBRInvoiceNumberForPreview } from "@/shared/services/supabase/invoice";
import { generateInvoiceRefNo } from "@/shared/services/api/fbrSubmission";
import { BuyerManagement } from "@/features/user/buyer-management";
import { InvoiceItemManagement } from "./InvoiceItemManagement";
import { InvoicePreview } from "./InvoicePreview";
import { submitInvoiceToFBR } from "@/shared/services/api/fbrSubmission";
import { getFbrConfigStatus } from "@/shared/services/supabase/fbr";
import { getScenarioById, TaxScenario } from "@/shared/constants";
import { FbrEnvironment } from "@/shared/types/fbr";

type ScenarioInvoiceFormProps = {
  environment?: FbrEnvironment;
};

export default function ScenarioInvoiceForm({ environment = "sandbox" }: ScenarioInvoiceFormProps) {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const { user } = useSelector((s: RootState) => s.user);
  const { taxRates } = useSelector((s: RootState) => s.taxInfo);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Invoice validation hook
  const {
    validationResult,
    isValidating,
    validateInvoice: validateInvoiceData,
  } = useInvoiceValidation({
    includeFBRValidation: true,
    environment,
  });

  const isSandbox = environment === "sandbox" || false;

  const [scenario, setScenario] = useState<TaxScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSampleData, setLoadingSampleData] = useState(false);
  const [sellerDataFromFBR, setSellerDataFromFBR] = useState(false);
  const [clearingForm, setClearingForm] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [provinces, setProvinces] = useState<Array<{ state_province_code: number; state_province_desc: string }>>([]);
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceType: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    sellerNTNCNIC: "",
    sellerBusinessName: "",
    sellerProvince: "",
    sellerAddress: "",
    buyerNTNCNIC: "",
    buyerBusinessName: "",
    buyerProvince: "",
    buyerAddress: "",
    buyerRegistrationType: "",
    invoiceRefNo: "",
    scenarioId: scenarioId || "",
    items: [],
    totalAmount: 0,
    notes: "",
  });
  const [sellerProvinceCode, setSellerProvinceCode] = useState<number | null>(null);

  const loadProvinces = useCallback(async () => {
    try {
      const { data, error } = await getProvinceCodes();
      if (data && !error) {
        setProvinces(data);
      }
    } catch (error) {
      console.error("Error loading provinces:", error);
    }
  }, []);

  const generateRefNo = useCallback(async () => {
    if (!user?.id) return;

    try {
      const invoiceNumber = await generateInvoiceRefNo(user.id);
      setFormData((prev) => ({
        ...prev,
        invoiceRefNo: invoiceNumber,
      }));
    } catch (error) {
      console.error("Error generating invoice reference number:", error);
    }
  }, [user?.id]);

  const loadScenario = useCallback(() => {
    if (!scenarioId || !user?.id) return;

    try {
      setLoading(true);
      const scenarioData = getScenarioById(scenarioId);
      if (scenarioData) {
        setScenario(scenarioData);
      } else {
        toast({
          title: "Scenario Not Found",
          description: "The requested scenario could not be found.",
          variant: "destructive",
        });
        navigate(isSandbox ? "/fbr/sandbox-testing" : "/fbr/live-invoices");
      }
    } catch (error) {
      console.error("Error loading scenario:", error);
      toast({
        title: "Error",
        description: "Failed to load scenario details.",
        variant: "destructive",
      });
      navigate(isSandbox ? "/fbr/sandbox-testing" : "/fbr/live-invoices");
    } finally {
      setLoading(false);
    }
  }, [scenarioId, user?.id, toast, navigate, isSandbox]);

  // Load scenario and provinces on component mount
  useEffect(() => {
    if (scenarioId && user?.id) {
      Promise.all([loadScenario(), loadProvinces(), generateRefNo()]);
    }
  }, [scenarioId, user?.id, loadScenario, loadProvinces, generateRefNo]);

  // Auto-populate seller data from FBR profile when scenario is selected
  useEffect(() => {
    const autoPopulateSellerData = async () => {
      if (user?.id && scenarioId) {
        try {
          const sellerData = await getFbrProfileForSellerData(user.id);
          if (sellerData) {
            setFormData((prev) => ({
              ...prev,
              sellerNTNCNIC: sellerData.sellerNTNCNIC,
              sellerBusinessName: sellerData.sellerBusinessName,
              sellerProvince: sellerData.sellerProvince,
              sellerAddress: sellerData.sellerAddress,
            }));
            setSellerProvinceCode(sellerData.sellerProvinceCode);
            setSellerDataFromFBR(true);
          }
        } catch (error) {
          console.error("Error auto-populating seller data:", error);
        }
      }
    };

    autoPopulateSellerData();
  }, [user?.id, scenarioId]);

  const updateFormData = (field: keyof InvoiceFormData, value: string | number | InvoiceItemCalculated[] | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBuyerSelect = (buyerData: {
    buyerNTNCNIC: string;
    buyerBusinessName: string;
    buyerProvince: string;
    buyerAddress: string;
    buyerRegistrationType: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      buyerNTNCNIC: buyerData.buyerNTNCNIC,
      buyerBusinessName: buyerData.buyerBusinessName,
      buyerProvince: buyerData.buyerProvince,
      buyerAddress: buyerData.buyerAddress,
      buyerRegistrationType: buyerData.buyerRegistrationType,
    }));
  };

  const handleItemsChange = useCallback((newItems: FBRInvoiceData["items"]) => {
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  }, []);

  const populateSampleData = async () => {
    setLoadingSampleData(true);
    try {
      // Simulate some loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      let sampleData: InvoiceFormData;

      // Use scenario-specific data if scenario is loaded, otherwise use random data
      if (scenario?.id) {
        sampleData = generateScenarioSpecificSampleData(scenario.id);
      } else {
        sampleData = generateRandomSampleData();
      }

      // Preserve seller data from FBR profile and generated invoice reference number (don't overwrite them)
      setFormData((prev) => ({
        ...sampleData,
        sellerNTNCNIC: prev.sellerNTNCNIC,
        sellerBusinessName: prev.sellerBusinessName,
        sellerProvince: prev.sellerProvince,
        sellerAddress: prev.sellerAddress,
        invoiceRefNo: prev.invoiceRefNo, // Preserve generated invoice reference number
        totalAmount: sampleData.totalAmount || 0,
        notes: prev.notes,
      }));

      toast({
        title: "Sample Data Loaded",
        description: `Invoice populated with ${
          scenario?.id ? "scenario-specific" : "random"
        } sample data. Total amount: Rs. ${sampleData.totalAmount.toLocaleString()}`,
      });
    } catch (error) {
      console.error("Error loading sample data:", error);
      toast({
        title: "Error",
        description: "Failed to load sample data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingSampleData(false);
    }
  };

  const clearFormData = async () => {
    setClearingForm(true);
    try {
      // Simulate some loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      setFormData((prev) => ({
        invoiceType: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        sellerNTNCNIC: prev.sellerNTNCNIC,
        sellerBusinessName: prev.sellerBusinessName,
        sellerProvince: prev.sellerProvince,
        sellerAddress: prev.sellerAddress,
        buyerNTNCNIC: "",
        buyerBusinessName: "",
        buyerProvince: "",
        buyerAddress: "",
        buyerRegistrationType: "",
        invoiceRefNo: prev.invoiceRefNo,
        scenarioId: scenarioId || "",
        items: [],
        totalAmount: 0,
        notes: "",
      }));

      toast({
        title: "Form Cleared",
        description: "Form data has been cleared. Seller information preserved from FBR profile.",
      });
    } catch (error) {
      console.error("Error clearing form:", error);
      toast({
        title: "Error",
        description: "Failed to clear form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClearingForm(false);
    }
  };

  const handleValidateInvoice = async () => {
    try {
      if (!formData.buyerNTNCNIC || formData.items.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in buyer details and add at least one item before validating.",
          variant: "destructive",
        });
        return;
      }

      // Check if items have required data
      const invalidItems = formData.items.filter(
        (item) => !item.quantity || item.quantity <= 0 || !item.total_amount || item.total_amount <= 0
      );

      if (invalidItems.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please ensure all items have valid quantity and unit price.",
          variant: "destructive",
        });
        return;
      }

      if (!scenario?.id) {
        toast({
          title: "Validation Error",
          description: "Scenario ID is required.",
          variant: "destructive",
        });
        return;
      }

      const items: FBRInvoicePayload["items"] = formData.items.map((item) => {
        const SalesTaxCheck = ["SN008", "SN027"].includes(scenario?.id);
        const ExtraTaxCheck = ["SN028", "SN016", "SN005"].includes(scenario?.id);
        const valueSalesExcludingST = item.total_amount - item.sales_tax || 0.0;
        const taxRate = taxRates?.find((e) => e.value === item.tax_rate)?.description || `${item.tax_rate}%`;
        return {
          hsCode: item.hs_code,
          productDescription: item.item_name,
          rate: taxRate,
          uoM: item.uom_code,
          discount: 0.0,
          totalValues: item.total_amount,
          valueSalesExcludingST: valueSalesExcludingST,
          fixedNotifiedValueOrRetailPrice: SalesTaxCheck ? valueSalesExcludingST : item.fixed_notified_value || 0.0,
          salesTaxApplicable: item.sales_tax,
          salesTaxWithheldAtSource: 0.0,
          extraTax: ExtraTaxCheck ? "" : 0.0,
          furtherTax: 0.0,
          sroScheduleNo: item.sroScheduleNo || "",
          fedPayable: 0.0,
          saleType: scenario?.saleType || "",
          sroItemSerialNo: item?.sroItemSerialNo || "",
          quantity: item.quantity,
        };
      });
      await validateInvoiceData({ ...formData, items });
      setShowValidationModal(true);
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Validation Error",
        description: "Failed to validate invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewInvoice = async () => {
    try {
      // Generate invoice number if needed
      if (!formData.invoiceRefNo) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const invoiceNumber = await generateFBRInvoiceNumberForPreview(user?.id || "", year, month);
        setFormData((prev) => ({
          ...prev,
          invoiceRefNo: invoiceNumber,
        }));
      }
      setShowPreviewModal(true);
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate invoice number. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    setShowSubmissionModal(true);
  };

  const handleSubmitToFBRWrapper = async () => {
    if (!scenario || !user?.id) {
      return {
        success: false,
        error: "Missing scenario or user data",
      };
    }

    try {
      // Get user's FBR API key
      const config = await getFbrConfigStatus(user.id);
      const apiKey = isSandbox ? config.sandbox_api_key : config.production_api_key;

      if (!apiKey) {
        return {
          success: false,
          error: `FBR API Key Required - Please configure your FBR ${
            isSandbox ? "sandbox" : "production"
          } API key before submitting invoices.`,
        };
      }

      const updatedFormData = {
        ...formData,
        items: formData.items.map((item) => ({
          ...item,
          tax_rate: taxRates?.find((e) => e.value === item.tax_rate)?.description || `${item.tax_rate}%`,
        })),
      } as unknown as FBRInvoiceData;

      const response = await submitInvoiceToFBR({
        userId: user.id,
        invoiceData: updatedFormData,
        environment,
        apiKey: apiKey,
        maxRetries: 3,
        timeout: 90000,
      });

      if (response.success) {
        try {
          await addSuccessfulScenario(user.id, scenario.id);
        } catch (error) {
          console.error("Error adding successful scenario:", error);
        }

        // Navigate back to sandbox testing with a flag to refresh
        toast({
          title: "Invoice Submitted",
          description: "Invoice submitted successfully.",
        });
        navigate(isSandbox ? "/fbr/sandbox-testing" : "/fbr/live-invoices", { state: { refresh: true } });
      }

      return response;
    } catch (error) {
      console.error("Error submitting to FBR:", error);

      // Mark scenario as failed on error
      // if (scenario && user?.id) {
      //   await updateScenarioProgress(
      //     user.id,
      //     scenario.id,
      //     FBR_SCENARIO_STATUS.FAILED,
      //     error instanceof Error ? error.message : "Unknown error occurred"
      //   );
      // }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Scenario not found. Please return to sandbox testing.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-card rounded-xl p-4 sm:p-6 border">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Scenario {scenario.id}</h1>
                  <p className="text-muted-foreground font-medium text-sm sm:text-base">FBR Sandbox Testing</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {scenario.description}
              </p>
            </div>
            <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
              <Badge
                variant="secondary"
                className="capitalize px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium"
              >
                {scenario.saleType}
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Invoice Form */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Create FBR Invoice
                </CardTitle>
                <p className="text-muted-foreground text-sm">Fill in the invoice details to complete this scenario</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="default"
                  onClick={populateSampleData}
                  disabled={loadingSampleData || clearingForm}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 px-3 sm:px-4 py-2"
                >
                  {loadingSampleData ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Loading...</span>
                      <span className="sm:hidden">Loading</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Load Sample Data</span>
                      <span className="sm:hidden">Load Data</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={clearFormData}
                  disabled={loadingSampleData || clearingForm}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2"
                >
                  {clearingForm ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Clearing...</span>
                      <span className="sm:hidden">Clearing</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Clear Form</span>
                      <span className="sm:hidden">Clear</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">1</span>
                </div>
                Basic Invoice Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="invoiceType" className="text-sm font-medium">
                    Invoice Type
                  </Label>
                  <Select value={formData.invoiceType} onValueChange={(value) => updateFormData("invoiceType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select invoice type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sale Invoice">Sale Invoice</SelectItem>
                      <SelectItem value="Purchase Invoice">Purchase Invoice</SelectItem>
                      <SelectItem value="Credit Note">Credit Note</SelectItem>
                      <SelectItem value="Debit Note">Debit Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invoiceDate" className="text-sm font-medium">
                    Invoice Date
                  </Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => updateFormData("invoiceDate", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">2</span>
                  </div>
                  Seller Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="sellerNTNCNIC" className="text-sm font-medium">
                    Seller NTN/CNIC
                  </Label>
                  <Input
                    id="sellerNTNCNIC"
                    value={formData.sellerNTNCNIC}
                    onChange={(e) => updateFormData("sellerNTNCNIC", e.target.value)}
                    placeholder="Enter NTN (7 digits) or CNIC (13 digits)"
                    className="mt-1"
                    disabled={sellerDataFromFBR}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Must be 7 digits for NTN or 13 digits for CNIC</p>
                </div>
                <div>
                  <Label htmlFor="sellerBusinessName" className="text-sm font-medium">
                    Seller Business Name
                  </Label>
                  <Input
                    id="sellerBusinessName"
                    value={formData.sellerBusinessName}
                    onChange={(e) => updateFormData("sellerBusinessName", e.target.value)}
                    placeholder="Enter seller business name"
                    className="mt-1"
                    disabled={sellerDataFromFBR}
                  />
                </div>
                <div>
                  <Label htmlFor="sellerProvince" className="text-sm font-medium">
                    Seller Province
                  </Label>
                  <Select
                    value={formData.sellerProvince}
                    onValueChange={(value) => updateFormData("sellerProvince", value)}
                    disabled={sellerDataFromFBR}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select seller province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.state_province_code} value={province.state_province_desc}>
                          {province.state_province_desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sellerAddress" className="text-sm font-medium">
                    Seller Address
                  </Label>
                  <Input
                    id="sellerAddress"
                    value={formData.sellerAddress}
                    onChange={(e) => updateFormData("sellerAddress", e.target.value)}
                    placeholder="Enter seller address"
                    className="mt-1"
                    disabled={sellerDataFromFBR}
                  />
                </div>
              </div>
            </div>

            {/* Buyer Information */}
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">3</span>
                </div>
                Buyer Information
              </h3>

              <BuyerManagement
                onBuyerSelect={handleBuyerSelect}
                currentBuyerData={{
                  buyerNTNCNIC: formData.buyerNTNCNIC,
                  buyerBusinessName: formData.buyerBusinessName,
                  buyerProvince: formData.buyerProvince,
                  buyerAddress: formData.buyerAddress,
                  buyerRegistrationType: formData.buyerRegistrationType,
                }}
              />

              <div className="mt-6">
                <Label htmlFor="invoiceRefNo" className="text-sm font-medium">
                  Invoice Reference No.
                </Label>
                <Input
                  id="invoiceRefNo"
                  value={formData.invoiceRefNo}
                  placeholder="Auto-generated FBR reference number"
                  className="mt-1"
                  disabled={true}
                  readOnly={true}
                />
                <p className="text-xs text-muted-foreground mt-1">Auto-generated FBR-compliant reference number</p>
              </div>
            </div>

            {/* Invoice Items Management */}
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
              <div className="flex items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">4</span>
                  </div>
                  Invoice Items
                </h3>
              </div>

              <InvoiceItemManagement
                items={formData.items}
                onItemsChange={handleItemsChange}
                onRunningTotalsChange={() => {}}
                scenario={scenario}
                sellerProvinceId={sellerProvinceCode}
                environment={environment}
              />
            </div>

            {/* Notes */}
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6 border">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Add any additional notes or comments about this invoice..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6 border">
              <div className="flex flex-col gap-4">
                {/* Main Action Buttons Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePreviewInvoice}
                    disabled={
                      !formData.buyerNTNCNIC ||
                      formData.items.length === 0 ||
                      formData.items.some((item) => item.quantity === 0 || item.total_amount === 0)
                    }
                    className="flex items-center justify-center gap-2 px-4 py-2 h-10"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview Invoice</span>
                    <span className="sm:hidden">Preview</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleValidateInvoice}
                    disabled={
                      isValidating ||
                      !formData.buyerNTNCNIC ||
                      formData.items.length === 0 ||
                      formData.items.some((item) => item.quantity === 0 || item.total_amount === 0)
                    }
                    className="flex items-center justify-center gap-2 px-4 py-2 h-10"
                  >
                    {isValidating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Validating...</span>
                        <span className="sm:hidden">Validating</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Validate Invoice</span>
                        <span className="sm:hidden">Validate</span>
                        {validationResult && validationResult.isValid && (
                          <Badge variant="default" className="ml-2 text-xs bg-green-600">
                            ✓ Valid
                          </Badge>
                        )}
                        {validationResult && !validationResult.isValid && validationResult.summary.errors > 0 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            ✗ {validationResult.summary.errors} Error{validationResult.summary.errors !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        {validationResult &&
                          !validationResult.isValid &&
                          validationResult.summary.errors === 0 &&
                          validationResult.summary.warnings > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs bg-yellow-600">
                              ⚠ {validationResult.summary.warnings} Warning
                              {validationResult.summary.warnings !== 1 ? "s" : ""}
                            </Badge>
                          )}
                      </>
                    )}
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSubmit}
                          disabled={
                            !formData.buyerNTNCNIC ||
                            formData.items.length === 0 ||
                            formData.items.some((item) => item.quantity === 0 || item.total_amount === 0) ||
                            !validationResult ||
                            !validationResult.isValid
                          }
                          className="flex items-center justify-center gap-2 px-4 py-2 h-10 font-semibold"
                        >
                          <Play className="h-4 w-4" />
                          <span className="hidden sm:inline">Complete Scenario</span>
                        </Button>
                      </TooltipTrigger>
                      {!validationResult && (
                        <TooltipContent>
                          <p>Please validate the invoice first before completing the scenario</p>
                        </TooltipContent>
                      )}
                      {validationResult && !validationResult.isValid && (
                        <TooltipContent>
                          <p>Invoice validation failed. Please fix the errors and validate again.</p>
                        </TooltipContent>
                      )}
                      {validationResult && validationResult.isValid && (
                        <TooltipContent>
                          <p>Invoice is validated and ready for submission</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Cancel Button Row */}
                <div className="flex justify-center sm:justify-start">
                  <Button
                    variant="outline"
                    onClick={() => navigate(isSandbox ? "/fbr/sandbox-testing" : "/fbr/live-invoices")}
                    className="px-6 py-2 h-10 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Preview Modal */}
      <InvoicePreview invoiceData={formData} isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} />

      {/* Invoice Validation Modal */}
      <InvoiceValidationModal
        isOpen={showValidationModal}
        onClose={() => {
          setShowValidationModal(false);
        }}
        validationResult={validationResult}
        isLoading={isValidating}
        onValidate={handleValidateInvoice}
        onSubmit={() => {
          setShowValidationModal(false);
          setShowSubmissionModal(true);
        }}
      />

      {/* FBR Submission Modal */}
      <FBRSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        invoiceData={formData}
        environment={environment}
        userId={user?.id || ""}
        onSubmit={handleSubmitToFBRWrapper}
        maxRetries={3}
      />
    </div>
  );
}
