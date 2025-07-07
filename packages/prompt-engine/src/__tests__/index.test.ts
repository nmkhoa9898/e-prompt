import {
  generatePrompt,
  extractTemplateVariables,
  validateRequiredFields,
  getUsedContextFields,
  sanitizeContext,
  createTemplate
} from '../index';

describe('Prompt Engine', () => {
  describe('extractTemplateVariables', () => {
    it('should extract simple variables', () => {
      const template = 'Hello {{name}}, welcome to {{project}}!';
      const variables = extractTemplateVariables(template);
      expect(variables).toEqual(['name', 'project']);
    });

    it('should handle variables with spaces', () => {
      const template = 'As a {{role}}, I need to {{task description}}';
      const variables = extractTemplateVariables(template);
      expect(variables).toEqual(['role']);
    });

    it('should ignore handlebars helpers', () => {
      const template = 'Hello {{name}} {{#if condition}}test{{/if}}';
      const variables = extractTemplateVariables(template);
      expect(variables).toEqual(['name']);
    });
  });

  describe('validateRequiredFields', () => {
    it('should return empty array when all fields are present', () => {
      const requiredFields = ['name', 'role'];
      const context = { name: 'John', role: 'Developer' };
      const missing = validateRequiredFields(requiredFields, context);
      expect(missing).toEqual([]);
    });

    it('should return missing fields', () => {
      const requiredFields = ['name', 'role', 'task'];
      const context = { name: 'John' };
      const missing = validateRequiredFields(requiredFields, context);
      expect(missing).toEqual(['role', 'task']);
    });

    it('should treat empty strings as missing', () => {
      const requiredFields = ['name', 'role'];
      const context = { name: '', role: 'Developer' };
      const missing = validateRequiredFields(requiredFields, context);
      expect(missing).toEqual(['name']);
    });
  });

  describe('sanitizeContext', () => {
    it('should escape handlebars syntax', () => {
      const context = { name: 'John {{evil}}', role: 'Dev' };
      const sanitized = sanitizeContext(context);
      expect(sanitized.name).toBe('John \\{\\{evil\\}\\}');
    });

    it('should convert non-string values to strings', () => {
      const context = { count: 42, isActive: true };
      const sanitized = sanitizeContext(context);
      expect(sanitized.count).toBe('42');
      expect(sanitized.isActive).toBe('true');
    });
  });

  describe('generatePrompt', () => {
    const template = createTemplate({
      id: 'test-template',
      name: 'Test Template',
      description: 'A test template',
      template: 'As a {{role}}, I need to {{task}}. Context: {{project_context}}',
      role: 'Developer',
      useCase: 'Testing',
      requiredFields: ['role', 'task', 'project_context']
    });

    it('should generate prompt with all fields provided', () => {
      const context = {
        role: 'Developer',
        task: 'write tests',
        project_context: 'Testing framework'
      };

      const result = generatePrompt(template, context);
      
      expect(result.prompt).toBe('As a Developer, I need to write tests. Context: Testing framework');
      expect(result.missingFields).toEqual([]);
      expect(result.contextUsed).toEqual(['role', 'task', 'project_context']);
      expect(result.metadata?.hasRequiredFields).toBe(true);
    });

    it('should handle missing required fields', () => {
      const context = {
        role: 'Developer'
      };

      const result = generatePrompt(template, context);
      
      expect(result.missingFields).toEqual(['task', 'project_context']);
      expect(result.metadata?.hasRequiredFields).toBe(false);
    });

    it('should sanitize context values', () => {
      const context = {
        role: 'Developer',
        task: 'write {{malicious}} code',
        project_context: 'Safe project'
      };

      const result = generatePrompt(template, context);
      
      expect(result.prompt).toContain('write \\{\\{malicious\\}\\} code');
    });
  });

  describe('createTemplate', () => {
    it('should create a template with extracted variables', () => {
      const template = createTemplate({
        id: 'test',
        name: 'Test',
        description: 'Test template',
        template: 'Hello {{name}} from {{company}}',
        role: 'Developer',
        useCase: 'Testing'
      });

      expect(template.requiredFields).toEqual(['name', 'company']);
      expect(template.id).toBe('test');
      expect(template.name).toBe('Test');
    });

    it('should use provided required fields', () => {
      const template = createTemplate({
        id: 'test',
        name: 'Test',
        description: 'Test template',
        template: 'Hello {{name}} from {{company}}',
        role: 'Developer',
        useCase: 'Testing',
        requiredFields: ['name']
      });

      expect(template.requiredFields).toEqual(['name']);
    });
  });
});
