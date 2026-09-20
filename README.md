# Enterprise-Google-Chat-Portal-Automation-Engine
A high-performance, glassmorphism-styled web application built on Google Apps Script that allows teams to dispatch beautifully formatted Google Chat V2 cards, schedule future announcements, track audit logs, and trigger 
automated background reminders to multiple Google Chat spaces using webhooks.

Key Features
🎨 Glassmorphism Dashboard: Maximize screen utilization with a multi-column, dark-gradient UI styled using modern Inter typography.

📍 Multi-Space Webhook Routing: Direct messaging support across dedicated target spaces (VM CM, VM EOD, and CM EOD).

👁️ Real-Time Live Card Preview: Live rendering engine that displays exactly how Google Chat V2 Cards will render before dispatching.

⚡ Quick Fill Premade Templates: Instantly populate messaging content for standard team reminders, announcements, kudos, outage alerts, and new hire onboardings.

⏰ Native Time-Driven Scheduling: Schedule one-time or recurring automated broadcasts running directly via Google Workspace triggers.

🏆 Categorized Theming & Gamification: Custom Google Material header icons and brand colors based on payload categories (General Reminder, Monthly PKT, Kudos, Rewards & Recognition, etc.).

🔒 Enterprise Audit Trail: Tracks all activity by recording execution timestamps, target spaces, message content, and dispatch statuses to a centralized Google Sheets database.

🖼️ Dynamic HD Background Manager: Global admin panel allowing instantaneous wallpaper configuration without modifying core code.
🛠️ Tech Stack & Architecture
Frontend: HTML5, CSS3 (Glassmorphism + Responsive Grid), JavaScript (ES6+), Google Material Icons, Inter & Roboto Fonts.

Backend: Google Apps Script (Code.gs), Google Chat API (V2 Cards Payload Engine), PropertiesService.

Database / Logging: Google Sheets API.

Trigger Engine: Google Apps Script Time-Driven Project Triggers.

📁 Repository Structure
├── Code.gs         # Backend service, webhook handling, trigger management, and audit logging
├── Index.html      # Glassmorphism UI, client-side preview engine, and event handlers
└── README.md       # Project documentation
⚙️ Setup & Deployment Guide
1. Database Setup (Google Sheets)
Create a new Google Sheet named Chat App Database.

Rename the first tab/sheet to AuditLog.

Add the following column headers in Row 1:

Plaintext
Timestamp | User Email | Message Type | Space | Message Content | Status
Copy the URL of your Google Sheet.

2. Apps Script Configuration
Go to script.google.com and create a New Project.

Paste the contents of Code.gs into the script editor.

Replace the DATABASE_SHEET_URL constant with your copied Google Sheet URL:

JavaScript
const DATABASE_SHEET_URL = 'YOUR_GOOGLE_SHEET_URL_HERE';
Confirm your Webhook endpoints inside the WEBHOOK_URLS object in Code.gs:

JavaScript
const WEBHOOK_URLS = {
  'VM CM': 'YOUR_VM_CM_WEBHOOK_URL',
  'VM EOD': 'YOUR_VM_EOD_WEBHOOK_URL',
  'CM EOD': 'YOUR_CM_EOD_WEBHOOK_URL'
};
Create an HTML file named Index and paste the contents of Index.html.

3. Deployment
In the top right of the editor, click Deploy > New deployment.

Choose Web app as the deployment type.

Configure the execution settings:

Execute as: User accessing the web app (for email capturing) or Me (depending on access rules).

Who has access: Anyone within your organization.

Click Deploy, review required Google permissions, and copy your live Web App URL.

📖 Usage Guide
Sending / Scheduling Messages
Open the deployed Web App URL.

Choose the Target Space (VM CM, VM EOD, or CM EOD).

Select a Quick Fill Template or compose a custom message.

Set Execution Timing:

Immediate Dispatch: Sends the V2 Card to Google Chat immediately.

Schedule for Future: Set a future date and time for background dispatch.

Watch the Live Card Preview panel on the right side of the screen update in real time.

Click Dispatch Payload →.

Changing the Background Image
Click the ⚙️ Background button in the header.

Enter a direct HD public URL (from Unsplash, Imgur, etc.).

The background will update instantly and save globally across all users using PropertiesService.

🔐 Security & Governance
Webhook endpoints are abstracted within the backend environment and never exposed to client-side scripts.

Confidentiality is maintained by omitting user identity tags from the public Google Chat cards while maintaining a full audit trail in the backend Google Sheet.
