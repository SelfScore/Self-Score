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

    // Create temporary container (visible for getBoundingClientRect to work)
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '0';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm';
    tempContainer.style.background = 'white';
    tempContainer.style.zIndex = '-1000';
    tempContainer.style.opacity = '0';
    tempContainer.style.pointerEvents = 'none';
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

      // Collect all links in this page before rendering
      const links = pageElement.querySelectorAll('a[href]');
      const linkData: Array<{ url: string; x: number; y: number; width: number; height: number }> = [];
      
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const rect = link.getBoundingClientRect();
          const pageRect = pageElement.getBoundingClientRect();
          const relativeX = rect.left - pageRect.left;
          const relativeY = rect.top - pageRect.top;
          
          linkData.push({
            url: href,
            x: relativeX,
            y: relativeY,
            width: rect.width,
            height: rect.height,
          });
          
          console.log(`Link found on page ${i + 1}:`, {
            url: href,
            x: relativeX,
            y: relativeY,
            width: rect.width,
            height: rect.height,
          });
        }
      });

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

      // Add clickable links on top of the image
      // Convert pixel coordinates to PDF mm coordinates
      const pageWidthPx = 794; // Canvas width at scale 2
      const pxToMm = pdfWidth / pageWidthPx;

      linkData.forEach((linkInfo) => {
        const x = linkInfo.x * pxToMm;
        const y = linkInfo.y * pxToMm;
        const width = linkInfo.width * pxToMm;
        const height = linkInfo.height * pxToMm;

        console.log(`Adding link to PDF:`, {
          url: linkInfo.url,
          x: x.toFixed(2),
          y: y.toFixed(2),
          width: width.toFixed(2),
          height: height.toFixed(2),
        });

        pdf.link(x, y, width, height, { url: linkInfo.url });
      });
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
