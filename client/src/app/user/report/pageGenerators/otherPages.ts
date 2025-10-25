// Why Upgrade Page Generator (Page 7)
// Key Outcomes Page Generator (Page 8)
// Thank You Page Generator (Page 9)

import { ReportContent } from '../types';

export const generateUpgradePage = (): string => {
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
      <div style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; background: #E87A42; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <div style="width: 16px; height: 16px; background: white; border-radius: 50%;"></div>
          </div>
          <span style="font-size: 20px; font-weight: 700; color: #2B2B2B;">SELF SCORE</span>
        </div>
      </div>

      <h2 style="font-size: 32px; font-weight: 700; color: #2B2B2B; margin: 0 0 8px 0;">Why Upgrade to Level 2</h2>
      <p style="font-size: 14px; color: #666; margin: 0 0 32px 0;">Level 1 gives you clarity. Level 2 gives you direction.</p>

      <div style="display: flex; gap: 24px; margin-bottom: 32px;">
        <div style="flex: 1; background: white; border: 2px solid #E87A42; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #E87A42; margin: 0 0 16px 0;">Level 2 (Premium)</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px; font-size: 14px; color: #666;">• 9 comprehensive questions</li>
            <li style="margin-bottom: 8px; font-size: 14px; color: #666;">• Detailed category analysis</li>
            <li style="margin-bottom: 8px; font-size: 14px; color: #666;">• Personalized action plan</li>
            <li style="margin-bottom: 8px; font-size: 14px; color: #666;">• Professional PDF report</li>
          </ul>
        </div>

        <div style="flex: 1; background: white; border: 2px solid #DDD; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #666; margin: 0 0 16px 0;">Level 1 (Free)</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px; font-size: 14px; color: #999;">• 5 basic questions</li>
            <li style="margin-bottom: 8px; font-size: 14px; color: #999;">• General overview</li>
            <li style="margin-bottom: 8px; font-size: 14px; color: #999;">• Basic recommendations</li>
            <li style="margin-bottom: 8px; font-size: 14px; color: #999;">• Simple score display</li>
          </ul>
        </div>
      </div>

      <h3 style="font-size: 24px; font-weight: 700; color: #2B2B2B; margin: 0 0 24px 0;">What to Expect</h3>

      ${['15-20 Minutes to Complete', '9 Comprehensive Questions', 'Personalized Recommendations', 'Detailed Score Breakdown'].map((item, index) => `
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          <div style="width: 48px; height: 48px; background: #0C677A; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span style="color: white; font-size: 16px; font-weight: 700;">${index + 1}</span>
          </div>
          <div>
            <h4 style="font-size: 16px; font-weight: 700; color: #2B2B2B; margin: 0 0 4px 0;">${item}</h4>
            <p style="font-size: 13px; color: #666; margin: 0;">
              ${index === 0 ? 'Still quick enough to fit in your schedule' : 
                index === 1 ? 'Deeper exploration of life satisfaction, relationships, career, and personal growth' :
                index === 2 ? 'Actionable advice based on your specific results' :
                'Individual scores for 8+ life categories with visual charts'}
            </p>
          </div>
        </div>
      `).join('')}

      <div style="background: #E87A42; color: white; border-radius: 12px; padding: 16px 24px; text-align: center; margin-top: auto;">
        <div style="font-size: 18px; font-weight: 700;">👑 Unlock Level 2 Test</div>
      </div>

      <div style="position: absolute; bottom: 30px; right: 40px; background: #F5F5F5; padding: 8px 16px; border-radius: 20px; font-size: 12px; color: #666;">3 / 10</div>
    </div>
  `;
};

export const generateKeyOutcomesPage = (content: ReportContent): string => {
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
      <div style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; background: #E87A42; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <div style="width: 16px; height: 16px; background: white; border-radius: 50%;"></div>
          </div>
          <span style="font-size: 20px; font-weight: 700; color: #2B2B2B;">SELF SCORE</span>
        </div>
      </div>

      <h2 style="font-size: 32px; font-weight: 700; color: #2B2B2B; margin: 0 0 8px 0;">Key Outcomes</h2>
      <p style="font-size: 14px; color: #666; margin: 0 0 40px 0;">Here's what can help you strengthen your emotional foundation:</p>

      ${content.outcomes.map(outcome => `
        <div style="
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid #DDD;
        ">
          <div style="width: 48px; height: 48px; background: #0C677A; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 style="font-size: 18px; font-weight: 700; color: #2B2B2B; margin: 0;">${outcome}</h3>
        </div>
      `).join('')}

      <h3 style="font-size: 28px; font-weight: 700; color: #2B2B2B; margin: 40px 0 16px 0;">Still Confused?</h3>

      <div style="background: linear-gradient(135deg, #4A9EAE 0%, #5BB5C5 100%); border-radius: 16px; padding: 32px; color: white; position: relative; overflow: hidden;">
        <div style="position: relative; z-index: 1;">
          <h4 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">Book a Consultation with a</h4>
          <h4 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Certified Life Coach</h4>
          <p style="font-size: 14px; margin: 0 0 24px 0; max-width: 400px; line-height: 1.5;">Get one-on-one guidance from a certified life coach to help you understand your results and create a clear path forward.</p>
          <div style="background: white; color: #E87A42; border-radius: 8px; padding: 12px 24px; display: inline-block; font-weight: 700; font-size: 14px;">
            📞 Book a Consultation Call
          </div>
        </div>
        <img src="/images/Report/People.webp" alt="Coaches" style="position: absolute; right: 20px; bottom: 0; width: 200px; height: auto; opacity: 0.8;"/>
      </div>

      <div style="position: absolute; bottom: 30px; right: 40px; background: #F5F5F5; padding: 8px 16px; border-radius: 20px; font-size: 12px; color: #666;">3 / 10</div>
    </div>
  `;
};

export const generateThankYouPage = (): string => {
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
      <div style="margin-bottom: 60px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; background: #E87A42; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <div style="width: 16px; height: 16px; background: white; border-radius: 50%;"></div>
          </div>
          <span style="font-size: 20px; font-weight: 700; color: #2B2B2B;">SELF SCORE</span>
        </div>
      </div>

      <h1 style="font-size: 64px; font-weight: 700; color: #0C677A; margin: 0 0 40px 0;">Thank You</h1>

      <div style="margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="#666" stroke-width="2"/>
            <path d="M2 7L12 13L22 7" stroke="#666" stroke-width="2"/>
          </svg>
          <span style="font-size: 18px; color: #666;">info@selfscore.net</span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92V19.92C22 20.47 21.55 20.92 21 20.92C10.95 20.42 3 12.47 2.5 2.42C2.5 1.87 2.95 1.42 3.5 1.42H6.5C7.05 1.42 7.5 1.87 7.5 2.42V6.92C7.5 7.47 7.05 7.92 6.5 7.92H4.5C4.95 13.42 10.5 18.97 16 19.42V17.42C16 16.87 16.45 16.42 17 16.42H21.5C22.05 16.42 22.5 16.87 22.5 17.42V16.92Z" stroke="#666" stroke-width="2"/>
          </svg>
          <span style="font-size: 18px; color: #666;">+1 (561) 430-0610</span>
        </div>
      </div>

      <div style="flex: 1; display: flex; align-items: flex-end; justify-content: flex-end; position: relative;">
        <img src="/images/Report/People.webp" alt="Tree" style="max-width: 450px; width: 100%; height: auto; object-fit: contain;"/>
      </div>

      <div style="position: absolute; bottom: 60px; left: 40px; font-size: 16px; color: #666;">www.selfscore.net</div>
    </div>
  `;
};
