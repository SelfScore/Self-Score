// Level 5 Report - Detailed Feedback Pages (Matching Level 4 Design)

import { Level5ReportData, QuestionReviewForReport } from './types';

const generateQuestionDetailCard = (review: QuestionReviewForReport, pageNumber: number): string => {
  return `
    <div class="report-page" style="
      background: #FFFFFF;
      padding: 40px;
      min-height: 297mm;
      height: 297mm;
      display: flex;
      flex-direction: column;
      font-family: 'Faustina', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
      background-image: url('/images/Report/BGImg.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    ">
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

      <!-- Header -->
      <div style="
        border-bottom: 2px solid #DDD;
        padding-bottom: 16px;
        margin-bottom: 24px;
        position: relative;
        z-index: 1;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h2 style="
            color: #2B2B2B;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
          ">Question ${review.questionOrder}</h2>
          <div style="
            background: #6A1B9A;
            color: white;
            padding: 6px 14px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            🎤 VOICE
          </div>
        </div>
      </div>

      <!-- Question Text -->
      <div style="margin-bottom: 24px; position: relative; z-index: 1;">
        <h3 style="
          color: #2B2B2B;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
        ">Question:</h3>
        <div style="
          background: #F7F7F780;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #0C677A;
          font-size: 14px;
          line-height: 1.6;
          color: #2B2B2B;
        ">${review.questionText}</div>
      </div>

      <!-- User Answer -->
      <div style="margin-bottom: 24px; position: relative; z-index: 1;">
        <h3 style="
          color: #2B2B2B;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
        ">Your Voice Response:</h3>
        <div style="
          background: #F3E5F5;
          padding: 15px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          border-left: 3px solid #6A1B9A;
        ">${review.userAnswer || 'No response provided'}</div>
      </div>

      <!-- Score -->
      <div style="margin-bottom: 24px; position: relative; z-index: 1;">
        <div style="
          background: #F7F7F780;
          border: 2px solid #0C677A;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <span style="
            font-size: 16px;
            font-weight: 600;
            color: #2B2B2B;
          ">Score for this question:</span>
          <span style="
            background: #0C677A;
            color: white;
            padding: 8px 20px;
            border-radius: 10px;
            font-size: 20px;
            font-weight: 700;
          ">${review.score} points</span>
        </div>
      </div>

      <!-- Expert Remark -->
      <div style="
        background: #FFEBE4;
        border: 2px solid #E87A42;
        border-radius: 12px;
        padding: 20px;
        position: relative;
        z-index: 1;
      ">
        <h3 style="
          color: #2B2B2B;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          ⭐ Expert Feedback
        </h3>
        <div style="
          color: #666;
          font-size: 14px;
          line-height: 1.7;
          white-space: pre-wrap;
        ">${review.expertRemark}</div>
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
      ">${pageNumber}</div>
    </div>
  `;
};

export const generateLevel5DetailedFeedbackPages = (data: Level5ReportData): string => {
  return data.questionReviews
    .sort((a, b) => a.questionOrder - b.questionOrder)
    .map((review, index) => generateQuestionDetailCard(review, index + 4))
    .join('\n');
};
