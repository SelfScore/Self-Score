// Level 4 Report Generator - Main File

import { Level4ReportData } from './types';
import { generateLevel4CoverPage } from './coverPage';
import { generateLevel4UserDetailsPage } from './userDetailsPage';
import { generateLevel4ScoreSummaryPage } from './scoreSummaryPage';
import { generateLevel4DetailedFeedbackPages } from './detailedFeedbackPages';
import { generateLevel4ThankYouPage } from './thankYouPage';

export const generateLevel4ReportHTML = (data: Level4ReportData): string => {
  const totalPages = 4 + data.questionReviews.length; // Cover + UserDetails + Summary + Questions + Thank You

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Self Score - Level 4 Report - ${data.username}</title>
      <style>
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box;
        }
        
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .report-page {
          width: 210mm;
          height: 297mm;
          margin: 0;
          box-sizing: border-box;
          break-after: page;
          position: relative;
          overflow: hidden;
        }
        
        .report-page:last-child {
          break-after: auto;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 0;
          }
          .report-page {
            break-after: page;
            page-break-after: always;
          }
          .report-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
        }
        
        @page {
          size: A4;
          margin: 0;
        }
      </style>
    </head>
    <body>
      ${generateLevel4CoverPage(data)}
      ${generateLevel4UserDetailsPage(data)}
      ${generateLevel4ScoreSummaryPage(data)}
      ${generateLevel4DetailedFeedbackPages(data)}
      ${generateLevel4ThankYouPage(data, totalPages)}
    </body>
    </html>
  `;
};

export const generateLevel4ReportFilename = (data: Level4ReportData): string => {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = data.username.replace(/[^a-zA-Z0-9]/g, '_');
  return `SelfScore_Level4_${safeName}_Attempt${data.attemptNumber}_${date}.pdf`;
};
