// Level 5 Report - User Details Page (Matching Level 4 Design)

import { Level5ReportData } from './types';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

export const generateLevel5UserDetailsPage = (data: Level5ReportData): string => {
  const formattedPhoneNumber = data.phoneNumber || 'Not provided';
  const formattedDate = formatDate(data.reportDate);

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
      <!-- Logo and Badge -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 60px;
        position: relative;
        z-index: 1;
      ">
        <img 
          src="/images/logos/LogoWithText.png" 
          alt="Self Score Logo" 
          style="
            width: 150px;
            height: auto;
            object-fit: contain;
          "
        />

        <div style="
          background: #0C677A;
          color: white;
          padding: 6px 24px 10px 24px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          line-height: 1;
          text-align: center;
        ">
          LEVEL 5 - VOICE INTERVIEW
        </div>
      </div>

      <!-- User Details Heading -->
      <h2 style="
        font-size: 32px;
        font-weight: 700;
        color: #2B2B2B;
        margin: 0 0 24px 0;
        position: relative;
        z-index: 1;
      ">User Details</h2>

      <!-- Details Table -->
      <table style="
        width: 100%;
        max-width: 600px;
        border-collapse: collapse;
        background: rgba(247, 247, 247, 0.5);
        border: 1px solid rgba(58, 58, 58, 0.3);
        position: relative;
        z-index: 1;
        margin: 0 auto;
      ">
        <tr style="border-bottom: 1px solid rgba(58, 58, 58, 0.3);">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            width: 180px;
            border-right: 1px solid rgba(58, 58, 58, 0.3);
          ">Name</td>
          <td style="
            padding: 16px 20px;
            color: #2B2B2B;
          ">${data.username}</td>
        </tr>
        
        <tr style="border-bottom: 1px solid rgba(58, 58, 58, 0.3);">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid rgba(58, 58, 58, 0.3);
          ">Email ID</td>
          <td style="
            padding: 16px 20px;
            color: #2B2B2B;
          ">${data.email}</td>
        </tr>
        
        <tr style="border-bottom: 1px solid rgba(58, 58, 58, 0.3);">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid rgba(58, 58, 58, 0.3);
          ">Phone Number</td>
          <td style="
            padding: 16px 20px;
            color: #2B2B2B;
          ">${formattedPhoneNumber}</td>
        </tr>
        
        <tr style="border-bottom: 1px solid rgba(58, 58, 58, 0.3);">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid rgba(58, 58, 58, 0.3);
          ">Report Date</td>
          <td style="
            padding: 16px 20px;
            color: #2B2B2B;
          ">${formattedDate}</td>
        </tr>
        
        <tr style="border-bottom: 1px solid rgba(58, 58, 58, 0.3);">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid rgba(58, 58, 58, 0.3);
          ">Attempt Number</td>
          <td style="
            padding: 16px 20px;
            color: #2B2B2B;
          ">${data.attemptNumber}</td>
        </tr>
        
        <tr style="border-bottom: 1px solid rgba(58, 58, 58, 0.3);">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid rgba(58, 58, 58, 0.3);
          ">Interview Type</td>
          <td style="
            padding: 16px 20px;
            color: #2B2B2B;
          ">Real-Time AI Voice</td>
        </tr>
        
        <tr>
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid rgba(58, 58, 58, 0.3);
          ">Total Questions</td>
          <td style="
            padding: 16px 20px;
            color: #2B2B2B;
          ">${data.questionReviews.length}</td>
        </tr>
      </table>

      <!-- Additional Info -->
      <div style="
        margin-top: 40px;
        padding: 24px;
        background: rgba(12, 103, 122, 0.1);
        border-left: 4px solid #0C677A;
        border-radius: 8px;
        position: relative;
        z-index: 1;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      ">
        <h3 style="
          font-size: 18px;
          font-weight: 700;
          color: #0C677A;
          margin: 0 0 12px 0;
        ">About Level 5 Voice Interview</h3>
        <p style="
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        ">
          This report contains expert-reviewed feedback on your real-time AI voice interview responses. 
          Each response has been carefully evaluated to provide you with personalized insights 
          and actionable recommendations for your personal growth journey.
        </p>
      </div>

      ${data.interviewMetadata ? `
      <!-- Interview Metadata -->
      <div style="
        margin-top: 24px;
        padding: 20px;
        background: rgba(232, 122, 66, 0.1);
        border-left: 4px solid #E87A42;
        border-radius: 8px;
        position: relative;
        z-index: 1;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
        display: flex;
        gap: 40px;
      ">
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Total Duration</div>
          <div style="font-size: 18px; font-weight: 600; color: #2B2B2B;">${formatDuration(data.interviewMetadata.totalDuration)}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Follow-up Questions</div>
          <div style="font-size: 18px; font-weight: 600; color: #2B2B2B;">${data.interviewMetadata.followUpCount}</div>
        </div>
      </div>
      ` : ''}

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
      ">2</div>
    </div>
  `;
};
