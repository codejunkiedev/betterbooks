import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/shared/components/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/Tabs";
import { Receipt, Building2 } from "lucide-react";
import { UploadBankStatements, UploadInvoicesExpenses } from "@/features/users/upload-document";
import FbrScenarioInvoice from "@/features/users/upload-document/FbrScenarioInvoice";
import { useModules } from "@/shared/hooks/useModules";

const UploadDocuments = () => {
    const { accountingTier } = useModules();
    const hasAdvanced = accountingTier === 'Advanced';
    const [activeTab, setActiveTab] = useState(hasAdvanced ? "invoices-expenses" : "invoices-expenses");
    const location = useLocation();

    const isFbrScenario = location.state?.scenarioId && location.state?.scenarioData;

    useEffect(() => {
        if (!hasAdvanced && activeTab === 'bank-statements') {
            setActiveTab('invoices-expenses');
        }
    }, [hasAdvanced, activeTab]);

    if (isFbrScenario) {
        return <FbrScenarioInvoice />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
                    <p className="text-gray-500 text-lg">Upload your invoices, expenses, and bank statements</p>
                </div>

                <Card className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="invoices-expenses" className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                Invoices & Expenses
                            </TabsTrigger>
                            {hasAdvanced && (
                                <TabsTrigger value="bank-statements" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Bank Statements
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="invoices-expenses" className="space-y-6">
                            <UploadInvoicesExpenses />
                        </TabsContent>

                        {hasAdvanced && (
                            <TabsContent value="bank-statements" className="space-y-6">
                                <UploadBankStatements />
                            </TabsContent>
                        )}
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default UploadDocuments; 