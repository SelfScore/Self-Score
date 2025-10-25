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
      ">Your Self Score Summary</h2>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0 0 32px 0;
      ">Based on your responses, here's how your current emotional awareness stands.</p>

      <!-- Score Box -->
      <div style="
        background: white;
        border: 2px solid #E0E0E0;
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div style="flex: 1;">
          <h3 style="
            font-size: 24px;
            font-weight: 700;
            color: #2B2B2B;
            margin: 0 0 12px 0;
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
              stroke="#4CAF50"
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
      ">Where do you Stand</h3>

      <!-- Slider -->
      <div style="
        position: relative;
        margin-bottom: 32px;
      ">
        <div style="
          display: flex;
          height: 60px;
          border-radius: 30px;
          overflow: hidden;
          position: relative;
        ">
          <div style="flex: 1; background: #90EE90;"></div>
          <div style="flex: 1; background: #90EE90;"></div>
          <div style="flex: 1; background: #FFA500;"></div>
          <div style="flex: 1; background: #FFB6C1;"></div>
        </div>

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
          ">You</div>
          <div style="
            width: 3px;
            height: 60px;
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
        ">
          <div style="text-align: left;">
            <div style="font-size: 12px; font-weight: 600; color: #2B2B2B;">Calm</div>
            <div style="font-size: 11px; color: #666;">(Score: 350)</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; font-weight: 600; color: #2B2B2B;">Balanced</div>
            <div style="font-size: 11px; color: #666;">(Score: 500)</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; font-weight: 600; color: #2B2B2B;">Energized</div>
            <div style="font-size: 11px; color: #666;">(Score: 750)</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; font-weight: 600; color: #2B2B2B;">Overwhelmed</div>
            <div style="font-size: 11px; color: #666;">(Score: 900)</div>
          </div>
        </div>
      </div>

      <!-- Meaning Box -->
      <div style="
        background: #FFE4E1;
        border-radius: 12px;
        padding: 20px 24px;
      ">
        <h4 style="
          font-size: 18px;
          font-weight: 700;
          color: #2B2B2B;
          margin: 0 0 12px 0;
        ">Your Self Score Meaning</h4>
        
        <p style="
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.6;
        ">${meaning}</p>
      </div>

      <!-- Background Image -->
      <div style="
        position: absolute;
        bottom: 0;
        right: 0;
        width: 40%;
        height: 40%;
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
