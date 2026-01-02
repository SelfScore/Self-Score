// Level 5 Report - Thank You Page

import { Level5ReportData } from "./types";

export const generateLevel5ThankYouPage = (
  data: Level5ReportData,
  pageNumber: number
): string => {
  return `
    <div class="report-page" style="
      background: linear-gradient(135deg, #005F73 0%, #0A9396 100%);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 60px;
        max-width: 700px;
      ">
        <h1 style="
          font-size: 42px;
          font-weight: 700;
          margin: 0 0 30px 0;
          line-height: 1.2;
        ">Thank You for Completing Level 5!</h1>
        
        <p style="
          font-size: 20px;
          margin: 0 0 40px 0;
          line-height: 1.6;
          opacity: 0.95;
        ">
          You've successfully completed the Real-Time AI Voice Interview. 
          This comprehensive assessment has evaluated your responses across 
          ${data.questionReviews.length} critical areas of personal and professional development.
        </p>
        
        <div style="
          background: rgba(255, 255, 255, 0.15);
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 40px;
        ">
          <h2 style="
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 20px 0;
          ">Your Achievement</h2>
          <p style="
            font-size: 48px;
            font-weight: 700;
            margin: 0;
            color: #FFD700;
          ">${data.totalScore} / 900</p>
        </div>
        
        <div style="
          text-align: left;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 40px;
        ">
          <h3 style="
            font-size: 22px;
            font-weight: 600;
            margin: 0 0 20px 0;
          ">Next Steps</h3>
          <ul style="
            margin: 0;
            padding-left: 25px;
            font-size: 16px;
            line-height: 1.8;
          ">
            <li>Review your detailed feedback on each question</li>
            <li>Identify patterns in your strengths and areas for growth</li>
            <li>Consider retaking the assessment to track your progress</li>
            <li>Connect with our consultants for personalized guidance</li>
          </ul>
        </div>
        
        <div style="
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        ">
          <p style="
            font-size: 16px;
            margin: 0;
            opacity: 0.8;
          ">
            Need support? Visit our website or contact our team for personalized assistance.
          </p>
        </div>
      </div>
      
      <div style="
        margin-top: 50px;
        opacity: 0.6;
      ">
        <p style="
          font-size: 14px;
          margin: 0;
        ">Page ${pageNumber} of ${pageNumber}</p>
      </div>
    </div>
  `;
};
