// User Details Page Generator (Page 2)

import { UserReportData } from '../types';
import { formatDate } from '../utils/scoreUtils';

export const generateUserDetailsPage = (userData: UserReportData): string => {
  const formattedDate = formatDate(userData.reportDate);
  const planBadge = userData.level === 1 ? 'FREE' : 'PREMIUM';
  
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
          background: #005F73;
          color: white;
          padding: 6px 24px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          height: 28px;
          display: flex;
          align-items: center;
        ">
          CURRENT ACTIVE PLAN - ${planBadge}
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
          ">${userData.username}</td>
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
          ">${userData.email}</td>
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
          ">${userData.phoneNumber || 'Not provided'}</td>
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
        
        <tr>
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid rgba(58, 58, 58, 0.3);
          ">Level ${userData.level} Score</td>
          <td style="
            padding: 16px 20px;
            color: #2B2B2B;
            font-weight: 600;
          ">${userData.score} / ${userData.maxScore}</td>
        </tr>
      </table>

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
      ">2 / 10</div>
    </div>
  `;
};
