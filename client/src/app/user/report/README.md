# Self Score Report Generation Module

This module handles PDF report generation for Self Score assessments across all levels.

## 📁 Structure

```
src/app/user/report/
├── reportGenerator.ts          # Main report HTML generator
├── types/
│   └── index.ts               # TypeScript interfaces
├── utils/
│   ├── pdfGenerator.ts        # PDF generation utilities
│   ├── scoreUtils.ts          # Score calculation & interpretation
│   └── contentData.ts         # Report content for each level
└── pageGenerators/
    ├── coverPage.ts           # Page 1: Cover page
    ├── userDetailsPage.ts     # Page 2: User information table
    ├── scoreSummaryPage.ts    # Page 3: Score gauge & slider
    ├── detailedReportPage.ts  # Page 4: Characteristics list
    ├── scoreMeaningPage.ts    # Page 5: Semi-circular gauge
    ├── recommendationsPage.ts # Page 6: Personalized recommendations
    ├── otherPages.ts          # Pages 7-9: Upgrade, Outcomes, Thank You
    └── index.ts               # Exports all generators
```

## 🎨 Report Pages

### Level 1 & 2 Reports (9 pages):

1. **Cover Page** - Logo, level, title, user name, tree image
2. **User Details** - Info table with name, email, phone, date, score
3. **Score Summary** - Circular gauge, "Where do you stand" slider, meaning
4. **Detailed Report** - 5 characteristics based on score
5. **Score Meaning** - Semi-circular gauge with 3 zones (350-500-750-900)
6. **Recommendations** - 3 personalized recommendations + Pro Tip + CTA
7. **Upgrade Page** - Level 2 vs Level 1 comparison + What to Expect
8. **Key Outcomes** - 3 outcomes + consultation CTA
9. **Thank You** - Contact info + branding

### Level 3 & 4 Reports:

- Uses dummy content (as specified)
- Same 9-page structure

## 📊 Score Ranges

### Level 1 (out of 900):

- **Calm**: 0-350 (Green)
- **Balanced**: 351-500 (Green)
- **Energized**: 501-750 (Orange) - "You" position
- **Overwhelmed**: 751-900 (Pink)

### Score Zones (Semi-circular gauge):

- **Unaware Zone**: 350-500 (Red)
- **Emotionally Aware**: 500-750 (Orange)
- **Deeply Conscious**: 750-900 (Green)

## 🎯 Usage

### Using the DownloadReportButton Component

```tsx
import DownloadReportButton from "@/app/components/ui/DownloadReportButton";

// In your component
<DownloadReportButton
  userData={{
    username: "John Doe",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    reportDate: new Date().toISOString(),
    level: 1,
    score: 720,
    maxScore: 900,
  }}
  variant="contained" // or "outlined" or "text"
  size="large" // or "medium" or "small"
  fullWidth={false}
/>;
```

### Properties

- `userData`: User and score information
  - `username`: User's display name
  - `email`: User's email
  - `phoneNumber`: User's phone number
  - `reportDate`: ISO date string of test completion
  - `level`: Test level (1-4)
  - `score`: User's score
  - `maxScore`: Maximum possible score (900)
- `variant`: Button style (default: 'outlined')
- `size`: Button size (default: 'medium')
- `fullWidth`: Full width button (default: false)
- `disabled`: Disable button (default: false)

## 📦 Dependencies

- `jspdf`: PDF generation
- `html2canvas`: HTML to canvas conversion
- `@mui/material`: UI components

## 🎨 Design Assets

Reports use images from:

- `/public/images/logos/Logo.png` - Self Score logo
- `/public/images/Report/People.webp` - Tree/people illustration
- `/public/images/Report/BGImg.webp` - Background graphics

## 🔧 Customization

### Adding New Content

Edit `/utils/contentData.ts` to modify:

- Characteristics for each level
- Recommendations
- Pro tips
- Key outcomes

### Modifying Page Design

Each page generator in `/pageGenerators/` returns HTML string with inline styles.
Modify the respective file to change layout, colors, or content.

### Score Interpretation

Edit `/utils/scoreUtils.ts` to modify:

- Score ranges
- Interpretations
- Zone classifications

## 📝 Notes

- All pages use A4 dimensions (210mm x 297mm)
- Colors are print-safe with exact color adjustment
- Background images have low opacity for readability
- Report generation happens client-side
- Progress callback shows generation status (0-100%)

## 🚀 Future Enhancements

- [ ] Add more chart types
- [ ] Implement server-side PDF generation
- [ ] Add email delivery option
- [ ] Create report templates for each level
- [ ] Add comparison charts for multiple attempts
