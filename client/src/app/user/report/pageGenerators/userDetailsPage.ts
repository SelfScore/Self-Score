// User Details Page Generator (Page 2)

import { UserReportData } from '../types';
import { formatDate } from '../utils/scoreUtils';

export const generateUserDetailsPage = (userData: UserReportData): string => {
  const formattedDate = formatDate(userData.reportDate);
  const planBadge = userData.level === 1 ? 'FREE' : 'PREMIUM';
  
  return `
    <div style="
      background: linear-gradient(135deg, #F5F5DC 0%, #E8E8D0 100%);
      padding: 40px;
      height: 100%;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: relative;
    ">
      <!-- Logo and Badge -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 60px;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="
            width: 32px;
            height: 32px;
            background: #E87A42;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 16px;
              height: 16px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
          <span style="
            font-size: 20px;
            font-weight: 700;
            color: #2B2B2B;
          ">SELF SCORE</span>
        </div>

        <div style="
          background: #0C677A;
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
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
      ">User Details</h2>

      <!-- Details Table -->
      <table style="
        width: 100%;
        max-width: 600px;
        border-collapse: collapse;
        background: white;
        border: 1px solid #DDD;
      ">
        <tr style="border-bottom: 1px solid #DDD;">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            width: 180px;
            border-right: 1px solid #DDD;
          ">Name</td>
          <td style="
            padding: 16px 20px;
            color: #666;
          ">${userData.username}</td>
        </tr>
        
        <tr style="border-bottom: 1px solid #DDD;">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid #DDD;
          ">Email ID</td>
          <td style="
            padding: 16px 20px;
            color: #666;
          ">${userData.email}</td>
        </tr>
        
        <tr style="border-bottom: 1px solid #DDD;">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid #DDD;
          ">Phone Number</td>
          <td style="
            padding: 16px 20px;
            color: #666;
          ">${userData.phoneNumber || 'Not provided'}</td>
        </tr>
        
        <tr style="border-bottom: 1px solid #DDD;">
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid #DDD;
          ">Report Date</td>
          <td style="
            padding: 16px 20px;
            color: #666;
          ">${formattedDate}</td>
        </tr>
        
        <tr>
          <td style="
            padding: 16px 20px;
            font-weight: 600;
            color: #2B2B2B;
            border-right: 1px solid #DDD;
          ">Level ${userData.level} Score</td>
          <td style="
            padding: 16px 20px;
            color: #666;
            font-weight: 600;
          ">${userData.score} / ${userData.maxScore}</td>
        </tr>
      </table>

      <!-- Background Image -->
      <div style="
        position: absolute;
        bottom: 0;
        right: 0;
        width: 50%;
        height: 50%;
        opacity: 0.15;
      ">
        <img 
          src="/images/Report/People.webp" 
          alt="Background" 
          style="
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: bottom right;
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
      ">2 / 10</div>
    </div>
  `;
};
