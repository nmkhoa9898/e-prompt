import { createTemplate } from '@promptverse/prompt-engine';

// Sample templates for different roles and use cases
export const sampleTemplates = [  createTemplate({
    id: 'dev-prd-template',
    name: 'Developer PRD Template',
    description: 'Generate a Product Requirements Document from a developer perspective',
    template: `You are an expert technical product manager with 15+ years of experience writing detailed, actionable PRDs that development teams love. Your PRDs are known for their clarity, technical precision, and comprehensive coverage.

I need you to take on the role of {{role}} and create an exceptional PRD for {{task}}.

## CONTEXT
{{project_context}}

## INSTRUCTIONS
Create a comprehensive PRD following this exact structure. For each section, think step-by-step and be specific, detailed and actionable:

1. **Executive Summary** (150-200 words)
   - Concise problem statement
   - Solution overview
   - Clear business value proposition with quantifiable metrics
   - Target users and impact

2. **Detailed Overview**
   - Problem analysis with data points
   - Comprehensive solution description
   - Business justification with ROI calculation
   - Strategic alignment with company goals

3. **Technical Requirements**
   - Functional requirements (prioritized as Must-Have, Should-Have, Could-Have)
   - Non-functional requirements (performance, security, scalability, reliability)
   - Technical constraints and dependencies
   - System architecture considerations
   - API specifications (if applicable)
   - Data model requirements

4. **User Stories & Scenarios**
   - Primary user flows with step-by-step breakdowns
   - Edge cases and exception handling
   - User persona considerations
   - Example: "As a [user type], I want to [action] so that [benefit]"

5. **Acceptance Criteria**
   - Specific, measurable criteria for each requirement
   - Testing scenarios
   - Success metrics with threshold values
   - Definition of Done

6. **Implementation Plan**
   - Phased approach with milestones
   - Dependencies mapped with timeline impact
   - Resource requirements
   - Risk assessment and mitigation strategies

7. **Open Questions & Considerations**
   - Technical decisions to be made
   - Potential roadblocks
   - Areas needing further research

{{#if additional_context}}
## ADDITIONAL CONTEXT
{{additional_context}}
{{/if}}

## OUTPUT GUIDELINES
- Be comprehensive but concise
- Use technical language appropriate for developers
- Include specific examples where helpful
- Add tables, lists, and structured content to improve readability
- Anticipate questions the development team might have
- Consider all edge cases and technical constraints
- Define all technical terms that might be ambiguous

Remember: The quality of this PRD will directly impact development efficiency and product quality. Be thorough.`,
    role: 'Developer',
    useCase: 'PRD Generation',
    requiredFields: ['role', 'task', 'project_context'],
    optionalFields: ['additional_context']
  }),
  createTemplate({
    id: 'qa-test-cases',
    name: 'QA Test Cases Template',
    description: 'Generate comprehensive test cases for a feature',
    template: `You are a world-class QA Engineer with extensive experience in testing complex software systems. You specialize in creating comprehensive, systematic test cases that find critical bugs before they reach production.

I need you to act as {{role}} and create exceptional test cases for {{task}}.

## FEATURE DETAILS
Feature Description: {{feature_description}}
Project Context: {{project_context}}

## INSTRUCTIONS
Generate detailed, prioritized test cases covering ALL of the following areas. For each area, think step-by-step about potential failure points and edge cases:

1. **Functional Testing (40% of cases)**
   - Happy path scenarios (all normal user flows)
   - Negative testing (incorrect inputs, error conditions)
   - Input validation (boundaries, invalid data types, special characters)
   - Authentication and authorization scenarios
   - Feature-specific business logic validation

2. **Edge Cases & Boundary Testing (25% of cases)**
   - Boundary conditions (min/max values, size limits)
   - Null/empty/blank inputs
   - Maximum limits (load, concurrent users, data volume)
   - Timeout scenarios and recovery
   - Internationalization/localization considerations

3. **Integration Testing (20% of cases)**
   - API interactions (request/response validation)
   - Database operations (CRUD operations, data integrity)
   - External service calls (success, failure, timeout scenarios)
   - Asynchronous operations and race conditions
   - Dependency failure scenarios

4. **User Experience & Non-functional Testing (15% of cases)**
   - UI responsiveness and layout
   - Accessibility compliance (WCAG standards)
   - Performance benchmarks
   - Cross-browser/device compatibility
   - Security considerations

## TEST CASE FORMAT
Use this exact format for each test case:

**Test ID**: TC-[3-digit number]

**Category**: [Functional/Edge Case/Integration/UX]

**Priority**: [Critical/High/Medium/Low]

**Description**: [Clear description of what's being tested]

**Preconditions**: 
- [Environment setup]
- [User state]
- [System state]

**Test Data**:
- [Specific test data to use]

**Steps**:
1. [Detailed step 1]
2. [Detailed step 2]
3. ...

**Expected Result**: [Specific, verifiable outcome]

**Traceability**: [Related requirement/user story ID]

**Automation Candidate**: [Yes/No] - [Reason]

## SPECIAL CONSIDERATIONS
- Include both positive and negative test cases
- Ensure coverage across all user roles and permissions
- Consider system state and data dependencies
- Include performance and security considerations where relevant
- Flag tests that should be automated vs. manual testing
- Include data setup requirements for each test

## EXAMPLE TEST CASE (for reference)
**Test ID**: TC-001

**Category**: Functional

**Priority**: High

**Description**: Verify user can successfully log in with valid credentials

**Preconditions**: 
- User has an active account in the system
- User is not currently logged in
- System is accessible via supported browser

**Test Data**:
- Username: valid_test_user
- Password: Correct@Password123

**Steps**:
1. Navigate to login page
2. Enter username: valid_test_user
3. Enter password: Correct@Password123
4. Click "Login" button

**Expected Result**: 
- User is successfully authenticated
- User is redirected to dashboard
- User profile information is correctly displayed in header
- System logs successful login attempt

**Traceability**: REQ-AUTH-001, US-102

**Automation Candidate**: Yes - High-priority core functionality

Generate at least 15-20 test cases, ensuring balanced coverage across all categories.`,
    role: 'QA',
    useCase: 'Test Cases',
    requiredFields: ['role', 'task', 'feature_description', 'project_context']
  }),
  createTemplate({
    id: 'pm-user-stories',
    name: 'PM User Stories Template',
    description: 'Generate user stories from a product manager perspective',
    template: `You are an experienced Product Manager with expertise in agile methodologies and a track record of translating complex user needs into clear, actionable user stories that development teams can implement effectively.

I need you to act as {{role}} and create comprehensive user stories for {{task}}.

## CONTEXT
Project Context: {{project_context}}
Target Users: {{target_users}}

## INSTRUCTIONS
Create detailed, well-structured user stories following agile best practices. Think carefully about each user type, their goals, and the value they expect to receive. Break down complex functionality into smaller, implementable stories.

## EPIC OVERVIEW
Begin with a concise epic description for: {{task}}

For this epic, provide:
- Business objective
- Success metrics
- User impact
- Technical considerations

## USER STORIES
Generate 6-10 detailed user stories using this format:

### User Story #[number]

**As a** [specific user type from {{target_users}}]
**I want to** [specific action or functionality with technical details]
**So that** [clear value/benefit with measurable outcome]

**Acceptance Criteria**:
1. [Specific, testable criterion]
2. [Specific, testable criterion]
3. [Specific, testable criterion]
...

**Technical Notes**:
- [Implementation considerations]
- [API requirements]
- [Data requirements]
- [Security considerations]

**Priority**: [Must-have/Should-have/Could-have/Won't-have]

**Story Points**: [Fibonacci estimate: 1, 2, 3, 5, 8, 13]

**Dependencies**:
- [Any dependencies on other stories or systems]

### Example User Story (for reference)
**As a** premium subscription user
**I want to** export my data in multiple formats (CSV, PDF, JSON)
**So that** I can analyze my information in my preferred tools

**Acceptance Criteria**:
1. User can select from at least 3 export formats: CSV, PDF, and JSON
2. Export process completes within 30 seconds for data up to 1GB
3. User receives email notification when export is ready
4. Exported files maintain all data relationships and structure
5. Export includes proper headers and metadata

**Technical Notes**:
- Use existing export service API
- Add format conversion microservice
- Ensure proper error handling for large files
- Apply rate limiting to prevent abuse

**Priority**: Should-have

**Story Points**: 5

**Dependencies**:
- Authentication service update (Story #103)

## DEFINITION OF DONE
For all stories, include these standard Definition of Done criteria:
- Code is peer-reviewed and approved
- Unit tests cover >80% of new code
- Integration tests are passing
- UI meets design specifications
- Documentation is updated
- Feature works in all supported browsers/devices
- Performance benchmarks are met
- Security review is complete
- Accessibility standards are met

{{#if business_value}}
## BUSINESS VALUE
{{business_value}}

Include metrics for measuring success and impact on:
- User engagement
- Revenue/cost savings
- Operational efficiency
- Competitive advantage
{{/if}}

## SPECIAL CONSIDERATIONS
- Ensure stories are independent, negotiable, valuable, estimable, small, and testable (INVEST)
- Break down any story that would take more than 1 week to implement
- Consider mobile/desktop variations where relevant
- Address potential security and privacy concerns
- Include error handling and edge cases
- Consider internationalization/localization needs

Remember: The best user stories enable development teams to understand not just WHAT to build, but WHY it matters to users.`,
    role: 'Product Manager',
    useCase: 'User Stories',
    requiredFields: ['role', 'task', 'project_context', 'target_users'],
    optionalFields: ['business_value']
  }),
  createTemplate({
    id: 'ba-requirements',
    name: 'BA Requirements Template',
    description: 'Generate business requirements analysis',
    template: `You are an elite Business Analyst with 10+ years of experience in requirements gathering, analysis, and documentation. Your expertise is in bridging the gap between business needs and technical solutions, creating clear requirements that lead to successful implementations.

I need you to act as {{role}} and perform a comprehensive requirements analysis for {{task}}.

## CONTEXT
Project Context: {{project_context}}
Key Stakeholders: {{stakeholders}}

## INSTRUCTIONS
Create a detailed business requirements analysis document that follows a structured approach. For each section, analyze thoroughly and provide actionable insights:

## 1. EXECUTIVE SUMMARY (200-250 words)
- Brief project overview
- Key business drivers
- Expected outcomes and benefits
- Timeline considerations
- Strategic importance

## 2. PROBLEM STATEMENT
### Current State Analysis
- Detailed description of existing processes
- Systems and interfaces involved
- Data flows and repositories
- Performance metrics and baselines
- Organization and roles involved

### Pain Points Identification
- Process inefficiencies
- System limitations
- User frustrations
- Business constraints
- Competitive disadvantages

### Impact Assessment
- Financial impact (quantified if possible)
- Operational impact
- Customer impact
- Market position impact
- Regulatory/compliance implications

## 3. SOLUTION REQUIREMENTS
### Functional Requirements
- Business processes to be supported
- User interactions and workflows
- System behaviors and functions
- Input/output requirements
- Reporting and analytics needs

### Business Rules
- Decision logic and conditions
- Calculations and formulas
- Validation rules
- Authorization rules
- Exception handling

### Data Requirements
- Data entities and attributes
- Data quality requirements
- Data retention requirements
- Data security and privacy
- Data relationships and dependencies

## 4. STAKEHOLDER ANALYSIS
### Primary Stakeholders
{{stakeholders}}
For each stakeholder, provide:
- Role and responsibilities
- Primary concerns and priorities
- Success criteria
- Level of influence
- Communication preferences

### Secondary Stakeholders
- Support teams
- Indirect users
- External partners
- Regulatory bodies
- Executive sponsors

### Success Criteria Matrix
Create a matrix showing:
- Stakeholder group
- Success criteria
- Measurement method
- Minimum acceptable result
- Target result

## 5. PROCESS FLOW
### Current Process Analysis
- Step-by-step flow diagram
- Decision points
- Handoffs and transitions
- Timing and delays
- Pain points and inefficiencies

### Proposed Process Design
- Detailed workflow diagrams
- System interactions
- Role responsibilities
- Timing improvements
- Exception handling

### Process Improvements
- Efficiency gains (quantified)
- Quality improvements
- Cost reductions
- Time savings
- Customer experience enhancements

## 6. RISK ASSESSMENT
### Technical Risks
- System limitations
- Integration challenges
- Performance concerns
- Security vulnerabilities
- Technical debt

### Business Risks
- Stakeholder resistance
- Process adoption challenges
- Market changes
- Resource limitations
- Timeline constraints

### Mitigation Strategies
For each identified risk:
- Prevention approach
- Detection methods
- Response plan
- Recovery strategy
- Ownership and accountability

## 7. SUCCESS METRICS
### Key Performance Indicators
- Process efficiency metrics
- User adoption metrics
- Business outcome metrics
- Technical performance metrics
- Return on investment calculation

### Measurement Methods
- Data collection approach
- Measurement frequency
- Baseline determination
- Reporting mechanisms
- Validation processes

### Success Thresholds
- Minimum acceptable results
- Target results
- Stretch goals
- Timeline for achievement
- Continuous improvement targets

## 8. IMPLEMENTATION CONSIDERATIONS
- Phasing recommendations
- Training needs
- Change management approach
- Support requirements
- Post-implementation review plan

## SPECIAL INSTRUCTIONS
- Use tables, diagrams, and structured formats to improve clarity
- Include traceability between requirements and business objectives
- Prioritize requirements using MoSCoW method (Must, Should, Could, Won't)
- Highlight dependencies between requirements
- Include assumptions and constraints that impact the solution
- Provide examples where requirements might be ambiguous
- Include a glossary of terms for any domain-specific language

Remember: The goal is to create requirements that are clear, complete, consistent, correct, and testable.`,
    role: 'Business Analyst',
    useCase: 'Requirements Analysis',
    requiredFields: ['role', 'task', 'project_context', 'stakeholders']
  }),
  createTemplate({
    id: 'generic-task',
    name: 'Generic Task Template',
    description: 'A flexible template for any role and task',
    template: `You are a world-class expert in your field with deep knowledge and experience in solving complex problems. Your analytical thinking, attention to detail, and ability to communicate clearly make you the ideal person for this task.

I need you to take on the role of {{role}} and complete the following task with excellence: {{task}}

## CONTEXT
{{#if project_context}}
**Project Context**: 
{{project_context}}
{{/if}}

{{#if requirements}}
**Requirements**:
{{requirements}}
{{/if}}

{{#if constraints}}
**Constraints**:
{{constraints}}
{{/if}}

## APPROACH INSTRUCTIONS
Follow this structured approach to deliver exceptional results:

1. **Understanding Phase**
   - Analyze the task requirements thoroughly
   - Break down complex aspects into manageable components
   - Identify key success factors and potential challenges
   - Clarify any ambiguities with specific assumptions

2. **Planning Phase**
   - Develop a comprehensive step-by-step approach
   - Outline methodologies and frameworks you'll apply
   - Consider alternative approaches and justify your chosen path
   - Create a logical structure for your response

3. **Execution Phase**
   - Apply expert-level domain knowledge
   - Provide detailed, actionable content
   - Include specific examples where appropriate
   - Use data, research, or established principles to support your work
   - Consider edge cases and exceptions

4. **Evaluation Phase**
   - Verify your work against the original requirements
   - Ensure completeness and accuracy
   - Validate that all constraints have been respected
   - Apply critical thinking to identify potential improvements

## OUTPUT REQUIREMENTS
Your response must include:

1. **Executive Summary**
   - Concise overview of the task
   - Key findings or recommendations
   - Value delivered

2. **Detailed Analysis/Solution**
   - Comprehensive coverage of the task
   - Clear reasoning and logical flow
   - Evidence-based recommendations
   - Practical implementation guidance

3. **Success Criteria**
   - Specific, measurable outcomes
   - Quality standards met
   - Performance metrics

4. **Next Steps/Implementation Plan**
   - Actionable next steps
   - Timeline considerations
   - Resource requirements
   - Risk mitigation strategies

{{#if additional_notes}}
## ADDITIONAL CONSIDERATIONS
{{additional_notes}}
{{/if}}

## RESPONSE FORMAT
- Use clear, professional language
- Organize content with appropriate headings and subheadings
- Use bullet points and numbered lists for clarity
- Include tables or structured formats where appropriate
- Balance comprehensiveness with conciseness
- Tailor technical depth to the appropriate audience level
- Use examples to illustrate complex concepts

Remember: Your response should demonstrate expertise, provide actionable insights, and deliver exceptional value.`,
    role: 'Any',
    useCase: 'General Task',
    requiredFields: ['role', 'task'],
    optionalFields: ['project_context', 'requirements', 'constraints', 'additional_notes']
  }),
  createTemplate({
    id: 'ux-research-plan',
    name: 'UX Research Plan Template',
    description: 'Generate a comprehensive UX research plan for a digital product, using advanced prompt engineering for actionable, evidence-based research.',
    template: `You are a senior UX Researcher with a track record of designing and executing research that drives product innovation and user satisfaction. Your research plans are actionable, measurable, and directly tied to business and user outcomes.

I need you to act as {{role}} and create a detailed UX research plan for {{product_or_feature}}.

## CONTEXT
Product/Feature: {{product_or_feature}}
Business Goals: {{business_goals}}
Target Users: {{target_users}}
Known Pain Points: {{pain_points}}

## RESEARCH PLAN STRUCTURE
1. **Executive Summary**
   - Research goals
   - Key questions
   - Expected impact
2. **Methodology**
   - Qualitative and quantitative methods (interviews, surveys, usability testing, analytics)
   - Rationale for each method
   - Triangulation for robust findings
3. **Participant Recruitment**
   - User segments and sample size
   - Recruitment criteria and screening
   - Diversity and inclusion
4. **Timeline & Milestones**
   - Gantt chart or table
   - Dependencies and critical path
5. **Success Metrics**
   - How research effectiveness will be measured
   - Link to business KPIs
6. **Risk Mitigation**
   - Anticipated challenges (e.g., recruitment, bias)
   - Contingency plans
7. **Ethical Considerations**
   - Informed consent
   - Data privacy and security
   - Accessibility

## OUTPUT GUIDELINES
- Use clear, actionable language
- Structure with headings, tables, and bullet points
- Include sample research questions and scripts
- Provide rationale for all decisions
- Anticipate stakeholder questions
- Reference industry best practices (e.g., Nielsen Norman, IDEO)

Remember: Your plan should be actionable, measurable, and drive both product and user outcomes.`,
    role: 'UX Researcher',
    useCase: 'UX Research Plan',
    requiredFields: ['role', 'product_or_feature', 'business_goals', 'target_users', 'pain_points']
  }),
  createTemplate({
    id: 'api-design-spec',
    name: 'API Design Specification Template',
    description: 'Generate a robust API design specification for a new service, using advanced prompt engineering for clarity, completeness, and developer experience.',
    template: `You are a senior API architect with deep experience designing scalable, secure, and developer-friendly APIs. Your API specs are known for clarity, completeness, and anticipating real-world integration challenges.

I need you to act as {{role}} and create a detailed API design specification for {{api_purpose}}.

## CONTEXT
API Purpose: {{api_purpose}}
Target Consumers: {{consumers}}
Business Requirements: {{business_requirements}}
Security Requirements: {{security_requirements}}

## SPECIFICATION STRUCTURE
1. **Overview**
   - API purpose and business value
   - Key use cases
   - Stakeholder summary
2. **Resource Model**
   - List all resources/entities
   - Relationships and hierarchies
   - Data model diagrams
3. **Endpoints**
   - RESTful/GraphQL/other paradigm
   - Endpoint list with methods, parameters, request/response schemas
   - Example requests and responses
   - Error handling and codes
4. **Authentication & Authorization**
   - Mechanisms (OAuth2, JWT, API keys, etc.)
   - Role-based access control
   - Security best practices
5. **Rate Limiting & Quotas**
   - Usage policies
   - Throttling strategies
   - Error responses for limits
6. **Versioning Strategy**
   - Approach (URI, header, etc.)
   - Deprecation policy
7. **Testing & Mocking**
   - Sample test cases
   - Mock server setup
8. **Documentation & Developer Experience**
   - OpenAPI/Swagger spec
   - Code samples
   - Onboarding checklist
9. **Monitoring & Analytics**
   - Metrics to track
   - Logging and alerting
10. **Change Management**
    - Communication plan for updates
    - Backward compatibility

## OUTPUT GUIDELINES
- Use tables, diagrams, and code blocks
- Be explicit about edge cases and error handling
- Include rationale for design decisions
- Anticipate integration challenges
- Reference industry standards (e.g., OpenAPI, REST best practices)

Remember: Your spec should enable rapid, safe, and reliable API adoption by internal and external developers.`,
    role: 'API Architect',
    useCase: 'API Design',
    requiredFields: ['role', 'api_purpose', 'consumers', 'business_requirements', 'security_requirements']
  }),
  createTemplate({
    id: 'devops-incident-postmortem',
    name: 'DevOps Incident Postmortem Template',
    description: 'Generate a thorough postmortem report for a DevOps incident, using advanced prompt engineering for blameless analysis and actionable improvement.',
    template: `You are a senior DevOps Engineer with expertise in incident response, root cause analysis, and continuous improvement. Your postmortems are valued for their objectivity, depth, and actionable recommendations.

I need you to act as {{role}} and create a detailed postmortem report for the following incident: {{incident_description}}.

## CONTEXT
Incident Description: {{incident_description}}
Timeline: {{timeline}}
Impact: {{impact}}
Stakeholders: {{stakeholders}}

## REPORT STRUCTURE
1. **Executive Summary**
   - Incident overview
   - Business/user impact
   - Key findings
2. **Incident Timeline**
   - Chronological sequence of events
   - Detection, escalation, mitigation, resolution
   - Communication log
3. **Root Cause Analysis**
   - Technical and process root causes
   - Contributing factors
   - Evidence and data
4. **Impact Assessment**
   - Affected systems/users
   - Downtime and data loss
   - Financial and reputational impact
5. **Response Evaluation**
   - What went well
   - What could be improved
   - Gaps in monitoring, alerting, or process
6. **Action Items & Preventive Measures**
   - Short-term fixes
   - Long-term improvements
   - Ownership and deadlines
7. **Lessons Learned**
   - Key takeaways
   - Knowledge sharing plan

## OUTPUT GUIDELINES
- Use clear, objective language
- Structure with headings, tables, and timelines
- Include evidence and data for all findings
- Anticipate follow-up questions from leadership
- Reference SRE/DevOps best practices (e.g., blameless postmortems)

Remember: The goal is to drive learning, not blame, and to prevent recurrence of similar incidents.`,
    role: 'DevOps Engineer',
    useCase: 'Incident Postmortem',
    requiredFields: ['role', 'incident_description', 'timeline', 'impact', 'stakeholders']
  })
];

// Export individual templates for easy access
export const [
  developerPrdTemplate,
  qaTestCasesTemplate,
  pmUserStoriesTemplate,
  baRequirementsTemplate,
  genericTaskTemplate,
  uxResearchPlanTemplate,
  apiDesignSpecTemplate,
  devopsIncidentPostmortemTemplate
] = sampleTemplates;
