// Detailed Report Page Generator (Page 4)

import { ReportContent } from '../types';

export const generateDetailedReportPage = (content: ReportContent): string => {
  return `
    <div style="
      background: linear-gradient(135deg, #F5F5DC 0%, #E8E8D0 100%);
      padding: 40px;
      height: 100%;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
    ">
      <!-- Logo -->
      <div style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="
            width: 32px;
            height: 32px;
            background: #E87A42;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 16px;
              height: 16px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
          <span style="
            font-size: 20px;
            font-weight: 700;
            color: #2B2B2B;
          ">SELF SCORE</span>
        </div>
      </div>

      <!-- Title -->
      <h2 style="
        font-size: 32px;
        font-weight: 700;
        color: #2B2B2B;
        margin: 0 0 8px 0;
      ">Detailed Report</h2>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0 0 32px 0;
        padding-bottom: 16px;
        border-bottom: 2px solid #DDD;
      ">According to your self score, you posses these specific characteristics in life.</p>

      <!-- Characteristics List -->
      <div style="margin-bottom: 32px;">
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

      <!-- Background Image -->
      <div style="
        position: absolute;
        bottom: 0;
        right: 0;
        width: 45%;
        height: 45%;
        opacity: 0.1;
      ">
        <img 
          src="/images/Report/People.webp" 
          alt="Background" 
          style="
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: bottom right;
          "
        />
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
      ">3 / 10</div>
    </div>
  `;
};
