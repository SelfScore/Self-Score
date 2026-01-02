// Level 4 Report Thank You Page

import { Level4ReportData } from './types';

export const generateLevel4ThankYouPage = (data: Level4ReportData, pageNumber: number): string => {
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
      background-image: url('/images/Report/BGImgCover.jpg');
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
      <div style="margin-bottom: 60px; position: relative; z-index: 1;">
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

      <h1 style="font-size: 64px; font-weight: 700; color: #0C677A; margin: 0 0 40px 0; position: relative; z-index: 1;">Thank You</h1>

      <p style="
        font-size: 18px;
        color: #666;
        margin: 0 0 40px 0;
        max-width: 600px;
        line-height: 1.6;
        position: relative;
        z-index: 1;
      ">
        Congratulations on completing the Level 4 Mastery Test! Your dedication to personal growth is commendable.
      </p>

      <!-- Key Stats -->
      <div style="
        background: #F7F7F780;
        border: 2px solid #0C677A;
        border-radius: 16px;
        padding: 32px;
        margin-bottom: 40px;
        max-width: 500px;
        position: relative;
        z-index: 1;
      ">
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        ">
          <div>
            <div style="
              font-size: 12px;
              color: #666;
              margin-bottom: 8px;
            ">Your Score</div>
            <div style="
              font-size: 36px;
              font-weight: 700;
              color: #0C677A;
            ">${data.totalScore}</div>
          </div>
          <div>
            <div style="
              font-size: 12px;
              color: #666;
              margin-bottom: 8px;
            ">Questions</div>
            <div style="
              font-size: 36px;
              font-weight: 700;
              color: #0C677A;
            ">${data.questionReviews.length}</div>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div style="
        text-align: left;
        max-width: 600px;
        width: 100%;
        position: relative;
        z-index: 1;
      ">
        <h3 style="
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #0C677A;
        ">What's Next?</h3>
        
        <div style="
          display: flex;
          flex-direction: column;
          gap: 15px;
        ">
          <div style="
            display: flex;
            align-items: start;
            gap: 15px;
          ">
            <div style="
              min-width: 30px;
              height: 30px;
              background: #0C677A;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 14px;
            ">1</div>
            <p style="margin: 0; line-height: 1.6; color: #666; font-size: 16px;">
              Review this detailed report to understand your expert evaluation
            </p>
          </div>

          <div style="
            display: flex;
            align-items: start;
            gap: 15px;
          ">
            <div style="
              min-width: 30px;
              height: 30px;
              background: #0C677A;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 14px;
            ">2</div>
            <p style="margin: 0; line-height: 1.6; color: #666; font-size: 16px;">
              Implement the personalized recommendations provided by our expert
            </p>
          </div>

          <div style="
            display: flex;
            align-items: start;
            gap: 15px;
          ">
            <div style="
              min-width: 30px;
              height: 30px;
              background: #0C677A;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 14px;
            ">3</div>
            <p style="margin: 0; line-height: 1.6; color: #666; font-size: 16px;">
              Visit <a href="https://www.selfscore.net" style="color: #0C677A; text-decoration: underline; font-weight: 600;">www.selfscore.net</a> for more resources and support
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Message -->
      <div style="
        position: absolute;
        bottom: 50px;
        left: 50px;
        right: 50px;
        text-align: center;
        color: #666;
        font-size: 14px;
        z-index: 1;
      ">
        Continue your journey to emotional mastery with Self Score
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
