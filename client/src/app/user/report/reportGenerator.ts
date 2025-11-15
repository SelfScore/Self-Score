// Main Report Generator

import { UserReportData } from './types';
import { getContentByLevel } from './utils/contentData';
import { generateCoverPage } from './pageGenerators/coverPage';
import { generateUserDetailsPage } from './pageGenerators/userDetailsPage';
import { generateScoreSummaryPage } from './pageGenerators/scoreSummaryPage';
import { generateDetailedReportPage } from './pageGenerators/detailedReportPage';
import { generateScoreMeaningPage } from './pageGenerators/scoreMeaningPage';
import { generateRecommendationsPage } from './pageGenerators/recommendationsPage';
import { generateUpgradePage, generateKeyOutcomesPage, generateThankYouPage } from './pageGenerators/otherPages';

export const generateReportHTML = (userData: UserReportData): string => {
  const content = getContentByLevel(userData.level);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Self Score Report - Level ${userData.level}</title>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .report-page {
            margin: 0;
            box-shadow: none;
            break-after: page;
          }
          
          .report-page:last-child {
            break-after: auto;
          }
          
          @page {
            margin: 0;
            size: A4;
          }
        }
      </style>
    </head>
    <body>
      <!-- Page 1: Cover Page -->
      <div class="report-page">
        ${generateCoverPage(userData.username, userData.level)}
      </div>

      <!-- Page 2: User Details -->
      <div class="report-page">
        ${generateUserDetailsPage(userData)}
      </div>

      <!-- Page 3: Score Summary -->
      <div class="report-page">
        ${generateScoreSummaryPage(userData)}
      </div>

      <!-- Page 4: Detailed Report -->
      <div class="report-page">
        ${generateDetailedReportPage(content)}
      </div>

      <!-- Page 5: Score Meaning -->
      <div class="report-page">
        ${generateScoreMeaningPage(userData)}
      </div>

      <!-- Page 6: Recommendations -->
      <div class="report-page">
        ${generateRecommendationsPage(content, userData.level)}
      </div>

      <!-- Page 7: Upgrade Page -->
      <div class="report-page">
        ${generateUpgradePage(userData.level)}
      </div>

      <!-- Page 8: Key Outcomes -->
      <div class="report-page">
        ${generateKeyOutcomesPage(content, userData.level)}
      </div>

      <!-- Page 9: Thank You -->
      <div class="report-page">
        ${generateThankYouPage()}
      </div>
    </body>
    </html>
  `;
};
