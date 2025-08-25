import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/Dialog';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { LoadingSpinner } from '@/shared/components/Loading';
import {
    Download,
    FileText,
    Building2,
    User,
    Package,
    Calculator,
    QrCode
} from 'lucide-react';
import { ScenarioInvoiceFormData } from '@/shared/types/invoice';
import { format } from 'date-fns';

interface InvoicePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceData: ScenarioInvoiceFormData;
    onDownloadPDF: () => void;
    isGeneratingPDF?: boolean;
}

export function InvoicePreview({
    isOpen,
    onClose,
    invoiceData,
    onDownloadPDF,
    isGeneratingPDF = false
}: InvoicePreviewProps) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

    // Generate QR code for FBR
    useEffect(() => {
        const generateQRCode = async () => {
            try {
                // Import QRCode dynamically to avoid SSR issues
                const QRCode = (await import('qrcode')).default;

                const qrData = {
                    invoiceNumber: invoiceData.invoiceRefNo,
                    sellerNTN: invoiceData.sellerNTNCNIC,
                    totalAmount: invoiceData.totalAmount,
                    date: invoiceData.invoiceDate,
                    fbr: "FBR"
                };

                const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
                    width: 120,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });

                setQrCodeDataUrl(dataUrl);
            } catch (error) {
                console.error('Error generating QR code:', error);
            }
        };

        if (isOpen && invoiceData.invoiceRefNo) {
            generateQRCode();
        }
    }, [isOpen, invoiceData.invoiceRefNo, invoiceData.sellerNTNCNIC, invoiceData.totalAmount, invoiceData.invoiceDate]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const calculateTaxSummary = () => {
        const summary = {
            subtotal: 0,
            totalTax: 0,
            total: invoiceData.totalAmount
        };

        invoiceData.items.forEach(item => {
            summary.subtotal += item.value_sales_excluding_st || 0;
            summary.totalTax += item.sales_tax || 0;
        });

        return summary;
    };

    const taxSummary = calculateTaxSummary();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Invoice Preview
                    </DialogTitle>
                </DialogHeader>

                {/* Invoice Preview Content */}
                <div className="bg-white border rounded-lg p-8 space-y-6" id="invoice-preview">
                    {/* Header with FBR Logo */}
                    <div className="flex justify-between items-start border-b pb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {invoiceData.invoiceType}
                            </h1>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Invoice No:</strong> {invoiceData.invoiceRefNo}</p>
                                <p><strong>Date:</strong> {format(new Date(invoiceData.invoiceDate), 'PPP')}</p>
                                <p><strong>Time:</strong> {format(new Date(), 'HH:mm:ss')}</p>
                                {invoiceData.scenarioId && (
                                    <p><strong>Scenario ID:</strong> {invoiceData.scenarioId}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            {/* Official FBR Logo */}
                            <div className="w-32 h-16 flex items-center justify-center mb-2">
                                <img
                                    src="https://fbrstapp.com/fbrlogo1.svg"
                                    alt="FBR Logo"
                                    className="h-12 w-auto object-contain"
                                    onError={(e) => {
                                        // Fallback to placeholder if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <div className="w-32 h-16 bg-gray-100 border rounded flex items-center justify-center hidden">
                                    <span className="text-xs text-gray-500 font-semibold">FBR LOGO</span>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                FBR Compliant
                            </Badge>
                        </div>
                    </div>

                    {/* Seller and Buyer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Seller Information */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Seller Information
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>NTN/CNIC:</strong> {invoiceData.sellerNTNCNIC}</p>
                                <p><strong>Business Name:</strong> {invoiceData.sellerBusinessName}</p>
                                <p><strong>Province:</strong> {invoiceData.sellerProvince}</p>
                                <p><strong>Address:</strong> {invoiceData.sellerAddress}</p>
                            </div>
                        </div>

                        {/* Buyer Information */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Buyer Information
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>NTN/CNIC:</strong> {invoiceData.buyerNTNCNIC}</p>
                                <p><strong>Business Name:</strong> {invoiceData.buyerBusinessName}</p>
                                <p><strong>Province:</strong> {invoiceData.buyerProvince}</p>
                                <p><strong>Address:</strong> {invoiceData.buyerAddress}</p>
                                <p><strong>Registration Type:</strong> {invoiceData.buyerRegistrationType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="border rounded-lg">
                        <h3 className="font-semibold text-gray-900 p-4 border-b flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Itemized List
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-3 font-medium">Item</th>
                                        <th className="text-left p-3 font-medium">HS Code</th>
                                        <th className="text-right p-3 font-medium">Qty</th>
                                        <th className="text-right p-3 font-medium">Unit Price</th>
                                        <th className="text-right p-3 font-medium">Tax Rate</th>
                                        <th className="text-right p-3 font-medium">Tax Amount</th>
                                        <th className="text-right p-3 font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.items.map((item, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium">{item.item_name}</p>
                                                    <p className="text-xs text-gray-500">UOM: {item.uom_code}</p>
                                                    {item.invoice_note && (
                                                        <p className="text-xs text-gray-500 mt-1">{item.invoice_note}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm">{item.hs_code}</td>
                                            <td className="p-3 text-right">{item.quantity.toLocaleString()}</td>
                                            <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                                            <td className="p-3 text-right">{item.tax_rate}%</td>
                                            <td className="p-3 text-right">{formatCurrency(item.sales_tax || 0)}</td>
                                            <td className="p-3 text-right font-medium">{formatCurrency(item.total_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tax Summary */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Tax Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal (Excluding Tax):</span>
                                <span>{formatCurrency(taxSummary.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Sales Tax:</span>
                                <span>{formatCurrency(taxSummary.totalTax)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold text-lg">
                                <span>Total Amount:</span>
                                <span>{formatCurrency(taxSummary.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoiceData.notes && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                            <p className="text-sm text-gray-600">{invoiceData.notes}</p>
                        </div>
                    )}

                    {/* Footer with QR Code */}
                    <div className="flex justify-between items-end border-t pt-4">
                        <div className="text-xs text-gray-500">
                            <p>Generated by BetterBooks</p>
                            <p>FBR Compliant Invoice</p>
                        </div>
                        <div className="text-center">
                            {qrCodeDataUrl ? (
                                <div className="flex flex-col items-center">
                                    <img
                                        src={qrCodeDataUrl}
                                        alt="FBR QR Code"
                                        className="w-24 h-24 border"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">FBR QR Code</p>
                                </div>
                            ) : (
                                <div className="w-24 h-24 border flex items-center justify-center">
                                    <QrCode className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center items-center pt-4 border-t">
                    <Button
                        onClick={onDownloadPDF}
                        disabled={isGeneratingPDF}
                        className="flex items-center gap-2"
                    >
                        {isGeneratingPDF ? (
                            <>
                                <LoadingSpinner />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
