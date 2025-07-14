import { useState } from "react";
import { Card } from "@/shared/components/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/Tabs";
import { Receipt, Building2 } from "lucide-react";
import UploadInvoicesExpenses from "@/features/users/documents/UploadInvoicesExpenses";
import UploadBankStatements from "@/features/users/documents/UploadBankStatements";

const UploadDocuments = () => {
    const [activeTab, setActiveTab] = useState("invoices-expenses");

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
                            <TabsTrigger value="bank-statements" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Bank Statements
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="invoices-expenses" className="space-y-6">
                            <UploadInvoicesExpenses />
                        </TabsContent>

                        <TabsContent value="bank-statements" className="space-y-6">
                            <UploadBankStatements />
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default UploadDocuments; 