// Cover Page Generator (Page 1)

export const generateCoverPage = (username: string, level: number): string => {
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
      <!-- Logo -->
      <div style="margin-bottom: 60px;">
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
            letter-spacing: 0.5px;
          ">SELF SCORE</span>
        </div>
      </div>

      <!-- Title Section -->
      <div style="margin-bottom: 40px;">
        <div style="
          font-size: 18px;
          color: #666;
          margin-bottom: 16px;
        ">(Level ${level})</div>
        
        <h1 style="
          font-size: 48px;
          font-weight: 700;
          color: #0C677A;
          margin: 0 0 16px 0;
          line-height: 1.2;
        ">Self Score Report</h1>
        
        <p style="
          font-size: 16px;
          color: #666;
          margin: 0;
          max-width: 400px;
          line-height: 1.5;
        ">A snapshot of where you stand emotionally and mentally and where to go next.</p>
      </div>

      <!-- Tree Image Placeholder -->
      <div style="
        flex: 1;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        position: relative;
      ">
        <img 
          src="/images/Report/People.webp" 
          alt="Tree" 
          style="
            max-width: 450px;
            width: 100%;
            height: auto;
            object-fit: contain;
          "
        />
      </div>

      <!-- Name Section -->
      <div style="
        position: absolute;
        bottom: 100px;
        left: 40px;
      ">
        <div style="
          border-left: 4px solid #0C677A;
          padding-left: 16px;
        ">
          <div style="
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          ">Name</div>
          <div style="
            font-size: 24px;
            font-weight: 700;
            color: #2B2B2B;
          ">${username}</div>
        </div>
      </div>
    </div>
  `;
};
