import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { UserReportData } from '../types';

export const generatePDFFromHTML = async (
  htmlContent: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    onProgress?.(10);

    // Create temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm';
    tempContainer.style.background = 'white';
    tempContainer.innerHTML = htmlContent;

    document.body.appendChild(tempContainer);
    onProgress?.(20);

    // Wait for images and fonts to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find all report pages
    const reportPages = tempContainer.querySelectorAll('.report-page');
    
    if (reportPages.length === 0) {
      throw new Error('No report pages found');
    }

    onProgress?.(30);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    onProgress?.(40);

    // Process each page
    for (let i = 0; i < reportPages.length; i++) {
      const pageElement = reportPages[i] as HTMLElement;
      const pageProgress = 40 + (i / reportPages.length) * 50;
      onProgress?.(pageProgress);

      const canvas = await html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) {
        pdf.addPage();
      }

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    onProgress?.(90);

    // Cleanup
    document.body.removeChild(tempContainer);

    onProgress?.(95);

    // Download
    pdf.save(filename);

    onProgress?.(100);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const generateReportFilename = (userData: UserReportData): string => {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = userData.username.replace(/[^a-zA-Z0-9]/g, '_');
  return `SelfScore_Level${userData.level}_${safeName}_${date}.pdf`;
};
