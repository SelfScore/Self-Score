// Level 5 Report - Cover Page

import { Level5ReportData } from "./types";

export const generateLevel5CoverPage = (data: Level5ReportData): string => {
  return `
    <div class="report-page" style="
      background: linear-gradient(135deg, #005F73 0%, #0A9396 100%);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px;
    ">
      <div style="margin-bottom: 40px;">
        <h1 style="
          font-size: 48px;
          font-weight: 700;
          margin: 0 0 20px 0;
          letter-spacing: 2px;
        ">SELF SCORE</h1>
        <div style="
          width: 100px;
          height: 4px;
          background: white;
          margin: 0 auto;
        "></div>
      </div>
      
      <div style="
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 50px 60px;
        max-width: 600px;
        margin: 40px 0;
      ">
        <h2 style="
          font-size: 36px;
          font-weight: 600;
          margin: 0 0 30px 0;
        ">Level 5 Report</h2>
        <p style="
          font-size: 20px;
          margin: 0 0 15px 0;
          opacity: 0.9;
        ">Real-Time AI Voice Interview</p>
        <p style="
          font-size: 24px;
          margin: 0;
          font-weight: 500;
        ">${data.username}</p>
      </div>
      
      <div style="margin-top: 60px; opacity: 0.8;">
        <p style="
          font-size: 18px;
          margin: 0 0 10px 0;
        ">Report Generated: ${data.reportDate}</p>
        <p style="
          font-size: 16px;
          margin: 0;
          opacity: 0.8;
        ">Attempt #${data.attemptNumber}</p>
      </div>
    </div>
  `;
};
