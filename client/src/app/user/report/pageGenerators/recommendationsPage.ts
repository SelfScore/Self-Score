// Personalized Recommendations Page Generator (Page 6)

import { ReportContent } from '../types';

const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://www.selfscore.net';

export const generateRecommendationsPage = (content: ReportContent, currentLevel: number): string => {
  // Determine next level and button content
  const nextLevel = currentLevel + 1;
  const buttonText = currentLevel === 1 ? 'Unlock Level 2 Test' : 
                     nextLevel <= 4 ? `Unlock Level ${nextLevel} Test` : 'Continue Your Journey';
  const buttonUrl = nextLevel <= 4 ? `${CLIENT_URL}/testInfo?level=${nextLevel}` : `${CLIENT_URL}/consultant`;
  return `
    <div style="
      background: #FFFFFF;
      padding: 40px;
      min-height: 100vh;
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
      ">Your Personalized Recommendations</h2>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0 0 32px 0;
        position: relative;
        z-index: 1;
      ">Here's what can help you strengthen your emotional foundation:</p>

      <!-- Recommendations -->
      <div style="position: relative; z-index: 1;">
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

      <!-- CTA Button (Clickable) -->
      <div style="
        display: flex;
        justify-content: left;
        margin-top: auto;
        margin-bottom: 70px;
        position: relative;
        z-index: 1;
      ">
        <a href="${buttonUrl}" style="
          background: #FF4F00;
          color: #FFFFFF;
          border-radius: 12px;
          padding: 10px 32px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <span style="
            font-size: 18px;
            font-weight: 400;
          ">${buttonText}</span>
        </a>
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
      ">6 / 9</div>
    </div>
  `;
};