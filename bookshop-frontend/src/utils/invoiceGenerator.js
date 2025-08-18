import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (orderData, customerInfo, orderItems) => {
    try {
        // Create new PDF instance
        const doc = new jsPDF();

        // Test if autoTable is available
        if (typeof autoTable !== "function") {
            console.error("autoTable is not available as a function");
            throw new Error("autoTable plugin not properly loaded");
        }

        // Set up colors
        const primaryColor = [251, 191, 36];

        const secondaryColor = [55, 65, 81];
        const lightGray = [243, 244, 246];
        const darkGray = [107, 114, 128];

        // Page dimensions
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Header Section with gradient-like effect
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 45, "F");

        // Company Logo/Name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("Pahana Edu Bookshop", 20, 28);

        // Invoice Title
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("INVOICE", pageWidth - 20, 28, { align: "right" });

        // Reset text color for document body
        doc.setTextColor(...secondaryColor);

        // Invoice Info Box
        doc.setFillColor(248, 250, 252);
        doc.rect(15, 55, pageWidth - 30, 35, "F");
        doc.setDrawColor(229, 231, 235);
        doc.rect(15, 55, pageWidth - 30, 35, "S");

        // Invoice Details
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const currentDate = new Date().toLocaleDateString();

        // Handle missing order data with better fallbacks
        const orderNumber =
            orderData?.orderNumber ||
            orderData?.orderId ||
            orderData?.id ||
            `INV-${Date.now()}`;
        const orderId =
            orderData?.orderId || orderData?.id || `ORD-${Date.now()}`;

        doc.text(`Invoice #: ${orderNumber}`, 20, 67);
        doc.text(`Date: ${currentDate}`, 20, 76);
        doc.text(`Order ID: ${orderId}`, 20, 85);

        // Customer and Company Information Section
        const infoStartY = 105;

        // Customer Information (Bill To)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Bill To:", 20, infoStartY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        if (customerInfo && Object.keys(customerInfo).length > 0) {
            const fullName =
                `${customerInfo.firstName || ""} ${
                    customerInfo.lastName || ""
                }`.trim() || "N/A";
            doc.text(fullName, 20, infoStartY + 12);
            doc.text(customerInfo.email || "N/A", 20, infoStartY + 22);
            doc.text(customerInfo.phone || "N/A", 20, infoStartY + 32);

            // Address formatting
            const address = customerInfo.address || "N/A";
            const cityStateZip = `${customerInfo.city || ""}, ${
                customerInfo.state || ""
            } ${customerInfo.zipCode || ""}`.trim();
            const country = customerInfo.country || "United States";

            doc.text(address, 20, infoStartY + 42);
            doc.text(cityStateZip, 20, infoStartY + 52);
            doc.text(country, 20, infoStartY + 62);
        } else {
            doc.text("Customer information not available", 20, infoStartY + 12);
        }

        // Company Information (Ship From)
        const companyStartX = pageWidth / 2 + 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Ship From:", companyStartX, infoStartY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Pahana Edu Bookshop Inc.", companyStartX, infoStartY + 12);
        doc.text("123 Book Street", companyStartX, infoStartY + 22);
        doc.text("Colombo", companyStartX, infoStartY + 32);
        doc.text("Sri Lanka", companyStartX, infoStartY + 42);
        doc.text("Phone: +94 76 527 4750", companyStartX, infoStartY + 52);
        doc.text("Email: pahanaedu@gmail.com", companyStartX, infoStartY + 62);

        // Items Table
        const tableStartY = 185;
        const tableStartX = 15;

        // Prepare table data with better formatting
        const tableData =
            orderItems && orderItems.length > 0
                ? orderItems.map((item) => [
                      item.title || "Book Item",
                      item.author || "Unknown Author",
                      (item.quantity || 1).toString(),
                      `$${(item.price || 0).toFixed(2)}`,
                      `$${((item.price || 0) * (item.quantity || 1)).toFixed(
                          2
                      )}`,
                  ])
                : [["Sample Book", "Sample Author", "1", "$29.99", "$29.99"]];

        // Calculate totals with proper logic
        const subtotal =
            orderItems && orderItems.length > 0
                ? orderItems.reduce(
                      (sum, item) =>
                          sum + (item.price || 0) * (item.quantity || 1),
                      0
                  )
                : orderData?.subtotal || 29.99;

        const taxRate = 0.08;
        const tax = orderData?.tax || subtotal * taxRate;
        const shipping =
            orderData?.shipping !== undefined
                ? orderData.shipping
                : subtotal > 50
                ? 0
                : 9.99;
        const total = orderData?.total || subtotal + tax + shipping;

        // Add table with improved styling
        autoTable(doc, {
            startY: tableStartY,
            head: [["Book Title", "Author", "Qty", "Price", "Total"]],
            body: tableData,
            theme: "striped",
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontSize: 11,
                fontStyle: "bold",
                halign: "center",
            },
            bodyStyles: {
                fontSize: 10,
                textColor: secondaryColor,
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251],
            },
            margin: { left: 15, right: 15 },
            columnStyles: {
                0: { cellWidth: 65, halign: "left" },
                1: { cellWidth: 55, halign: "left" },
                2: { cellWidth: 20, halign: "center" },
                3: { cellWidth: 25, halign: "right" },
                4: { cellWidth: 25, halign: "right" },
            },
            styles: {
                lineColor: [229, 231, 235],
                lineWidth: 0.5,
            },
            // Add page break support
            showHead: "everyPage",
            pageBreak: "auto",
            pageBreakBefore: function (cursor, doc) {
                // Check if there's enough space for summary section (at least 80 units)
                return cursor.y + 80 > pageHeight - 30;
            },
        });

        // Get the final Y position after the table
        const finalY = doc.lastAutoTable
            ? doc.lastAutoTable.finalY + 15
            : tableStartY + 100;

        // Check if we need a new page for the summary section
        const summaryHeight = 70; // Approximate height needed for summary
        if (finalY + summaryHeight > pageHeight - 30) {
            doc.addPage();
            const newFinalY = 20; // Start near top of new page

            // Summary Section with better alignment
            const summaryStartX = pageWidth - 85;
            const summaryWidth = 70;

            // Summary background
            doc.setFillColor(248, 250, 252);
            doc.rect(summaryStartX - 5, newFinalY - 5, summaryWidth, 50, "F");
            doc.setDrawColor(229, 231, 235);
            doc.rect(summaryStartX - 5, newFinalY - 5, summaryWidth, 50, "S");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            // Subtotal
            doc.text("Subtotal:", summaryStartX, newFinalY + 5);
            doc.text(
                `$${subtotal.toFixed(2)}`,
                summaryStartX + summaryWidth - 10,
                newFinalY + 5,
                { align: "right" }
            );

            doc.text(
                `Tax (${(taxRate * 100).toFixed(0)}%):`,
                summaryStartX,
                newFinalY + 15
            );
            doc.text(
                `$${tax.toFixed(2)}`,
                summaryStartX + summaryWidth - 10,
                newFinalY + 15,
                { align: "right" }
            );

            // Shipping
            doc.text("Shipping:", summaryStartX, newFinalY + 25);
            doc.text(
                shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`,
                summaryStartX + summaryWidth - 10,
                newFinalY + 25,
                { align: "right" }
            );

            // Total line with emphasis
            doc.setFillColor(...primaryColor);
            doc.rect(
                summaryStartX - 3,
                newFinalY + 30,
                summaryWidth - 4,
                12,
                "F"
            );
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text("TOTAL:", summaryStartX, newFinalY + 38);
            doc.text(
                `$${total.toFixed(2)}`,
                summaryStartX + summaryWidth - 10,
                newFinalY + 38,
                { align: "right" }
            );

            // Reset text color
            doc.setTextColor(...secondaryColor);

            // Footer Section
            const footerY = newFinalY + 60;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...darkGray);

            doc.text("Thank you for your business!", 20, footerY);

            doc.text(
                "For questions about this invoice, please contact us at pahanaedu@gmail.com",
                20,
                footerY + 10
            );

            doc.setFontSize(8);
            doc.text(
                "This is a computer-generated invoice and does not require a signature.",
                20,
                footerY + 20
            );
        } else {
            // Summary Section with better alignment (same page)
            const summaryStartX = pageWidth - 85;
            const summaryWidth = 70;

            // Summary background
            doc.setFillColor(248, 250, 252);
            doc.rect(summaryStartX - 5, finalY - 5, summaryWidth, 50, "F");
            doc.setDrawColor(229, 231, 235);
            doc.rect(summaryStartX - 5, finalY - 5, summaryWidth, 50, "S");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            // Subtotal
            doc.text("Subtotal:", summaryStartX, finalY + 5);
            doc.text(
                `$${subtotal.toFixed(2)}`,
                summaryStartX + summaryWidth - 10,
                finalY + 5,
                { align: "right" }
            );

            doc.text(
                `Tax (${(taxRate * 100).toFixed(0)}%):`,
                summaryStartX,
                finalY + 15
            );
            doc.text(
                `$${tax.toFixed(2)}`,
                summaryStartX + summaryWidth - 10,
                finalY + 15,
                { align: "right" }
            );

            // Shipping
            doc.text("Shipping:", summaryStartX, finalY + 25);
            doc.text(
                shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`,
                summaryStartX + summaryWidth - 10,
                finalY + 25,
                { align: "right" }
            );

            // Total line with emphasis
            doc.setFillColor(...primaryColor);
            doc.rect(summaryStartX - 3, finalY + 30, summaryWidth - 4, 12, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text("TOTAL:", summaryStartX, finalY + 38);
            doc.text(
                `$${total.toFixed(2)}`,
                summaryStartX + summaryWidth - 10,
                finalY + 38,
                { align: "right" }
            );

            // Reset text color
            doc.setTextColor(...secondaryColor);

            // Footer Section
            const footerY = finalY + 60;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...darkGray);

            // Thank you message
            doc.text("Thank you for your business!", 20, footerY);

            // Support info
            doc.text(
                "For questions about this invoice, please contact us at pahanaedu@gmail.com",
                20,
                footerY + 10
            );

            // Legal text
            doc.setFontSize(8);
            doc.text(
                "This is a computer-generated invoice and does not require a signature.",
                20,
                footerY + 20
            );
        }

        return doc;
    } catch (error) {
        console.error("Error in generateInvoice:", error);
        throw error;
    }
};

export const downloadInvoice = (orderData, customerInfo, orderItems) => {
    try {
        const doc = generateInvoice(orderData, customerInfo, orderItems);

        // Generate filename with order number and date
        const date = new Date().toISOString().split("T")[0];
        const orderNumber =
            orderData?.orderNumber ||
            orderData?.orderId ||
            orderData?.id ||
            "unknown";
        const filename = `Invoice_${orderNumber}_${date}.pdf`;

        // Download the PDF
        doc.save(filename);

        return true;
    } catch (error) {
        console.error("Error generating invoice:", error);
        return false;
    }
};
