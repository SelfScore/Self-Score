// Level 5 Report - User Details Page

import { Level5ReportData } from "./types";

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

export const generateLevel5UserDetailsPage = (
  data: Level5ReportData
): string => {
  return `
    <div class="report-page" style="padding: 60px; background: #FFFFFF;">
      <h1 style="
        color: #005F73;
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 40px 0;
        border-bottom: 3px solid #005F73;
        padding-bottom: 15px;
      ">User Information</h1>
      
      <div style="margin-bottom: 50px;">
        <div style="margin-bottom: 25px;">
          <p style="
            color: #666;
            font-size: 14px;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">Full Name</p>
          <p style="
            color: #1A1A1A;
            font-size: 20px;
            font-weight: 600;
            margin: 0;
          ">${data.username}</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <p style="
            color: #666;
            font-size: 14px;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">Email Address</p>
          <p style="
            color: #1A1A1A;
            font-size: 18px;
            margin: 0;
          ">${data.email}</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <p style="
            color: #666;
            font-size: 14px;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">Phone Number</p>
          <p style="
            color: #1A1A1A;
            font-size: 18px;
            margin: 0;
          ">${data.phoneNumber}</p>
        </div>
      </div>
      
      <h2 style="
        color: #005F73;
        font-size: 28px;
        font-weight: 700;
        margin: 60px 0 30px 0;
      ">Interview Details</h2>
      
      <div style="
        background: #F8F9FA;
        border-radius: 15px;
        padding: 30px;
        border-left: 5px solid #005F73;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Interview Type</p>
            <p style="color: #1A1A1A; font-size: 18px; font-weight: 600; margin: 0;">Real-Time AI Voice</p>
          </div>
          <div>
            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Attempt Number</p>
            <p style="color: #1A1A1A; font-size: 18px; font-weight: 600; margin: 0;">#${
              data.attemptNumber
            }</p>
          </div>
        </div>
        
        ${
          data.interviewMetadata
            ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Total Duration</p>
            <p style="color: #1A1A1A; font-size: 18px; font-weight: 600; margin: 0;">${formatDuration(
              data.interviewMetadata.totalDuration
            )}</p>
          </div>
          <div>
            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Follow-up Questions</p>
            <p style="color: #1A1A1A; font-size: 18px; font-weight: 600; margin: 0;">${
              data.interviewMetadata.followUpCount
            }</p>
          </div>
        </div>
        `
            : ""
        }
        
        <div>
          <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Report Date</p>
          <p style="color: #1A1A1A; font-size: 18px; font-weight: 600; margin: 0;">${
            data.reportDate
          }</p>
        </div>
      </div>
    </div>
  `;
};
