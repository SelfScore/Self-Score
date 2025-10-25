// What Does Self Score Mean Page Generator (Page 5)

import { UserReportData } from '../types';

export const generateScoreMeaningPage = (userData: UserReportData): string => {
  
  // Calculate angle for the score indicator (180 degrees = semicircle)
  // Score range: 350-900, map to 0-180 degrees
  const minScore = 350;
  const maxScore = 900;
  const normalizedScore = Math.max(minScore, Math.min(maxScore, userData.score));
  const angle = ((normalizedScore - minScore) / (maxScore - minScore)) * 180;
  
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
        margin: 0 0 16px 0;
      ">What Does Self Score Means</h2>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0 0 48px 0;
        line-height: 1.6;
        max-width: 600px;
      ">Your score reflects how well you recognize, process, and respond to your emotions. Each range represents a different stage of emotional awareness, from simply noticing feelings to consciously aligning your actions with your values. Use this insight to understand where you stand today and how you can grow further.</p>

      <!-- Info Boxes and Gauge -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
        position: relative;
      ">
        <!-- Left Box - Unaware Zone -->
        <div style="
          background: white;
          border: 2px solid #FF6B6B;
          border-radius: 12px;
          padding: 16px;
          width: 180px;
        ">
          <h3 style="
            font-size: 14px;
            font-weight: 700;
            color: #2B2B2B;
            margin: 0 0 8px 0;
          ">Unaware Zone (350 - 500)</h3>
          <p style="
            font-size: 12px;
            color: #666;
            margin: 0;
            line-height: 1.4;
          ">You may feel unsure about your emotions. This stage helps you see your patterns.</p>
        </div>

        <!-- Center - Semicircular Gauge -->
        <div style="
          position: relative;
          width: 300px;
          height: 180px;
        ">
          <svg width="300" height="180" viewBox="0 0 300 180">
            <!-- Red Arc (350-500) -->
            <path
              d="M 40 150 A 110 110 0 0 1 95 42"
              fill="none"
              stroke="#FF6B6B"
              stroke-width="35"
              stroke-linecap="round"
            />
            <!-- Orange Arc (500-750) -->
            <path
              d="M 95 42 A 110 110 0 0 1 205 42"
              fill="none"
              stroke="#FFA500"
              stroke-width="35"
              stroke-linecap="round"
            />
            <!-- Green Arc (750-900) -->
            <path
              d="M 205 42 A 110 110 0 0 1 260 150"
              fill="none"
              stroke="#4CAF50"
              stroke-width="35"
              stroke-linecap="round"
            />
            
            <!-- Center line indicator -->
            <line
              x1="150"
              y1="150"
              x2="${150 + 100 * Math.cos((180 - angle) * Math.PI / 180)}"
              y2="${150 - 100 * Math.sin((180 - angle) * Math.PI / 180)}"
              stroke="#2B2B2B"
              stroke-width="3"
            />
            
            <!-- Indicator dot -->
            <circle
              cx="${150 + 110 * Math.cos((180 - angle) * Math.PI / 180)}"
              cy="${150 - 110 * Math.sin((180 - angle) * Math.PI / 180)}"
              r="8"
              fill="#0C677A"
            />
          </svg>

          <!-- Score Labels -->
          <div style="
            position: absolute;
            bottom: -30px;
            left: 0;
            font-size: 14px;
            font-weight: 700;
            color: #2B2B2B;
          ">350</div>
          
          <div style="
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 14px;
            font-weight: 700;
            color: #2B2B2B;
          ">500</div>
          
          <div style="
            position: absolute;
            bottom: -30px;
            right: 40px;
            font-size: 14px;
            font-weight: 700;
            color: #2B2B2B;
          ">750</div>
          
          <div style="
            position: absolute;
            bottom: -30px;
            right: 0;
            font-size: 14px;
            font-weight: 700;
            color: #2B2B2B;
          ">900</div>
        </div>

        <!-- Right Box - Deeply Conscious -->
        <div style="
          background: white;
          border: 2px solid #4CAF50;
          border-radius: 12px;
          padding: 16px;
          width: 180px;
        ">
          <h3 style="
            font-size: 14px;
            font-weight: 700;
            color: #2B2B2B;
            margin: 0 0 8px 0;
          ">Deeply Conscious (750 - 900)</h3>
          <p style="
            font-size: 12px;
            color: #666;
            margin: 0;
            line-height: 1.4;
          ">You have strong emotional awareness and empathy. Your actions align with your values.</p>
        </div>
      </div>

      <!-- Bottom Box - Emotionally Aware -->
      <div style="
        background: white;
        border: 2px solid #FFA500;
        border-radius: 12px;
        padding: 16px;
        width: 320px;
        margin: 0 auto 32px;
      ">
        <h3 style="
          font-size: 14px;
          font-weight: 700;
          color: #2B2B2B;
          margin: 0 0 8px 0;
        ">Emotionally Aware (500 - 750)</h3>
        <p style="
          font-size: 12px;
          color: #666;
          margin: 0;
          line-height: 1.4;
        ">You understand your emotions well and act with self-awareness and intent.</p>
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
