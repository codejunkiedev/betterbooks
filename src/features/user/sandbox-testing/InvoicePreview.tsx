import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/components/Dialog';
import { formatDate } from '@/shared/utils/formatters';
import { InvoiceFormData } from '@/shared/types/invoice';
import { Building2, User, Package, Calculator, QrCode, Download } from 'lucide-react';
import { InvoicePDFGenerator } from './invoicePDF';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface InvoicePreviewProps {
    invoiceData: InvoiceFormData;
    isOpen?: boolean;
    onClose?: () => void;
}

export function InvoicePreview({ invoiceData, isOpen = false, onClose }: InvoicePreviewProps) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

    useEffect(() => {
        if (isOpen && invoiceData) {
            generateQRCode();
        }
    }, [isOpen, invoiceData]);

    const generateQRCode = async () => {
        try {
            const totalAmount = invoiceData.items.reduce((sum, item) => sum + item.total_amount, 0);
            const qrData = {
                invoiceNumber: invoiceData.invoiceRefNo,
                sellerNTN: invoiceData.sellerNTNCNIC,
                totalAmount: totalAmount,
                date: invoiceData.invoiceDate,
                fbr: "FBR"
            };

            const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
                width: 80,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            setQrCodeDataUrl(qrCodeDataUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatPercentage = (rate: number) => {
        return `${rate.toFixed(2)}%`;
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
        <Dialog open={isOpen} onOpenChange={onClose || (() => { })}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] w-[800px] h-[600px] p-0 overflow-hidden">
                <DialogTitle className="sr-only">Invoice Preview</DialogTitle>
                <DialogDescription className="sr-only">Preview of the invoice before submission</DialogDescription>
                {/* Scrollable Invoice Content */}
                <div className="h-full overflow-y-auto pb-16" id="invoice-preview">
                    <div className="p-6">
                        {/* Header with FBR Logo */}
                        <div className="flex justify-between items-start border-b pb-4 mb-6">
                            <div className="flex-1">
                                <h1 className="text-xl font-bold text-gray-900 mb-2">
                                    {invoiceData.invoiceType}
                                </h1>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p><strong>Invoice No:</strong> {invoiceData.invoiceRefNo || ''}</p>
                                    <p><strong>Date:</strong> {formatDate(invoiceData.invoiceDate)}</p>
                                    <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                                    {invoiceData.scenarioId && (
                                        <p><strong>Scenario ID:</strong> {invoiceData.scenarioId}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                {/* Official FBR Logo */}
                                <div className="w-24 h-12 flex items-center justify-center mb-2">
                                    <img
                                        src="https://fbrstapp.com/fbrlogo1.svg"
                                        alt="FBR Logo"
                                        className="h-8 w-auto object-contain"
                                        onError={(e) => {
                                            // Fallback to placeholder if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                    <div className="w-24 h-12 bg-gray-100 border rounded flex items-center justify-center hidden">
                                        <span className="text-xs text-gray-500 font-semibold">FBR LOGO</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    FBR Compliant
                                </Badge>
                            </div>
                        </div>

                        {/* Seller and Buyer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Seller Information */}
                            <div className="border rounded-lg p-3">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                    <Building2 className="h-3 w-3" />
                                    Seller Information
                                </h3>
                                <div className="space-y-1 text-xs">
                                    <p><strong>NTN/CNIC:</strong> {invoiceData.sellerNTNCNIC}</p>
                                    <p><strong>Business Name:</strong> {invoiceData.sellerBusinessName}</p>
                                    <p><strong>Province:</strong> {invoiceData.sellerProvince}</p>
                                    <p><strong>Address:</strong> {invoiceData.sellerAddress}</p>
                                </div>
                            </div>

                            {/* Buyer Information */}
                            <div className="border rounded-lg p-3">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                    <User className="h-3 w-3" />
                                    Buyer Information
                                </h3>
                                <div className="space-y-1 text-xs">
                                    <p><strong>NTN/CNIC:</strong> {invoiceData.buyerNTNCNIC}</p>
                                    <p><strong>Business Name:</strong> {invoiceData.buyerBusinessName}</p>
                                    <p><strong>Province:</strong> {invoiceData.buyerProvince}</p>
                                    <p><strong>Address:</strong> {invoiceData.buyerAddress}</p>
                                    <p><strong>Registration Type:</strong> {invoiceData.buyerRegistrationType}</p>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="border rounded-lg mb-6">
                            <h3 className="font-semibold text-gray-900 p-3 border-b flex items-center gap-2 text-sm">
                                <Package className="h-3 w-3" />
                                Itemized List
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left p-2 font-medium">Item</th>
                                            <th className="text-left p-2 font-medium">HS Code</th>
                                            <th className="text-right p-2 font-medium">Qty</th>
                                            <th className="text-right p-2 font-medium">Unit Price</th>
                                            <th className="text-right p-2 font-medium">Tax Rate</th>
                                            <th className="text-right p-2 font-medium">Tax Amount</th>
                                            <th className="text-right p-2 font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceData.items.map((item, index) => (
                                            <tr key={index} className="border-t">
                                                <td className="p-2">
                                                    <div>
                                                        <p className="font-medium text-xs">{item.item_name}</p>
                                                        <p className="text-xs text-gray-500">UOM: {item.uom_code}</p>
                                                    </div>
                                                </td>
                                                <td className="p-2 text-xs">{item.hs_code}</td>
                                                <td className="p-2 text-right text-xs">{item.quantity.toLocaleString()}</td>
                                                <td className="p-2 text-right text-xs">{formatCurrency(item.unit_price)}</td>
                                                <td className="p-2 text-right text-xs">{formatPercentage(item.tax_rate)}</td>
                                                <td className="p-2 text-right text-xs">{formatCurrency(item.sales_tax)}</td>
                                                <td className="p-2 text-right font-medium text-xs">{formatCurrency(item.total_amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tax Summary */}
                        <div className="border rounded-lg p-3 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                <Calculator className="h-3 w-3" />
                                Tax Summary
                            </h3>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span>Subtotal (Excluding Tax):</span>
                                    <span>{formatCurrency(taxSummary.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Sales Tax:</span>
                                    <span>{formatCurrency(taxSummary.totalTax)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 font-semibold text-sm">
                                    <span>Total Amount:</span>
                                    <span>{formatCurrency(taxSummary.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoiceData.notes && (
                            <div className="border rounded-lg p-3 mb-6">
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Notes</h3>
                                <p className="text-xs text-gray-600">{invoiceData.notes}</p>
                            </div>
                        )}

                        {/* Footer with QR Code */}
                        <div className="flex justify-between items-end border-t pt-3">
                            <div className="text-xs text-gray-500">
                                <p>Generated by BetterBooks</p>
                                <p>FBR Compliant Invoice</p>
                            </div>
                            <div className="text-center">
                                {qrCodeDataUrl ? (
                                    <div className="w-16 h-16 flex items-center justify-center">
                                        <img
                                            src={qrCodeDataUrl}
                                            alt="FBR QR Code"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 border flex items-center justify-center">
                                        <QrCode className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">FBR QR Code</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Download Button at Bottom */}
                <div className="border-t bg-gray-50 p-3 flex justify-center absolute bottom-0 left-0 right-0">
                    <Button
                        className="flex items-center gap-2"
                        onClick={() => InvoicePDFGenerator.downloadPDF(invoiceData)}
                    >
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
