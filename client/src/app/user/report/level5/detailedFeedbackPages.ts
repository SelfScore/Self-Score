// Level 5 Report - Detailed Feedback Pages

import { Level5ReportData } from "./types";

export const generateLevel5DetailedFeedbackPages = (
  data: Level5ReportData
): string => {
  return data.questionReviews
    .map((review) => {
      const scorePercentage = (review.score / 36) * 100; // Assuming max 36 per question

      const getScoreColor = (score: number): string => {
        if (score >= 30) return "#10B981";
        if (score >= 20) return "#F59E0B";
        return "#EF4444";
      };

      return `
      <div class="report-page" style="padding: 60px; background: #FFFFFF;">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #005F73;
        ">
          <h2 style="
            color: #005F73;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
          ">Question ${review.questionOrder}</h2>
          <div style="
            background: ${getScoreColor(review.score)};
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: 700;
          ">${review.score} pts</div>
        </div>
        
        <div style="
          background: #F0F9FF;
          border-left: 5px solid #0A9396;
          padding: 25px;
          border-radius: 10px;
          margin-bottom: 35px;
        ">
          <p style="
            color: #005F73;
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            line-height: 1.6;
          ">${review.questionText}</p>
        </div>
        
        <div style="margin-bottom: 35px;">
          <h3 style="
            color: #374151;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 15px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">Your Voice Response</h3>
          <div style="
            background: #F8F9FA;
            border-radius: 10px;
            padding: 25px;
            border: 1px solid #E5E7EB;
          ">
            <p style="
              color: #1A1A1A;
              font-size: 16px;
              margin: 0;
              line-height: 1.8;
              white-space: pre-wrap;
            ">${review.userAnswer}</p>
          </div>
        </div>
        
        <div>
          <h3 style="
            color: #374151;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 15px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">Expert Feedback</h3>
          <div style="
            background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
            border-radius: 10px;
            padding: 25px;
            border-left: 5px solid #F59E0B;
          ">
            <p style="
              color: #1A1A1A;
              font-size: 16px;
              margin: 0;
              line-height: 1.8;
              white-space: pre-wrap;
            ">${review.expertRemark}</p>
          </div>
        </div>
        
        <div style="
          margin-top: 35px;
          padding-top: 25px;
          border-top: 2px solid #E5E7EB;
        ">
          <div style="
            background: #F8F9FA;
            border-radius: 10px;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span style="color: #666; font-size: 14px;">Score Percentage</span>
            <span style="
              color: ${getScoreColor(review.score)};
              font-size: 20px;
              font-weight: 700;
            ">${scorePercentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
};
