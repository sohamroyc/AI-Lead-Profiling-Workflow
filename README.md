# 🚀 AI-Powered Lead Profiling & Sales Automation Workflow

An end-to-end AI automation system that captures website leads, analyzes customer intent using Google Gemini, classifies and prioritizes leads, stores structured data in Google Sheets, and automatically notifies the sales team via Gmail.

This project demonstrates how AI and workflow automation can eliminate manual lead qualification and accelerate the sales process using **n8n**.

---

## 📌 Project Overview

The application consists of two major components:

- **Frontend** – A responsive lead capture website built with Lovable.
- **Backend Automation** – An n8n workflow that processes incoming leads using AI.

When a visitor submits the form, the workflow automatically:

1. Receives the form data through an n8n Webhook.
2. Cleans and normalizes the incoming data.
3. Sends the visitor details, message, and browsing history to Google Gemini.
4. Classifies the lead into the appropriate business category.
5. Generates an AI-based lead score, priority, and reasoning.
6. Stores the processed lead inside Google Sheets.
7. Sends an email notification to the sales team.
8. Returns a success response to the website.

---

# 🏗 Architecture

```
Website Form
      │
      ▼
n8n Webhook
      │
      ▼
Data Cleaning
      │
      ▼
Google Gemini AI
      │
      ├── Lead Classification
      ├── Lead Score
      ├── Priority
      └── AI Reasoning
      │
      ▼
Google Sheets
      │
      ▼
Gmail Notification
      │
      ▼
Webhook Response
```

---

# ✨ Features

- AI-powered Lead Qualification
- Intelligent Lead Categorization
- Automated Lead Scoring
- Priority Detection (Hot / Warm / Cold)
- Google Gemini Integration
- Google Sheets Database Logging
- Gmail Sales Notifications
- Webhook-based API Integration
- Zero Manual Lead Routing
- Real-time Processing

---

# 🧠 AI Lead Analysis

The Google Gemini model evaluates:

- Visitor message
- Business requirements
- Company information
- Budget
- Simulated page visit history
- Buying intent

The model returns structured output including:

- Lead Category
- Lead Score
- Priority
- Confidence
- AI Reasoning

---

# 🛠 Tech Stack

### Frontend

- Lovable
- React
- TypeScript
- Tailwind CSS

### Automation

- n8n

### AI

- Google Gemini

### Integrations

- Google Sheets API
- Gmail API
- Webhooks

---

# 📂 Project Structure

```
AI-Lead-Profiling-Workflow/

├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── n8n/
│   └── Lead-Scoring-Routing.json
│
├── screenshots/
│
├── README.md
│
└── LICENSE
```

---

# 🔄 Workflow Execution

1. User submits the lead capture form.
2. n8n Webhook receives the request.
3. Incoming data is cleaned and formatted.
4. Google Gemini analyzes the lead.
5. AI generates:
   - Category
   - Score
   - Priority
   - Reasoning
6. Lead data is stored in Google Sheets.
7. Gmail sends an instant notification.
8. Website receives a success response.

---

# 📷 Demo

## Website

> Add your deployed Lovable URL here.

## Workflow

Import the workflow located in:

```
n8n/Lead-Scoring-Routing.json
```

---

# 🚀 Future Improvements

- CRM Integration (HubSpot / Salesforce)
- Slack & Microsoft Teams Notifications
- Lead Assignment Automation
- PDF Report Generation
- AI Email Reply Generation
- Dashboard & Analytics
- Duplicate Lead Detection
- WhatsApp Notifications
- Multi-language AI Support

---

# 🎯 Use Cases

- Sales Automation
- AI Lead Qualification
- Customer Inquiry Routing
- CRM Data Enrichment
- Business Process Automation
- Marketing Lead Scoring

---

# 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Soham Roy Chowdhury**

B.Tech Computer Science Engineering

AI | Automation | Full Stack Development | Workflow Engineering
