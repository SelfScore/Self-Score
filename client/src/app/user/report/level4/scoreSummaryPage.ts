// Level 4 Report Score Summary Page

import { Level4ReportData } from './types';

export const generateLevel4ScoreSummaryPage = (data: Level4ReportData): string => {
  const getScoreColor = (score: number): string => {
    if (score >= 800) return '#4CAF50';
    if (score >= 700) return '#8BC34A';
    if (score >= 600) return '#FFC107';
    if (score >= 500) return '#FF9800';
    return '#F44336';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 800) return 'Outstanding';
    if (score >= 700) return 'Excellent';
    if (score >= 600) return 'Very Good';
    if (score >= 500) return 'Good';
    if (score >= 400) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const scorePercentage = ((data.totalScore / 900) * 100).toFixed(1);
  const scoreColor = getScoreColor(data.totalScore);
  const scoreLabel = getScoreLabel(data.totalScore);

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

      <!-- Header -->
      <div style="
        border-bottom: 2px solid #DDD;
        padding-bottom: 16px;
        margin-bottom: 32px;
        position: relative;
        z-index: 1;
      ">
        <h2 style="
          color: #2B2B2B;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
        ">Score Summary</h2>
        <p style="
          color: #666;
          font-size: 14px;
          margin: 0;
        ">Comprehensive evaluation of your Level 4 Mastery Test performance</p>
      </div>

      <!-- Overall Score Card -->
      <div style="
        background: #F7F7F780;
        border: 2px solid #0C677A;
        border-radius: 16px;
        padding: 32px;
        margin-bottom: 32px;
        text-align: center;
        position: relative;
        z-index: 1;
      ">
        <div style="
          font-size: 14px;
          color: #666;
          margin-bottom: 12px;
          font-weight: 500;
        ">Overall Performance</div>
        
        <div style="
          font-size: 48px;
          font-weight: 700;
          color: #0C677A;
          margin: 8px 0;
        ">${data.totalScore} / 900</div>
        
        <div style="
          font-size: 18px;
          color: ${scoreColor};
          font-weight: 600;
          margin-bottom: 16px;
        ">${scoreLabel}</div>
        
        <div style="
          background: #E0E0E0;
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
          margin: 16px auto 8px;
          max-width: 300px;
        ">
          <div style="
            background: #0C677A;
            height: 100%;
            width: ${scorePercentage}%;
            border-radius: 10px;
          "></div>
        </div>
        
        <div style="
          font-size: 16px;
          color: #666;
          font-weight: 500;
        ">${scorePercentage}% Score</div>
      </div>

      <!-- Question-wise Score Breakdown -->
      <div style="margin-bottom: 32px; position: relative; z-index: 1;">
        <h3 style="
          color: #2B2B2B;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 20px;
        ">Question-wise Performance</h3>
        
        <div style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        ">
          ${data.questionReviews.map((review) => `
            <div style="
              background: #F7F7F780;
              border-left: 4px solid #0C677A;
              padding: 16px;
              border-radius: 8px;
            ">
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
              ">
                <span style="
                  font-weight: 600;
                  color: #2B2B2B;
                  font-size: 14px;
                ">Question ${review.questionOrder}</span>
                <span style="
                  background: #0C677A;
                  color: white;
                  padding: 3px 10px;
                  border-radius: 10px;
                  font-weight: 600;
                  font-size: 12px;
                ">${review.score} pts</span>
              </div>
              <div style="
                font-size: 11px;
                color: #666;
                background: white;
                padding: 4px 8px;
                border-radius: 4px;
                display: inline-block;
              ">
                ${review.answerMode} Mode
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Score Interpretation -->
      <div style="
        background: #FFEBE4;
        border-left: 4px solid #E87A42;
        padding: 20px;
        border-radius: 8px;
        position: relative;
        z-index: 1;
      ">
        <h4 style="
          color: #2B2B2B;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
        ">📊 Score Interpretation</h4>
        <div style="
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        ">
          ${
            data.totalScore >= 800
              ? 'Exceptional performance! You have demonstrated outstanding mastery of Level 4 concepts and skills.'
              : data.totalScore >= 700
              ? 'Excellent work! You show strong understanding and application of Level 4 principles.'
              : data.totalScore >= 600
              ? 'Very good performance. You have a solid grasp of Level 4 concepts with room for refinement.'
              : data.totalScore >= 500
              ? 'Good effort! You understand the fundamentals but should focus on strengthening key areas.'
              : data.totalScore >= 400
              ? 'Satisfactory performance. Consider reviewing the material and practicing more to improve.'
              : 'You may benefit from additional study and practice. Review the expert feedback carefully.'
          }
        </div>
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
      ">3</div>
    </div>
  `;
};
