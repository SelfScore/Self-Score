src/
├── app/
│   ├── (auth)/                          # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── verify-email/
│   │       └── page.tsx
│   ├── admin/                           # Admin dashboard
│   │   ├── layout.tsx                   # Admin-specific layout
│   │   ├── page.tsx                     # Admin dashboard home
│   │   ├── users/
│   │   ├── consultants/
│   │   └── reports/
│   ├── consultant/                      # Consultant dashboard
│   │   ├── layout.tsx                   # Consultant-specific layout
│   │   ├── page.tsx                     # Consultant dashboard home
│   │   ├── clients/
│   │   ├── assessments/
│   │   └── profile/
│   ├── user/                           # User dashboard
│   │   ├── layout.tsx                  # User-specific layout
│   │   ├── page.tsx                    # User dashboard home
│   │   ├── assessment/
│   │   ├── results/
│   │   └── profile/
│   └── api/ (existing)
│
├── components/
│   ├── ui/                             # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts                    # Export all UI components
│   │
│   ├── layout/                         # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   │
│   ├── landing/                        # Landing page sections
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── PricingSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── CTASection.tsx              # Call to Action
│   │   ├── StatsSection.tsx
│   │   └── index.ts                    # Export all landing sections
│   │
│   ├── auth/                           # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── VerificationForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── index.ts
│   │
│   ├── dashboard/                      # Dashboard components
│   │   ├── common/                     # Shared dashboard components
│   │   │   ├── DashboardCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── ChartWrapper.tsx
│   │   │   └── DataTable.tsx
│   │   ├── admin/                      # Admin-specific components
│   │   │   ├── UserManagement.tsx
│   │   │   ├── ConsultantManagement.tsx
│   │   │   └── SystemAnalytics.tsx
│   │   ├── consultant/                 # Consultant-specific components
│   │   │   ├── ClientList.tsx
│   │   │   ├── AssessmentTools.tsx
│   │   │   └── ClientProgress.tsx
│   │   └── user/                       # User-specific components
│   │       ├── ScoreDashboard.tsx
│   │       ├── AssessmentHistory.tsx
│   │       └── ProgressChart.tsx
│   │
│   └── forms/                          # Form components
│       ├── AssessmentForm.tsx
│       ├── ProfileForm.tsx
│       ├── ContactForm.tsx
│       └── index.ts
│
├── lib/                                # Utility functions
│   ├── dbConnect.ts (existing)
│   ├── auth.ts                         # Auth utilities (JWT, sessions)
│   ├── validations.ts                  # Additional validations
│   ├── constants.ts                    # App constants
│   ├── types.ts                        # TypeScript type definitions
│   └── utils.ts                        # General utilities
│
├── hooks/                              # Custom React hooks
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   ├── useApi.ts
│   └── useDashboard.ts
│
├── context/                            # React Context providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── UserContext.tsx
│
└── styles/                             # Additional styles
    ├── globals.css (existing)
    ├── components.css
    └── dashboard.css