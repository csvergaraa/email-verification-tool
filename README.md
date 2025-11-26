# Email Verification Tool

A modern and secure email verification tool developed by Townsend Solutions.

![Email Verification Tool](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 Features

### Single Verification
- ✅ Real-time email address verification
- 🔍 Format, DNS, and SMTP validation
- 🚨 Disposable email detection
- 📊 Detailed report with status and technical information
- ⚡ Responsive and intuitive interface

### Bulk Verification
- 📁 Support for CSV and Excel files (.xlsx)
- 🎯 Process up to 10,000 emails
- 📈 Real-time progress bar
- 🔄 Batch processing (50 emails at a time)
- 📊 Dashboard with detailed statistics
- 🎨 Interactive filters by status (valid, invalid, risky)
- 💾 Export results to CSV
- 🖱️ Drag & Drop file upload
- ⬆️ "Back to top" button for long list navigation

### Security and Privacy
- 🔒 **No data stored** - 100% GDPR compliant
- 🗑️ All data processed in memory and discarded after verification
- 🛡️ Visible privacy badge in the interface
- ✨ Zero personal data retention

## 🛠️ Technologies

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19.2, Tailwind CSS v4
- **Components**: shadcn/ui
- **Validation**: DNS lookup, SMTP verification
- **Processing**: xlsx for Excel files
- **TypeScript**: Complete end-to-end typing

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

## 🔧 Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/email-verification-tool.git
cd email-verification-tool
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 How to Use

### Single Verification

1. Go to the **"Single Check"** tab
2. Enter the email address you want to verify
3. Click **"Verify Email"**
4. View the result with technical details:
   - ✅ Valid: Valid and functional email
   - ❌ Invalid: Invalid or non-existent email
   - ⚠️ Risky: Risky email (disposable or suspicious)
   - 🔴 Error: Error during verification

### Bulk Verification

1. Go to the **"Bulk Check"** tab
2. Prepare your file:
   - CSV format with "Email" column
   - Excel format (.xlsx) with "Email" column
   - Maximum of 10,000 emails
3. Upload:
   - Drag and drop the file into the designated area
   - Or click to select the file
4. Wait for processing (real-time progress)
5. View results:
   - Dashboard with statistics
   - Click on cards to filter by status
   - Complete table with all results
6. Export results by clicking **"Download CSV Report"**

## 🔌 API

### POST `/api/verify-email`

Verifies a single email address.

**Request Body:**
\`\`\`json
{
  "email": "example@domain.com"
}
\`\`\`

**Response:**
\`\`\`json
{
  "email": "example@domain.com",
  "status": "valid",
  "is_valid_format": true,
  "is_disposable": false,
  "dns_valid": true,
  "smtp_valid": true,
  "details": {
    "format": "✓ Valid format",
    "dns": "✓ DNS records found",
    "smtp": "✓ SMTP server responds",
    "disposable": "✓ Not a disposable email"
  }
}
\`\`\`

### POST `/api/verify-bulk`

Verifies multiple email addresses.

**Request Body:**
\`\`\`json
{
  "emails": ["email1@domain.com", "email2@domain.com"]
}
\`\`\`

**Response:**
\`\`\`json
{
  "results": [
    {
      "email": "email1@domain.com",
      "status": "valid",
      "is_valid_format": true,
      "is_disposable": false,
      "dns_valid": true,
      "smtp_valid": true
    }
  ]
}
\`\`\`

## 🔐 Privacy and Compliance

This tool was developed with privacy in mind:

- ✅ **Zero storage**: No email or result is saved in a database
- ✅ **In-memory processing**: All data is processed temporarily
- ✅ **Automatic disposal**: Data is eliminated immediately after verification
- ✅ **GDPR compliant**: Fully compatible with privacy regulations
- ✅ **No tracking cookies**: Only verification processing

## 🎨 Design

- **Colors**: 3-5 color system with primary blue tone (#1E40AF)
- **Typography**: Geist Sans font for modern interface
- **Layout**: Mobile-first with responsive design
- **Accessibility**: Full screen reader support (aria-live regions)

## 📁 Project Structure

\`\`\`
email-verification-tool/
├── app/
│   ├── api/
│   │   ├── verify-email/route.ts    # Single verification API
│   │   └── verify-bulk/route.ts     # Bulk verification API
│   ├── layout.tsx                    # Main layout
│   ├── page.tsx                      # Main page
│   └── globals.css                   # Global styles
├── components/
│   ├── ui/                           # shadcn/ui components
│   └── privacy-badge.tsx             # Privacy badge
├── lib/
│   ├── email-validator.ts            # Validation logic
│   └── utils.ts                      # Utilities
└── public/                           # Static files
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 👥 Credits

- **Developed by**: Townsend Solutions
- **Design by**: Vergara Design
- **Technology**: Vercel v0

## 📞 Support

For support or questions, contact us through:
- Website: [Townsend Solutions](https://vergaratec.com/townsend)
- Email: support@townsend.com

---

**Townsend Solutions - All Rights Reserved. Design by Vergara Design.**
