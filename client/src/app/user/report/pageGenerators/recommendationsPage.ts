// Personalized Recommendations Page Generator (Page 6)

import { ReportContent } from '../types';

export const generateRecommendationsPage = (content: ReportContent): string => {
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
      ">Your Personalized Recommendations</h2>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0 0 32px 0;
      ">Here's what can help you strengthen your emotional foundation:</p>

      <!-- Recommendations -->
      ${content.recommendations.map(rec => `
        <div style="
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        ">
          <div style="
            width: 48px;
            height: 48px;
            background: #0C677A;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div style="flex: 1;">
            <h3 style="
              font-size: 18px;
              font-weight: 700;
              color: #2B2B2B;
              margin: 0 0 8px 0;
            ">${rec.title}</h3>
            <p style="
              font-size: 14px;
              color: #666;
              margin: 0;
              line-height: 1.5;
            ">${rec.description}</p>
          </div>
        </div>
      `).join('')}

      <!-- Pro Tip -->
      <div style="
        background: white;
        border: 2px solid #E87A42;
        border-radius: 12px;
        padding: 16px 20px;
        margin-top: 32px;
        margin-bottom: 32px;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        ">
          <div style="
            width: 36px;
            height: 36px;
            background: #E87A42;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12.5 7.5L18 8.5L14 13L15 18.5L10 16L5 18.5L6 13L2 8.5L7.5 7.5L10 2Z" fill="white"/>
            </svg>
          </div>
          <span style="
            font-size: 18px;
            font-weight: 700;
            color: #2B2B2B;
          ">Pro Tip</span>
        </div>
        <p style="
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.5;
        ">${content.proTip}</p>
      </div>

      <!-- CTA -->
      <div style="
        background: #E87A42;
        color: white;
        border-radius: 12px;
        padding: 16px 24px;
        text-align: center;
        margin-top: auto;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        ">👑 Unlock Level 2 Test</div>
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
        ">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 0L10 6H16L11 10L13 16L8 12L3 16L5 10L0 6H6L8 0Z" fill="white"/>
          </svg>
          <span>100% Secure payments</span>
        </div>
      </div>

      <!-- Background Image -->
      <div style="
        position: absolute;
        bottom: 0;
        right: 0;
        width: 35%;
        height: 35%;
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
