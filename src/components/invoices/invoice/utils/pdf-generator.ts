import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface InvoiceData {
  invoiceCode: string;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  paymentType: "Cash" | "Bank Transfer" | "Cheque";
  status: "Draft" | "Partially Paid" | "Pending" | "Paid";
  franchise: string;
  createdBy: string;
  signedBy: string;
  signatureDate: string;
  notes: string;
  signature?: File | string | null;
}

export async function generateInvoicePDF(
  invoiceData: InvoiceData,
  franchiseName: string,
  signatureUrl?: string
): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

  const { width, height } = page.getSize();

  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.9, 0.9, 0.9);
  const white = rgb(1, 1, 1);

  // Helper function to format currency
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num)
      ? "Nrs 0.00"
      : `Nrs ${num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  };

  // Starting positions
  let currentY = height - 50;

  // Company Header Section
  // Company name
  page.drawText("YDM", {
    x: 50,
    y: currentY,
    size: 24,
    font: boldFont,
    color: black,
  });

  currentY -= 30;

  // Company tagline
  page.drawText("PROFESSIONAL BUSINESS SERVICES", {
    x: 50,
    y: currentY,
    size: 10,
    font: boldFont,
    color: gray,
  });

  currentY -= 25;

  // Company details
  const companyDetails = [
    "Kathmandu, Nepal",
    "Phone: +977-981-3492594",
    "Email: ydmnepal@gmail.com",
  ];

  companyDetails.forEach((detail) => {
    page.drawText(detail, {
      x: 50,
      y: currentY,
      size: 9,
      font: regularFont,
      color: gray,
    });
    currentY -= 15;
  });

  // Invoice header box (top right)
  const invoiceBoxX = width - 200;
  const invoiceBoxY = height - 50;
  const invoiceBoxWidth = 150;
  const invoiceBoxHeight = 80;

  // Draw invoice box border
  page.drawRectangle({
    x: invoiceBoxX,
    y: invoiceBoxY - invoiceBoxHeight,
    width: invoiceBoxWidth,
    height: invoiceBoxHeight,
    borderColor: black,
    borderWidth: 2,
  });

  // INVOICE title
  page.drawText("INVOICE", {
    x: invoiceBoxX + 35,
    y: invoiceBoxY - 25,
    size: 16,
    font: boldFont,
    color: black,
  });

  // Invoice code
  page.drawText(invoiceData.invoiceCode || "INV-XXXX-XXX", {
    x: invoiceBoxX + 10,
    y: invoiceBoxY - 45,
    size: 10,
    font: regularFont,
    color: black,
  });

  // Status
  page.drawText(invoiceData.status.toUpperCase(), {
    x: invoiceBoxX + 10,
    y: invoiceBoxY - 65,
    size: 8,
    font: boldFont,
    color: gray,
  });

  // Draw header separator line
  currentY = height - 180;
  page.drawLine({
    start: { x: 50, y: currentY },
    end: { x: width - 50, y: currentY },
    thickness: 3,
    color: black,
  });

  currentY -= 30;

  // Invoice To Section
  page.drawText("INVOICE TO", {
    x: 50,
    y: currentY,
    size: 12,
    font: boldFont,
    color: black,
  });

  // Draw underline for Invoice To
  page.drawLine({
    start: { x: 50, y: currentY - 5 },
    end: { x: 150, y: currentY - 5 },
    thickness: 2,
    color: gray,
  });

  currentY -= 25;

  page.drawText(franchiseName || "Franchise Name", {
    x: 50,
    y: currentY,
    size: 14,
    font: boldFont,
    color: black,
  });

  // Invoice Details Section (right side)
  const detailsX = width - 250;
  let detailsY = currentY + 25;

  page.drawText("INVOICE DETAILS", {
    x: detailsX,
    y: detailsY,
    size: 12,
    font: boldFont,
    color: black,
  });

  // Draw underline for Invoice Details
  page.drawLine({
    start: { x: detailsX, y: detailsY - 5 },
    end: { x: detailsX + 120, y: detailsY - 5 },
    thickness: 2,
    color: gray,
  });

  detailsY -= 25;

  // Invoice date
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  page.drawText("Invoice Date:", {
    x: detailsX,
    y: detailsY,
    size: 9,
    font: regularFont,
    color: gray,
  });

  page.drawText(currentDate, {
    x: detailsX + 80,
    y: detailsY,
    size: 9,
    font: boldFont,
    color: black,
  });

  detailsY -= 20;

  // Payment type
  page.drawText("Payment Type:", {
    x: detailsX,
    y: detailsY,
    size: 9,
    font: regularFont,
    color: gray,
  });

  page.drawText(invoiceData.paymentType, {
    x: detailsX + 80,
    y: detailsY,
    size: 9,
    font: boldFont,
    color: black,
  });

  // Payment Summary Section
  currentY -= 80;

  // Background for payment summary
  const summaryBoxHeight = 120;
  page.drawRectangle({
    x: 50,
    y: currentY - summaryBoxHeight,
    width: width - 100,
    height: summaryBoxHeight,
    color: lightGray,
    borderColor: gray,
    borderWidth: 1,
  });

  currentY -= 20;

  page.drawText("PAYMENT SUMMARY", {
    x: 70,
    y: currentY,
    size: 12,
    font: boldFont,
    color: black,
  });

  currentY -= 30;

  // Total amount
  page.drawText("TOTAL AMOUNT", {
    x: 70,
    y: currentY,
    size: 12,
    font: boldFont,
    color: black,
  });

  const totalAmountText = formatCurrency(invoiceData.totalAmount);
  page.drawText(totalAmountText, {
    x: width - 200,
    y: currentY,
    size: 16,
    font: boldFont,
    color: black,
  });

  // Draw line under total amount
  page.drawLine({
    start: { x: 70, y: currentY - 10 },
    end: { x: width - 70, y: currentY - 10 },
    thickness: 2,
    color: gray,
  });

  currentY -= 35;

  // Amount paid (if any)
  if (invoiceData.paidAmount && parseFloat(invoiceData.paidAmount) > 0) {
    page.drawText("AMOUNT PAID", {
      x: 70,
      y: currentY,
      size: 10,
      font: boldFont,
      color: gray,
    });

    const paidAmountText = formatCurrency(invoiceData.paidAmount);
    page.drawText(paidAmountText, {
      x: width - 200,
      y: currentY,
      size: 12,
      font: boldFont,
      color: black,
    });

    currentY -= 25;
  }

  // Amount due (if any)
  if (invoiceData.dueAmount && parseFloat(invoiceData.dueAmount) > 0) {
    page.drawText("AMOUNT DUE", {
      x: 70,
      y: currentY,
      size: 12,
      font: boldFont,
      color: black,
    });

    const dueAmountText = formatCurrency(invoiceData.dueAmount);
    page.drawText(dueAmountText, {
      x: width - 200,
      y: currentY,
      size: 14,
      font: boldFont,
      color: black,
    });

    // Draw border around amount due
    page.drawRectangle({
      x: 60,
      y: currentY - 10,
      width: width - 120,
      height: 30,
      borderColor: black,
      borderWidth: 2,
    });
  }

  currentY -= 60;

  // Notes section (if any)
  if (invoiceData.notes) {
    page.drawText("ADDITIONAL NOTES", {
      x: 50,
      y: currentY,
      size: 12,
      font: boldFont,
      color: black,
    });

    // Draw underline
    page.drawLine({
      start: { x: 50, y: currentY - 5 },
      end: { x: 180, y: currentY - 5 },
      thickness: 2,
      color: gray,
    });

    currentY -= 25;

    // Notes box
    const notesBoxHeight = 60;
    page.drawRectangle({
      x: 50,
      y: currentY - notesBoxHeight,
      width: width - 100,
      height: notesBoxHeight,
      borderColor: gray,
      borderWidth: 1,
    });

    // Split notes into lines and draw
    const maxWidth = width - 120;
    const words = invoiceData.notes.split(" ");
    let line = "";
    let lineY = currentY - 20;

    words.forEach((word) => {
      const testLine = line + word + " ";
      const testWidth = regularFont.widthOfTextAtSize(testLine, 10);

      if (testWidth > maxWidth && line !== "") {
        page.drawText(line.trim(), {
          x: 60,
          y: lineY,
          size: 10,
          font: regularFont,
          color: gray,
        });
        line = word + " ";
        lineY -= 15;
      } else {
        line = testLine;
      }
    });

    // Draw remaining text
    if (line.trim() !== "") {
      page.drawText(line.trim(), {
        x: 60,
        y: lineY,
        size: 10,
        font: regularFont,
        color: gray,
      });
    }

    currentY -= notesBoxHeight + 20;
  }

  // Signature section (if signature exists)
  if (signatureUrl) {
    try {
      // Fetch bytes for both data: URLs and blob/object URLs
      const response = await fetch(signatureUrl);
      if (!response.ok) {
        throw new Error(`Signature URL returned status ${response.status}`);
      }

      const contentType = (
        response.headers.get("Content-Type") || ""
      ).toLowerCase();

      if (!contentType.includes("image/")) {
        throw new Error(`Fetched URL is not an image (Content-Type: ${contentType})`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const signatureBytes = new Uint8Array(arrayBuffer);

      let signatureImage;
      const isPng =
        contentType.includes("image/png") ||
        signatureUrl.startsWith("data:image/png");

      if (isPng) {
        signatureImage = await pdfDoc.embedPng(signatureBytes);
      } else {
        // Default to JPG/JPEG when not clearly PNG
        signatureImage = await pdfDoc.embedJpg(signatureBytes);
      }

      if (signatureImage) {
        const signatureDims = signatureImage.scale(0.3);

        // Draw signature separator line
        page.drawLine({
          start: { x: 50, y: currentY },
          end: { x: width - 50, y: currentY },
          thickness: 2,
          color: gray,
        });

        currentY -= 30;

        // Draw signature
        page.drawImage(signatureImage, {
          x: 50,
          y: currentY - signatureDims.height,
          width: signatureDims.width,
          height: signatureDims.height,
        });

        currentY -= signatureDims.height + 10;

        // Signature line
        page.drawLine({
          start: { x: 50, y: currentY },
          end: { x: 250, y: currentY },
          thickness: 2,
          color: black,
        });

        currentY -= 30;
      }
    } catch (error) {
      console.error("Error embedding signature:", error);
    }
  }

  // Footer
  const footerY = 50;
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: footerY + 20,
    color: lightGray,
  });

  page.drawLine({
    start: { x: 0, y: footerY + 20 },
    end: { x: width, y: footerY + 20 },
    thickness: 2,
    color: gray,
  });

  const footerText =
    "Thank you for your business. For questions regarding this invoice, please contact us immediately.";
  const footerTextWidth = regularFont.widthOfTextAtSize(footerText, 10);

  page.drawText(footerText, {
    x: (width - footerTextWidth) / 2,
    y: footerY / 2,
    size: 10,
    font: regularFont,
    color: gray,
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Usage function to download the PDF
export async function downloadInvoicePDF(
  invoiceData: InvoiceData,
  franchiseName: string,
  signatureUrl?: string
) {
  try {
    const pdfBytes = await generateInvoicePDF(
      invoiceData,
      franchiseName,
      signatureUrl
    );

    // Create blob and download (ensure proper ArrayBuffer slice for TS types)
    const ab = new ArrayBuffer(pdfBytes.length);
    new Uint8Array(ab).set(pdfBytes);
    const blob = new Blob([ab], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${invoiceData.invoiceCode || "draft"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
