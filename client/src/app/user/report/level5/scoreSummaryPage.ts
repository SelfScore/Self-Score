// Level 5 Report - Score Summary Page

import { Level5ReportData } from "./types";

export const generateLevel5ScoreSummaryPage = (
  data: Level5ReportData
): string => {
  const percentage = ((data.totalScore - 350) / (900 - 350)) * 100;

  const getScoreCategory = (
    score: number
  ): { label: string; color: string } => {
    if (score >= 800) return { label: "Exceptional", color: "#10B981" };
    if (score >= 700) return { label: "Excellent", color: "#059669" };
    if (score >= 600) return { label: "Good", color: "#F59E0B" };
    if (score >= 500) return { label: "Fair", color: "#F97316" };
    return { label: "Needs Improvement", color: "#EF4444" };
  };

  const category = getScoreCategory(data.totalScore);

  return `
    <div class="report-page" style="padding: 60px; background: #FFFFFF;">
      <h1 style="
        color: #005F73;
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 50px 0;
        border-bottom: 3px solid #005F73;
        padding-bottom: 15px;
      ">Overall Score Summary</h1>
      
      <div style="
        background: linear-gradient(135deg, #005F73 0%, #0A9396 100%);
        border-radius: 20px;
        padding: 50px;
        text-align: center;
        color: white;
        margin-bottom: 40px;
      ">
        <p style="
          font-size: 18px;
          margin: 0 0 20px 0;
          opacity: 0.9;
        ">Your Total Score</p>
        <h2 style="
          font-size: 72px;
          font-weight: 700;
          margin: 0;
          line-height: 1;
        ">${data.totalScore}</h2>
        <p style="
          font-size: 20px;
          margin: 20px 0 0 0;
          opacity: 0.8;
        ">out of 900 points</p>
        
        <div style="
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 15px 30px;
          display: inline-block;
          margin-top: 30px;
        ">
          <p style="
            font-size: 24px;
            font-weight: 600;
            margin: 0;
          ">${category.label}</p>
        </div>
      </div>
      
      <div style="
        background: #F8F9FA;
        border-radius: 15px;
        padding: 40px;
        margin-bottom: 40px;
      ">
        <h3 style="
          color: #005F73;
          font-size: 24px;
          margin: 0 0 25px 0;
        ">Score Breakdown</h3>
        
        <div style="margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #666;">Total Questions</span>
            <span style="color: #1A1A1A; font-weight: 600;">${
              data.questionReviews.length
            }</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #666;">Average Score per Question</span>
            <span style="color: #1A1A1A; font-weight: 600;">${(
              data.totalScore / data.questionReviews.length
            ).toFixed(1)} points</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Overall Performance</span>
            <span style="color: #1A1A1A; font-weight: 600;">${percentage.toFixed(
              1
            )}%</span>
          </div>
        </div>
        
        <div style="
          background: #E5E7EB;
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 20px;
        ">
          <div style="
            background: ${category.color};
            height: 100%;
            width: ${percentage}%;
            border-radius: 10px;
            transition: width 0.5s ease;
          "></div>
        </div>
      </div>
      
      <div style="
        border-left: 5px solid #005F73;
        padding-left: 25px;
        color: #666;
      ">
        <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.6;">
          This score reflects your performance across ${
            data.questionReviews.length
          } comprehensive questions 
          in the real-time AI voice interview. Each question was evaluated by our expert team based on 
          your voice responses.
        </p>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">
          The detailed feedback on the following pages provides insights into your strengths 
          and areas for growth.
        </p>
      </div>
    </div>
  `;
};
