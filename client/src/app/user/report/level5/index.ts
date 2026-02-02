// Level 5 Report Generator - Main File (Matching Level 4 Design)

import { Level5ReportData } from './types';
import { generateLevel5CoverPage } from './coverPage';
import { generateLevel5UserDetailsPage } from './userDetailsPage';
import { generateLevel5ScoreSummaryPage, getScoreSummaryPageCount } from './scoreSummaryPage';
import { generateLevel5DetailedFeedbackPages } from './detailedFeedbackPages';
import { generateLevel5ThankYouPage } from './thankYouPage';

export const generateLevel5ReportHTML = (data: Level5ReportData): string => {
  // Calculate total pages dynamically
  // Cover (1) + UserDetails (1) + ScoreSummary (variable) + Questions (variable) + ThankYou (1)
  const scoreSummaryPages = getScoreSummaryPageCount(data.questionReviews.length);
  const totalPages = 2 + scoreSummaryPages + data.questionReviews.length + 1;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Self Score - Level 5 Report - ${data.username}</title>
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
      ${generateLevel5CoverPage(data)}
      ${generateLevel5UserDetailsPage(data)}
      ${generateLevel5ScoreSummaryPage(data)}
      ${generateLevel5DetailedFeedbackPages(data)}
      ${generateLevel5ThankYouPage(data, totalPages)}
    </body>
    </html>
  `;
};

export const generateLevel5ReportFilename = (data: Level5ReportData): string => {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = data.username.replace(/[^a-zA-Z0-9]/g, '_');
  return `SelfScore_Level5_${safeName}_Attempt${data.attemptNumber}_${date}.pdf`;
};
