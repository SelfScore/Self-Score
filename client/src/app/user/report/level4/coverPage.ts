// Level 4 Report Cover Page Generator

import { Level4ReportData } from './types';

export const generateLevel4CoverPage = (data: Level4ReportData): string => {
  return `
    <div class="report-page" style="
      background: #FFFFFF;
      min-height: 297mm;
      height: 297mm;
      display: flex;
      flex-direction: column;
      font-family: 'Faustina', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      background-image: url('/images/Report/BGImgCover.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    ">
      <!-- Content wrapper with padding -->
      <div style="
        padding: 40px;
        height: 100%;
        display: flex;
        flex-direction: column;
      ">
        <!-- Logo -->
        <div style="margin-bottom: 60px;">
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

        <!-- Title Section -->
        <div style="margin-bottom: 40px;">
          <div style="
            font-size: 18px;
            color: #666;
            margin-bottom: 16px;
          ">(Level 4)</div>
          
          <h1 style="
            font-size: 48px;
            font-weight: 700;
            color: #0C677A;
            margin: 0 0 16px 0;
            line-height: 1.2;
          ">Self Score Report</h1>
          
          <p style="
            font-size: 16px;
            color: #666;
            margin: 0;
            max-width: 400px;
            line-height: 1.5;
          ">A snapshot of where you stand emotionally and mentally and where to go next.</p>
        </div>

        <!-- Spacer to push name to bottom -->
        <div style="flex: 1;"></div>

        <!-- Name Section -->
        <div style="
          border-left: 4px solid #0C677A;
          padding-left: 16px;
          margin-bottom: 60px;
        ">
          <div style="
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          ">Name</div>
          <div style="
            font-size: 24px;
            font-weight: 700;
            color: #2B2B2B;
          ">${data.username}</div>
        </div>
      </div>
    </div>
  `;
};