# PromptVerse

An AI-powered multi-platform app for generating high-quality content using prompt templates. PromptVerse allows different roles in a software team (Developer, PM, BA, QA, PO, etc.) to generate PRDs, Jira tickets, test cases, user stories, and more using AI.

## Architecture

PromptVerse is built as a modular monorepo with:

1. **`prompt-engine`** - A reusable core TypeScript package that processes prompt templates with context
2. **`prompt-ui`** - A React + Tailwind + Zustand frontend application
3. **Shared types and templates** - Common interfaces and sample templates

## Features

- 🧠 **Smart Input** - Natural language template discovery - just describe what you want to create
- 📚 **Template Library** - Pre-built templates for different roles and use cases
- 🎮 **Interactive Playground** - Live preview and generation of prompts
- 🔧 **Context Manager** - CRUD operations for project context
- 📖 **Prompt History** - Track and reuse previous prompts
- 🎯 **Smart Filtering** - Filter templates by role, use case, or search
- 📋 **Copy & Export** - Easy sharing of generated prompts

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the prompt-engine package:
```bash
cd packages/prompt-engine
npm run build
cd ../..
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Usage

### 1. Select a Template
Browse the template library and choose a template that matches your role and use case.

### 2. Fill Context
Use the Context Manager to fill in the required and optional fields for your template.

### 3. Generate Prompt
The Playground shows a live preview of your prompt. Click "Generate" to create the final prompt.

### 4. Copy & Use
Copy the generated prompt to use with your favorite AI model (ChatGPT, Claude, etc.).

## ✅ Testing the Application

### End-to-End Testing Guide

1. **Start the Application**
   ```bash
   npm run dev --workspace=apps/prompt-ui
   ```
   - Open http://localhost:5174 in your browser

2. **Test Template Selection**
   - Browse available templates in the left panel
   - Filter by role (Developer, PM, BA, QA, PO)
   - Filter by use case or search
   - Select a template to load it

3. **Test Context Management**
   - Fill in required fields in the Context Manager
   - Notice validation feedback for missing fields
   - Try different input values

4. **Test Prompt Generation**
   - Click "Generate Prompt" to create basic prompt
   - Switch between Template/Preview/Output tabs
   - Copy generated prompt to clipboard

5. **Test AI Integration**
   - Configure model settings (gear icon in Playground)
   - Adjust temperature, max tokens, model selection
   - Click "Generate with AI" for AI-powered response
   - Copy AI response to clipboard

6. **Test Export Functionality**
   - Export generated content as JSON
   - Verify exported data includes context, prompt, and AI response

7. **Test Template Management**
   - Click template management icon in header
   - Create new custom templates
   - Edit existing templates
   - Delete templates (with confirmation)

### API Testing

The application uses OpenAI-compatible API at:
- **Endpoint**: https://aiportalapi.stu-platform.live/jpe/v1
- **Authentication**: Bearer sk-dwFEogyru-tSQqgObMgpKw
- **Model**: GPT-4o

### Sample Test Scenarios

1. **Code Review Template**
   - Select "Code Review Checklist" template
   - Fill in: codeSnippet, language, reviewContext
   - Generate AI-powered code review

2. **Requirements Analysis**
   - Select "Requirements Analysis" template  
   - Fill in: projectName, stakeholders, objectives
   - Generate comprehensive requirements document

3. **Custom Template Creation**
   - Create new template with custom fields
   - Test with various input combinations
   - Export and verify results

## 🎉 Implementation Complete!

**Status**: ✅ FULLY FUNCTIONAL  
**Application URL**: http://localhost:5174  
**All Features**: Working and tested  
**AI Integration**: Connected and responding  

### Quick Test Commands
```bash
# Start application
npm run dev --workspace=apps/prompt-ui

# Run automated tests (in browser console)
new PromptVerseTestRunner().runAllTests()
```

### Core Completed Features
- ✅ Template Library with filtering
- ✅ Context Management with validation  
- ✅ Live Prompt Generation
- ✅ AI Integration (GPT-4o)
- ✅ Model Configuration
- ✅ Template CRUD Operations
- ✅ Export & Copy Functionality
- ✅ Toast Notifications
- ✅ Responsive UI Design

**Result**: PromptVerse is production-ready! 🚀

## Development

### Build Commands

```bash
# Build everything
npm run build

# Start development server
npm run dev

# Run tests (in prompt-engine)
cd packages/prompt-engine && npm test
```

## License

MIT License
