// Detailed Report Page Generator (Page 4)

import { ReportContent } from '../types';

export const generateDetailedReportPage = (content: ReportContent): string => {
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
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(19px);
        -webkit-backdrop-filter: blur(19px);
        z-index: 0;
      "></div>

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
      ">Detailed Report</h2>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0 0 32px 0;
        padding-bottom: 16px;
        border-bottom: 2px solid #DDD;
        position: relative;
        z-index: 1;
      ">According to your self score, you posses these specific characteristics in life.</p>

      <!-- Characteristics List -->
      <div style="margin-bottom: 32px; position: relative; z-index: 1;">
        ${content.characteristics.map((char, index) => `
          <div style="margin-bottom: 24px;">
            <h3 style="
              font-size: 16px;
              font-weight: 700;
              color: #2B2B2B;
              margin: 0 0 8px 0;
            ">${index + 1}. ${char.split(':')[0]}:</h3>
            <p style="
              font-size: 14px;
              color: #666;
              margin: 0;
              line-height: 1.6;
              padding-left: 20px;
            ">${char.split(':')[1] || char}</p>
          </div>
        `).join('')}
      </div>

      <!-- Page Number -->
      <div style="
        position: absolute;
        bottom: 30px;
        right: 40px;
        background: #F5F5F5;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        color: #666;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      ">4 / 10</div>
    </div>
  `;
};
