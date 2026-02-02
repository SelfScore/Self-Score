// Detailed Report Page Generator (Page 4)
// Now uses score-based descriptions instead of generic characteristics

import { UserReportData } from '../types';
import { getScoreBasedContent } from '../utils/contentData';

export const generateDetailedReportPage = (userData: UserReportData): string => {
  const scoreContent = getScoreBasedContent(userData.level, userData.score);

  // Split description into paragraphs for better formatting
  const descriptionParagraphs = scoreContent?.description.split('\n\n').filter(p => p.trim()) || [];

  return `
    <div style="
      background: #FFFFFF;
      padding: 40px;
      height: 100%;
      display: flex;
      flex-direction: column;
      font-family: 'Faustina', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      background-image: url('/images/Report/BGImg.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    ">
      <!-- Backdrop Blur Layer -->
      

      <!-- Logo -->
      <div style="margin-bottom: 40px; position: relative; z-index: 1;">
        <img 
          src="/images/logos/LogoWithText.png" 
          alt="Self Score Logo" 
          style="
            width: 150px;
            height: auto;
            object-fit: contain;
          "
        />
      </div>

      <!-- Title -->
      <h2 style="
        font-size: 32px;
        font-weight: 700;
        color: #2B2B2B;
        margin: 0 0 8px 0;
        position: relative;
        z-index: 1;
      ">Your Detailed Report</h2>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0 0 32px 0;
        padding-bottom: 16px;
        border-bottom: 2px solid #DDD;
        position: relative;
        z-index: 1;
      ">Based on your Self Score, here is what your current state reflects:</p>

      <!-- Score-based Description -->
      <div style="margin-bottom: 32px; width: 90%; position: relative; z-index: 1;">
        ${descriptionParagraphs.map((paragraph, index) => `
          <p style="
            font-size: ${index === 0 ? '16px' : '14px'};
            font-weight: ${index === 0 ? '600' : '400'};
            color: ${index === 0 ? '#2B2B2B' : '#555'};
            margin: 0 0 20px 0;
            line-height: 1.7;
          ">${paragraph}</p>
        `).join('')}
      </div>

      <!-- Page Number -->
      <div style="
        position: absolute;
        bottom: 30px;
        right: 40px;
        background: #F5F5F5;
        padding: 6px 16px;
        border-radius: 59px;
        border: 1px solid #3A3A3A4D;
        font-size: 10px;
        color: #3A3A3AB2;
        z-index: 1;
        font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-weight: 400;
        text-align: center;
      ">4 / 9</div>
    </div>
  `;
};
