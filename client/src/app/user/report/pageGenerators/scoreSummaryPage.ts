// Score Summary Page Generator (Page 3)

import { UserReportData } from '../types';
import { getScoreMeaning, formatDate } from '../utils/scoreUtils';

export const generateScoreSummaryPage = (userData: UserReportData): string => {
  const meaning = getScoreMeaning(userData.score);
  const percentage = (userData.score / userData.maxScore) * 100;
  const formattedDate = formatDate(userData.reportDate);
  
  // Calculate position on slider (0-100%)
  const sliderPosition = Math.min(100, Math.max(0, (userData.score / 900) * 100));
  
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
        
      ">Your Self Score Summary</h2>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0 0 32px 0;
        position: relative;
        z-index: 1;
        font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">Based on your responses, here's how your current emotional awareness stands.</p>

      <!-- Score Box -->
      <div style="
        background: #F7F7F780;
        border: 1px solid #3A3A3A4D;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;
      ">
        <div style="flex: 1; font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h3 style="
            font-size: 24px;
            font-weight: 700;
            color: #2B2B2B;
            margin: 0 0 12px 0;
            font-family: 'Faustina', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">Level ${userData.level} Score</h3>
          
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#666" stroke-width="1.5"/>
              <path d="M10 5v5l3 3" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span style="color: #666; font-size: 14px;">Test Date: ${formattedDate.split(',')[0]}</span>
          </div>
          
          <p style="
            font-size: 14px;
            color: #666;
            margin: 0;
            line-height: 1.5;
          ">This score reflects your current level of emotional clarity and how well aligned your thoughts, feelings, and actions are.</p>
        </div>

        <!-- Circular Score Gauge -->
        <div style="
          position: relative;
          width: 180px;
          height: 180px;
          margin-left: 32px;
        ">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <!-- Background circle -->
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="#E0E0E0"
              stroke-width="20"
            />
            <!-- Progress circle -->
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="#508B28"
              stroke-width="20"
              stroke-dasharray="${2 * Math.PI * 70}"
              stroke-dashoffset="${2 * Math.PI * 70 * (1 - percentage / 100)}"
              transform="rotate(-90 90 90)"
              stroke-linecap="round"
            />
          </svg>
          
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
          ">
            <div style="
              font-size: 48px;
              font-weight: 700;
              color: #2B2B2B;
              line-height: 1;
            ">${userData.score}</div>
            <div style="
              font-size: 14px;
              color: #666;
              margin-top: 4px;
            ">out of ${userData.maxScore}</div>
          </div>
        </div>
      </div>

      <!-- Where do you Stand -->
      <h3 style="
        font-size: 28px;
        font-weight: 700;
        color: #2B2B2B;
        margin: 0 0 24px 0;
        position: relative;
        z-index: 1;
      ">Where do you Stand</h3>

      <!-- Slider -->
      <div style="
        position: relative;
        margin-bottom: 32px;
        position: relative;
        z-index: 1;
      ">
        <div style="
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #E9F3F5 0%, #87D55D 33.33%, #FDE8D5 66.67%, #E88C73 100%);
          position: relative;
        "></div>

        <!-- You marker -->
        <div style="
          position: absolute;
          top: -40px;
          left: ${sliderPosition}%;
          transform: translateX(-50%);
        ">
          <div style="
            background: #E87A42;
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
            white-space: nowrap;
            font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">You</div>
          <div style="
            width: 3px;
            height: 48px;
            background: #E87A42;
            margin: 0 auto;
          "></div>
          <div style="
            width: 12px;
            height: 12px;
            background: #E87A42;
            border-radius: 50%;
            margin: -6px auto 0;
          "></div>
        </div>

        <!-- Labels below slider -->
        <div style="
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          padding: 0 20px;
          font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="text-align: left;">
            <div style="font-size: 12px; font-weight: 600; color: #2B2B2B;">Seeker</div>
            <div style="font-size: 11px; color: #666;">(Score: 350)</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; font-weight: 600; color: #2B2B2B;">Learner</div>
            <div style="font-size: 11px; color: #666;">(Score: 500)</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; font-weight: 600; color: #2B2B2B;">Evolver</div>
            <div style="font-size: 11px; color: #666;">(Score: 750)</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; font-weight: 600; color: #2B2B2B;">Awakened</div>
            <div style="font-size: 11px; color: #666;">(Score: 900)</div>
          </div>
        </div>
      </div>

      <!-- Meaning Box -->
      <div style="
        background: #FFEBE4;
        border-radius: 16px;
        border: 1px solid #FF6B354D;
        padding: 20px 24px;
        position: relative;
        z-index: 1;
        font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h4 style="
          font-size: 18px;
          font-weight: 700;
          color: #2B2B2B;
          margin: 0 0 12px 0;
          font-family: 'Faustina', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">Your Self Score Meaning</h4>
        
        <p style="
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.6;
        ">${meaning}</p>
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
      ">3 / 10</div>
    </div>
  `;
};
