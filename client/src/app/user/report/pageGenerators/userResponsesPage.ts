// User Responses Page Generator for Level 1, 2, and 3 Reports

export const generateUserResponsesPages = (
  responses: any[],
  level: number,
  startPageNumber: number,
  totalPages: number
): string => {
  if (!responses || responses.length === 0) {
    return '';
  }

  // Sort responses by order if available
  const sortedResponses = [...responses].sort((a, b) => {
    const orderA = a.questionId?.order ?? 0;
    const orderB = b.questionId?.order ?? 0;
    return orderA - orderB;
  });

  const itemsPerPage = 8;
  const pageCount = Math.ceil(sortedResponses.length / itemsPerPage);
  let html = '';

  for (let p = 0; p < pageCount; p++) {
    const pageResponses = sortedResponses.slice(p * itemsPerPage, (p + 1) * itemsPerPage);
    const currentPageNumber = startPageNumber + p;

    html += `
      <div class="report-page">
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
          <div style="margin-bottom: 20px; position: relative; z-index: 1;">
            <img 
              src="/images/logos/LogoWithText.png" 
              alt="Self Score Logo" 
              style="
                width: 140px;
                height: auto;
                object-fit: contain;
              "
            />
          </div>

          <h2 style="font-size: 32px; font-weight: 700; color: #2B2B2B; margin: 0 0 4px 0; position: relative; z-index: 1;">Your Responses</h2>
          <p style="font-size: 14px; color: #666; margin: 0 0 20px 0; position: relative; z-index: 1;">Your exact answers for the Level ${level} questionnaire (Page ${p + 1} of ${pageCount})</p>

          <div style="position: relative; z-index: 1; flex-grow: 1;">
            <table style="
              width: 100%;
              border-collapse: collapse;
              text-align: left;
            ">
              <thead>
                <tr style="border-bottom: 2px solid #005F73;">
                  <th style="padding: 8px; font-size: 14px; font-weight: 700; color: #005F73; width: 45px;">No.</th>
                  <th style="padding: 8px; font-size: 14px; font-weight: 700; color: #005F73;">Question & Answer</th>
                </tr>
              </thead>
              <tbody>
                ${pageResponses.map((resp, idx) => {
                  const qNum = p * itemsPerPage + idx + 1;
                  const question = resp.questionId;
                  const qText = question?.questionText || 'Question text not found';
                  const options = question?.options;
                  const selIdx = resp.selectedOptionIndex;
                  
                  let displayAnswer = '';
                  if (options && options.length > 0 && selIdx < options.length) {
                    displayAnswer = options[selIdx];
                  } else {
                    displayAnswer = `${selIdx} / 10`;
                  }

                  return `
                    <tr style="border-bottom: 1px solid rgba(58, 58, 58, 0.15); font-family: 'Source Sans Pro', sans-serif;">
                      <td style="padding: 10px 8px; font-size: 13px; color: #2B2B2B; font-weight: 600; vertical-align: top;">${qNum}</td>
                      <td style="padding: 10px 8px; vertical-align: top;">
                        <div style="font-size: 13px; color: #2B2B2B; line-height: 1.4; margin-bottom: 6px;">
                          ${qText}
                        </div>
                        <div style="margin-bottom: 6px;">
                          <span style="background: rgba(0, 95, 115, 0.08); padding: 4px 10px; border-radius: 6px; display: inline-block; font-size: 12px; color: #005F73; font-weight: 600;">
                            Your Answer: ${displayAnswer}
                          </span>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

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
          ">${currentPageNumber} / ${totalPages}</div>
        </div>
      </div>
    `;
  }

  return html;
};
