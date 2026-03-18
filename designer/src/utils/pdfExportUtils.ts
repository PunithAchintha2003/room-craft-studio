import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Design, Furniture } from '@/types/design.types';

export interface PDFReportOptions {
  includeScreenshot: boolean;
  includeFurnitureList: boolean;
  includeCostBreakdown: boolean;
  includeRoomSpecs: boolean;
  screenshotDataUrl?: string;
}

/**
 * Generate a comprehensive PDF report for a design
 */
export async function generatePDFReport(
  design: Design,
  furnitureData: Furniture[],
  options: PDFReportOptions
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to check if new page is needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(design.name, 20, yPosition);
  yPosition += 10;

  // Description
  if (design.description) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const splitDescription = pdf.splitTextToSize(design.description, pageWidth - 40);
    pdf.text(splitDescription, 20, yPosition);
    yPosition += splitDescription.length * 6 + 10;
  }

  // Divider
  pdf.setLineWidth(0.5);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Room Specifications
  if (options.includeRoomSpecs) {
    checkNewPage(40);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Room Specifications', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Dimensions: ${design.room.width}m × ${design.room.length}m × ${design.room.height}m`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Area: ${(design.room.width * design.room.length).toFixed(2)} m²`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Wall Color: ${design.room.wallColor}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Floor Color: ${design.room.floorColor}`, 20, yPosition);
    yPosition += 15;
  }

  // Screenshot
  if (options.includeScreenshot && options.screenshotDataUrl) {
    checkNewPage(120);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3D Preview', 20, yPosition);
    yPosition += 8;

    try {
      const imgWidth = pageWidth - 40;
      const imgHeight = (imgWidth * 9) / 16; // 16:9 aspect ratio
      pdf.addImage(options.screenshotDataUrl, 'PNG', 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 15;
    } catch (error) {
      console.error('Failed to add screenshot to PDF:', error);
    }
  }

  // Furniture List
  if (options.includeFurnitureList && design.furniture.length > 0) {
    checkNewPage(60);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Furniture List', 20, yPosition);
    yPosition += 8;

    const furnitureRows = design.furniture.map((item) => {
      const furniture = furnitureData.find((f) => f._id === item.furnitureId);
      return [
        furniture?.name || 'Unknown',
        furniture?.category || '-',
        `${item.position.x.toFixed(1)}, ${item.position.y.toFixed(1)}`,
        `${item.scale.toFixed(2)}x`,
        furniture?.price ? `$${furniture.price.toFixed(2)}` : '-',
      ];
    });

    autoTable(pdf, {
      startY: yPosition,
      head: [['Name', 'Category', 'Position (m)', 'Scale', 'Price']],
      body: furnitureRows,
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 },
    });

    // @ts-expect-error autoTable adds lastAutoTable property
    yPosition = pdf.lastAutoTable.finalY + 15;
  }

  // Cost Breakdown
  if (options.includeCostBreakdown && design.furniture.length > 0) {
    checkNewPage(60);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Cost Breakdown', 20, yPosition);
    yPosition += 8;

    const itemCosts: Array<[string, string]> = [];
    let subtotal = 0;

    design.furniture.forEach((item) => {
      const furniture = furnitureData.find((f) => f._id === item.furnitureId);
      if (furniture && furniture.price) {
        const price = furniture.price;
        itemCosts.push([furniture.name, `$${price.toFixed(2)}`]);
        subtotal += price;
      }
    });

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    autoTable(pdf, {
      startY: yPosition,
      body: [
        ...itemCosts,
        ['', ''],
        ['Subtotal', `$${subtotal.toFixed(2)}`],
        ['Tax (10%)', `$${tax.toFixed(2)}`],
        ['Total', `$${total.toFixed(2)}`],
      ],
      theme: 'plain',
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'normal' },
        1: { halign: 'right', fontStyle: 'normal' },
      },
      didParseCell: function (data) {
        // Bold the last three rows (Subtotal, Tax, Total)
        if (data.row.index >= itemCosts.length + 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    // @ts-expect-error autoTable adds lastAutoTable property
    yPosition = pdf.lastAutoTable.finalY + 15;
  }

  // Footer
  const footerY = pageHeight - 10;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, footerY);
  pdf.text('RoomCraft Studio', pageWidth - 20, footerY, { align: 'right' });

  // Save the PDF
  const filename = `${design.name.replace(/\s+/g, '_').toLowerCase()}_report.pdf`;
  pdf.save(filename);
}
