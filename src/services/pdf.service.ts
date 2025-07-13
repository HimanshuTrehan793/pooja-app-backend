import PDFDocument from "pdfkit";
import { Response } from "express";
import { OrderDetail } from "../models/orderDetail.model";

export const downloadInvoicePdf = async (
  res: Response,
  orderDetail: OrderDetail
) => {
  // Create a new PDF document
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${orderDetail.order_number + 1000}.pdf`
  );
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // Calculate totals with null checks
  const orderItems = orderDetail.order_items || [];
  const orderCoupons = orderDetail.order_coupons || [];
  const orderCharges = orderDetail.order_charges || [];
  const paymentDetails = orderDetail.payment_details || {
    currency: "Rs.",
    amount: 0,
    method: "cash",
    status: "pending",
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalMRP = orderItems.reduce(
    (sum, item) => sum + item.mrp * item.quantity,
    0
  );
  const totalSavings = totalMRP - subtotal;
  const deliveryCharges =
    orderCharges.find((charge) => charge.name === "Delivery Charges")?.amount ||
    0;
  const discountAmount = orderCoupons.reduce(
    (sum, coupon) => sum + coupon.discount_amount,
    0
  );
  const finalTotal = subtotal + deliveryCharges - discountAmount;
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  // ========== 1. HEADER ==========
  // "Thank you for your visit at" text
  doc.fontSize(12).font("Helvetica").text("Thank you for Shopping at", 50, 50, {
    align: "center",
    width: 500,
  });

  // Store name
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("SHUBHLABH POOJA SAMAGRI", 50, 70, { align: "center", width: 500 });

  // Store details
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "Star Mena Mehta Residency, Gurudwara Ln,Kumar Basti, Ameerpet, Hyderabad,Telangana 500016, India | Phone Number: +91 9000057702 | GSTIN:36BBFPR3727L1Z8",
      50,
      100,
      { align: "center", width: 500 }
    );

  // ========== 2. TOTAL PRICE SECTION ==========
  doc
    .fontSize(14)
    .font("Helvetica")
    .text("Your Total Price", 50, 130, { align: "center", width: 500 });

  doc.fontSize(28).font("Helvetica-Bold").text(`Rs. ${finalTotal}`, 50, 150, {
    align: "center",
    width: 500,
  });

  doc.fontSize(14).font("Helvetica-Bold").text("(Inc. All Taxes)", 50, 180, {
    align: "center",
    width: 500,
  });

  // ========== 3. INVOICE DETAILS ==========
  const detailsY = 210;
  const orderDate = new Date(orderDetail.expected_delivery_date || Date.now());
  const formattedDate = orderDate.toLocaleDateString("en-GB");
  const formattedTime = orderDate.toLocaleTimeString("en-GB", {
    hour12: false,
  });

  // Left side - Date and Invoice
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Date: ${formattedDate}`, 50, detailsY)
    .text(`Time: ${formattedTime}`, 50, detailsY + 12)
    .text(`Invoice No: ${orderDetail.order_number + 1000}`, 50, detailsY + 24);

  // Middle - Billed to
  const orderAddress = orderDetail.order_address;
  const customerName =
    orderAddress?.name ||
    `${orderDetail.user?.first_name || ""} ${
      orderDetail.user?.last_name || ""
    }`.trim() ||
    "Customer";

  doc
    .text("Billed to:", 200, detailsY)
    .text(customerName, 200, detailsY + 12)
    .text(orderAddress?.city || "N/A", 200, detailsY + 24);

  // Right side - Phone
  doc
    .text("Phone", 380, detailsY)
    .text(orderAddress?.phone_number || "N/A", 380, detailsY + 12);

  // ========== 4. ITEMS TABLE ==========
  const tableTop = 280;
  const tableLeft = 50;
  const tableWidth = 500;
  const rowHeight = 20;

  // Table header background
  doc.rect(tableLeft, tableTop, tableWidth, 25).fillColor("#4A90E2").fill();

  // Table headers
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("white")
    .text("Item", tableLeft + 5, tableTop + 8, { width: 200 })
    .text("MRP", tableLeft + 210, tableTop + 8, { width: 50, align: "center" })
    .text("Price", tableLeft + 265, tableTop + 8, {
      width: 50,
      align: "center",
    })
    .text("QTY", tableLeft + 320, tableTop + 8, { width: 40, align: "center" })
    .text("Total", tableLeft + 365, tableTop + 8, {
      width: 80,
      align: "right",
    });

  // Table items - using dynamic data
  let currentY = tableTop + 25;
  doc.font("Helvetica").fontSize(8).fillColor("black");

  orderItems.forEach((item, index) => {
    // Alternate row background
    if (index % 2 === 0) {
      doc
        .rect(tableLeft, currentY, tableWidth, rowHeight)
        .fillColor("#f9f9f9")
        .fill();
    }

    const itemTotal = item.price * item.quantity;
    const itemName = item.product_variant?.display_label || "Unknown Item";

    // Item details
    doc
      .fillColor("black")
      .text(itemName, tableLeft + 5, currentY + 4, { width: 200 })
      .text(item.mrp.toString(), tableLeft + 210, currentY + 8, {
        width: 50,
        align: "center",
      })
      .text(item.price.toString(), tableLeft + 265, currentY + 8, {
        width: 50,
        align: "center",
      })
      .text(item.quantity.toString(), tableLeft + 320, currentY + 8, {
        width: 40,
        align: "center",
      })
      .text(itemTotal.toString(), tableLeft + 365, currentY + 8, {
        width: 80,
        align: "right",
      });

    currentY += rowHeight;
  });

  // Draw table borders
  doc.strokeColor("#cccccc").lineWidth(0.5);

  // Outer border
  doc
    .rect(tableLeft, tableTop, tableWidth, 25 + orderItems.length * rowHeight)
    .stroke();

  // Vertical lines
  const verticalLines = [210, 265, 320, 365];
  verticalLines.forEach((x) => {
    doc
      .moveTo(tableLeft + x, tableTop)
      .lineTo(tableLeft + x, tableTop + 25 + orderItems.length * rowHeight)
      .stroke();
  });

  // Horizontal lines
  for (let i = 0; i <= orderItems.length; i++) {
    doc
      .moveTo(tableLeft, tableTop + 25 + i * rowHeight)
      .lineTo(tableLeft + tableWidth, tableTop + 25 + i * rowHeight)
      .stroke();
  }

  // ========== 5. SUMMARY SECTION ==========
  const summaryY = currentY + 20;

  // Summary details
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("No. of Items", 50, summaryY)
    .text(`: ${orderItems.length}`, 150, summaryY)
    .text(`Total: Rs. ${subtotal}`, 400, summaryY, {
      align: "right",
    });

  doc
    .text("Total Qty", 50, summaryY + 15)
    .text(`: ${totalItems}`, 150, summaryY + 15);

  doc
    .text("Promotions", 50, summaryY + 30)
    .text(`: Rs. ${discountAmount}`, 150, summaryY + 30);

  doc
    .text("Delivery Charges", 50, summaryY + 45)
    .text(`: Rs. ${deliveryCharges}`, 150, summaryY + 45);

  // ========== 6. PAYMENTS SECTION ==========
  const paymentsY = summaryY + 80;

  // Payments header
  doc.rect(50, paymentsY, 500, 25).fillColor("#4A90E2").fill();
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("white")
    .text("Payments", 55, paymentsY + 8);

  // Payment details
  const paymentMethod = paymentDetails.method
    ? paymentDetails.method.toUpperCase()
    : "";
  doc
    .fontSize(12)
    .font("Helvetica")
    .fillColor("black")
    .text(paymentMethod, 55, paymentsY + 40)
    .text("-", 400, paymentsY + 40)
    .text("Rs. " + paymentDetails.amount.toString(), 450, paymentsY + 40, {
      align: "right",
    });

  // Dotted line
  doc
    .strokeColor("#4A90E2")
    .lineWidth(1)
    .dash(5, { space: 5 })
    .moveTo(50, paymentsY + 70)
    .lineTo(550, paymentsY + 70)
    .stroke();

  // Order Status

  // Address section
  if (orderAddress) {
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Delivery Address:", 55, paymentsY + 110);

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`${orderAddress.address_line1 || ""}`, 55, paymentsY + 125)
      .text(`${orderAddress.address_line2 || ""}`, 55, paymentsY + 140)
      .text(
        `${orderAddress.city || ""}, ${orderAddress.state || ""} - ${
          orderAddress.pincode || ""
        }`,
        55,
        paymentsY + 155
      );
  }

  doc.end();
};
