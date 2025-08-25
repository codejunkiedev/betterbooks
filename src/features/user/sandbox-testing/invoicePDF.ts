import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ScenarioInvoiceFormData } from '@/shared/types/invoice';
import { format } from 'date-fns';

export interface PDFGenerationOptions {
    quality?: number;
    scale?: number;
    retryAttempts?: number;
}

export class InvoicePDFGenerator {
    private static readonly DEFAULT_OPTIONS: PDFGenerationOptions = {
        quality: 1,
        scale: 2,
        retryAttempts: 3
    };

    /**
     * Generate PDF from invoice preview element
     */
    static async generatePDF(
        invoiceData: ScenarioInvoiceFormData,
        options: PDFGenerationOptions = {}
    ): Promise<Blob> {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= opts.retryAttempts; attempt++) {
            try {
                return await this.generatePDFAttempt(invoiceData, opts);
            } catch (error) {
                lastError = error as Error;
                console.warn(`PDF generation attempt ${attempt} failed:`, error);

                if (attempt < opts.retryAttempts) {
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        throw new Error(`PDF generation failed after ${opts.retryAttempts} attempts: ${lastError?.message}`);
    }

    /**
     * Single attempt at PDF generation
     */
    private static async generatePDFAttempt(
        invoiceData: ScenarioInvoiceFormData,
        options: PDFGenerationOptions
    ): Promise<Blob> {
        // Create a temporary container for the invoice
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '800px';
        container.style.backgroundColor = 'white';
        container.style.padding = '40px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.fontSize = '12px';
        container.style.lineHeight = '1.4';

        document.body.appendChild(container);

        try {
            // Generate the invoice HTML
            container.innerHTML = this.generateInvoiceHTML(invoiceData);

            // Convert to canvas
            const canvas = await html2canvas(container, {
                scale: options.scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 800,
                height: container.scrollHeight,
                scrollX: 0,
                scrollY: 0
            });

            // Convert canvas to PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            // Add first page
            pdf.addImage(
                canvas.toDataURL('image/jpeg', options.quality),
                'JPEG',
                0,
                position,
                imgWidth,
                imgHeight
            );
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(
                    canvas.toDataURL('image/jpeg', options.quality),
                    'JPEG',
                    0,
                    position,
                    imgWidth,
                    imgHeight
                );
                heightLeft -= pageHeight;
            }

            return pdf.output('blob');
        } finally {
            // Clean up
            document.body.removeChild(container);
        }
    }

    /**
     * Generate HTML content for the invoice
     */
    private static generateInvoiceHTML(invoiceData: ScenarioInvoiceFormData): string {
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

        return `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
                    <div style="flex: 1;">
                        <h1 style="font-size: 28px; font-weight: bold; color: #333; margin: 0 0 15px 0;">
                            ${invoiceData.invoiceType}
                        </h1>
                        <div style="font-size: 14px; color: #666; line-height: 1.6;">
                            <p style="margin: 5px 0;"><strong>Invoice No:</strong> ${invoiceData.invoiceRefNo}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${format(new Date(invoiceData.invoiceDate), 'PPP')}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${format(new Date(), 'HH:mm:ss')}</p>
                            ${invoiceData.scenarioId ? `<p style="margin: 5px 0;"><strong>Scenario ID:</strong> ${invoiceData.scenarioId}</p>` : ''}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="width: 120px; height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                            <img 
                                src="https://fbrstapp.com/fbrlogo1.svg" 
                                alt="FBR Logo" 
                                style="height: 48px; width: auto; object-fit: contain;"
                            />
                        </div>
                        <div style="font-size: 12px; color: #666; border: 1px solid #ccc; padding: 5px 10px; display: inline-block;">
                            FBR Compliant
                        </div>
                    </div>
                </div>

                <!-- Seller and Buyer Information -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <!-- Seller Information -->
                    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                        <h3 style="font-size: 16px; font-weight: bold; color: #333; margin: 0 0 15px 0; display: flex; align-items: center;">
                            <span style="margin-right: 8px;">🏢</span>
                            Seller Information
                        </h3>
                        <div style="font-size: 13px; line-height: 1.6;">
                            <p style="margin: 8px 0;"><strong>NTN/CNIC:</strong> ${invoiceData.sellerNTNCNIC}</p>
                            <p style="margin: 8px 0;"><strong>Business Name:</strong> ${invoiceData.sellerBusinessName}</p>
                            <p style="margin: 8px 0;"><strong>Province:</strong> ${invoiceData.sellerProvince}</p>
                            <p style="margin: 8px 0;"><strong>Address:</strong> ${invoiceData.sellerAddress}</p>
                        </div>
                    </div>

                    <!-- Buyer Information -->
                    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                        <h3 style="font-size: 16px; font-weight: bold; color: #333; margin: 0 0 15px 0; display: flex; align-items: center;">
                            <span style="margin-right: 8px;">👤</span>
                            Buyer Information
                        </h3>
                        <div style="font-size: 13px; line-height: 1.6;">
                            <p style="margin: 8px 0;"><strong>NTN/CNIC:</strong> ${invoiceData.buyerNTNCNIC}</p>
                            <p style="margin: 8px 0;"><strong>Business Name:</strong> ${invoiceData.buyerBusinessName}</p>
                            <p style="margin: 8px 0;"><strong>Province:</strong> ${invoiceData.buyerProvince}</p>
                            <p style="margin: 8px 0;"><strong>Address:</strong> ${invoiceData.buyerAddress}</p>
                            <p style="margin: 8px 0;"><strong>Registration Type:</strong> ${invoiceData.buyerRegistrationType}</p>
                        </div>
                    </div>
                </div>

                <!-- Invoice Items -->
                <div style="border: 1px solid #ddd; border-radius: 8px; margin-bottom: 30px;">
                    <h3 style="font-size: 16px; font-weight: bold; color: #333; margin: 0; padding: 20px; border-bottom: 1px solid #ddd; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">📦</span>
                        Itemized List
                    </h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                            <thead style="background-color: #f8f9fa;">
                                <tr>
                                    <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold;">Item</th>
                                    <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold;">HS Code</th>
                                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold;">Qty</th>
                                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold;">Unit Price</th>
                                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold;">Tax Rate</th>
                                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold;">Tax Amount</th>
                                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoiceData.items.map((item, index) => `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 12px;">
                                            <div>
                                                <p style="font-weight: bold; margin: 0 0 5px 0;">${item.item_name}</p>
                                                <p style="font-size: 11px; color: #666; margin: 0 0 5px 0;">UOM: ${item.uom_code}</p>
                                                ${item.invoice_note ? `<p style="font-size: 11px; color: #666; margin: 0;">${item.invoice_note}</p>` : ''}
                                            </div>
                                        </td>
                                        <td style="padding: 12px; font-size: 11px;">${item.hs_code}</td>
                                        <td style="padding: 12px; text-align: right;">${item.quantity.toLocaleString()}</td>
                                        <td style="padding: 12px; text-align: right;">${formatCurrency(item.unit_price)}</td>
                                        <td style="padding: 12px; text-align: right;">${item.tax_rate}%</td>
                                        <td style="padding: 12px; text-align: right;">${formatCurrency(item.sales_tax || 0)}</td>
                                        <td style="padding: 12px; text-align: right; font-weight: bold;">${formatCurrency(item.total_amount)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Tax Summary -->
                <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="font-size: 16px; font-weight: bold; color: #333; margin: 0 0 15px 0; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">🧮</span>
                        Tax Summary
                    </h3>
                    <div style="font-size: 13px; line-height: 1.8;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Subtotal (Excluding Tax):</span>
                            <span>${formatCurrency(taxSummary.subtotal)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Total Sales Tax:</span>
                            <span>${formatCurrency(taxSummary.totalTax)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 10px; font-weight: bold; font-size: 16px;">
                            <span>Total Amount:</span>
                            <span>${formatCurrency(taxSummary.total)}</span>
                        </div>
                    </div>
                </div>

                ${invoiceData.notes ? `
                    <!-- Notes -->
                    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <h3 style="font-size: 16px; font-weight: bold; color: #333; margin: 0 0 15px 0;">Notes</h3>
                        <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0;">${invoiceData.notes}</p>
                    </div>
                ` : ''}

                <!-- Footer -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #ddd; padding-top: 20px;">
                    <div style="font-size: 11px; color: #999;">
                        <p style="margin: 5px 0;">Generated by BetterBooks</p>
                        <p style="margin: 5px 0;">FBR Compliant Invoice</p>
                    </div>
                    <div style="text-align: center;">
                        <div style="width: 80px; height: 80px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa;">
                            <span style="font-size: 10px; color: #999;">QR Code</span>
                        </div>
                        <p style="font-size: 10px; color: #999; margin: 5px 0 0 0;">FBR QR Code</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate filename for the PDF
     */
    static generateFilename(invoiceData: ScenarioInvoiceFormData): string {
        const date = format(new Date(invoiceData.invoiceDate), 'yyyy-MM-dd');
        return `Invoice_${invoiceData.invoiceRefNo}_${date}.pdf`;
    }

    /**
     * Download PDF with automatic retry
     */
    static async downloadPDF(
        invoiceData: ScenarioInvoiceFormData,
        options: PDFGenerationOptions = {}
    ): Promise<void> {
        try {
            const pdfBlob = await this.generatePDF(invoiceData, options);
            const filename = this.generateFilename(invoiceData);

            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF download failed:', error);
            throw new Error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
