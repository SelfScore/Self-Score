// What Does Self Score Mean Page Generator (Page 5)

import { UserReportData } from '../types';

export const generateScoreMeaningPage = (_userData: UserReportData): string => {
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
        margin: 0 0 16px 0;
        position: relative;
        z-index: 1;
      ">What Does Self Score Means</h2>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0 0 48px 0;
        line-height: 1.6;
        max-width: 600px;
        position: relative;
        z-index: 1;
      ">Your score reflects how well you recognize, process, and respond to your emotions. Each range represents a different stage of emotional awareness, from simply noticing feelings to consciously aligning your actions with your values. Use this insight to understand where you stand today and how you can grow further.</p>

      <!-- Meaning Graph Image -->
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 40px;
        position: relative;
        z-index: 1;
      ">
        <img 
          src="/images/Report/MeaningGraph.png" 
          alt="Score Meaning Graph" 
          style="
            width: 100%;
            max-width: 800px;
            height: auto;
            object-fit: contain;
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
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      ">5 / 10</div>
    </div>
  `;
};
