// Test script for PromptVerse application
// This can be run in the browser console to automate testing

class PromptVerseTestRunner {
  constructor() {
    this.testResults = [];
    this.currentStep = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const result = { timestamp, message, type, step: this.currentStep++ };
    this.testResults.push(result);
    
    const color = {
      'info': 'color: blue',
      'success': 'color: green', 
      'error': 'color: red',
      'warning': 'color: orange'
    }[type];
    
    console.log(`%c[TEST ${this.currentStep}] ${message}`, color);
    return result;
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testTemplateSelection() {
    this.log('Testing template selection...', 'info');
    
    try {
      // Check if templates are loaded
      const templateCards = document.querySelectorAll('[data-testid="template-card"]');
      if (templateCards.length === 0) {
        this.log('⚠️ No template cards found - using fallback selector', 'warning');
        const fallbackCards = document.querySelectorAll('.cursor-pointer.p-4');
        if (fallbackCards.length > 0) {
          fallbackCards[0].click();
          this.log('✅ Template selected using fallback', 'success');
        } else {
          throw new Error('No templates found');
        }
      } else {
        templateCards[0].click();
        this.log('✅ Template selected successfully', 'success');
      }
      
      await this.wait(500);
      return true;
    } catch (error) {
      this.log(`❌ Template selection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testContextInput() {
    this.log('Testing context input...', 'info');
    
    try {
      const inputs = document.querySelectorAll('input[type="text"], textarea');
      if (inputs.length === 0) {
        throw new Error('No input fields found');
      }

      // Fill first few inputs with test data
      for (let i = 0; i < Math.min(3, inputs.length); i++) {
        const input = inputs[i];
        const testValue = `Test value ${i + 1}`;
        
        input.focus();
        input.value = testValue;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        
        this.log(`✅ Filled input ${i + 1} with: "${testValue}"`, 'success');
      }
      
      await this.wait(500);
      return true;
    } catch (error) {
      this.log(`❌ Context input failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testPromptGeneration() {
    this.log('Testing prompt generation...', 'info');
    
    try {
      // Look for generate button
      const generateBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Generate Prompt'));
      
      if (!generateBtn) {
        throw new Error('Generate Prompt button not found');
      }

      generateBtn.click();
      this.log('✅ Generate Prompt button clicked', 'success');
      
      await this.wait(1000);
      
      // Check if prompt was generated (look for output content)
      const outputContent = document.querySelector('.whitespace-pre-wrap');
      if (outputContent && outputContent.textContent.trim()) {
        this.log('✅ Prompt generated successfully', 'success');
        return true;
      } else {
        this.log('⚠️ Prompt generation may have failed - no output found', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`❌ Prompt generation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testModelSettings() {
    this.log('Testing model settings...', 'info');
    
    try {
      // Look for settings button (gear icon)
      const settingsBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.innerHTML.includes('M10.325') || btn.title === 'AI Model Settings');
      
      if (!settingsBtn) {
        throw new Error('Model settings button not found');
      }

      settingsBtn.click();
      this.log('✅ Model settings opened', 'success');
      
      await this.wait(500);
      
      // Check if modal opened
      const modal = document.querySelector('.fixed.inset-0');
      if (modal) {
        this.log('✅ Settings modal opened', 'success');
        
        // Close modal
        const closeBtn = modal.querySelector('button');
        if (closeBtn) {
          closeBtn.click();
          this.log('✅ Settings modal closed', 'success');
        }
        return true;
      } else {
        throw new Error('Settings modal did not open');
      }
    } catch (error) {
      this.log(`❌ Model settings test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testAIGeneration() {
    this.log('Testing AI generation...', 'info');
    
    try {
      // Look for AI generate button
      const aiBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Generate with AI'));
      
      if (!aiBtn) {
        throw new Error('Generate with AI button not found');
      }

      if (aiBtn.disabled) {
        this.log('⚠️ AI generation button is disabled - may need valid prompt first', 'warning');
        return false;
      }

      aiBtn.click();
      this.log('✅ AI generation started', 'success');
      
      // Wait for AI response (longer timeout)
      await this.wait(3000);
      
      // Check for AI response
      const aiResponse = Array.from(document.querySelectorAll('.bg-blue-50'))
        .find(el => el.textContent.includes('AI Response'));
      
      if (aiResponse) {
        this.log('✅ AI response generated successfully', 'success');
        return true;
      } else {
        this.log('⚠️ AI response not found - may still be generating', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`❌ AI generation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testTemplateManager() {
    this.log('Testing template manager...', 'info');
    
    try {
      // Look for template manager button in header
      const managerBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.title === 'Manage Templates' || btn.innerHTML.includes('M19 11H5'));
      
      if (!managerBtn) {
        throw new Error('Template manager button not found');
      }

      managerBtn.click();
      this.log('✅ Template manager opened', 'success');
      
      await this.wait(500);
      
      // Check if modal opened
      const modal = document.querySelector('.fixed.inset-0');
      if (modal && modal.textContent.includes('Template Manager')) {
        this.log('✅ Template manager modal opened', 'success');
        
        // Close modal
        const closeBtn = Array.from(modal.querySelectorAll('button'))
          .find(btn => btn.innerHTML.includes('M6 18L18 6'));
        if (closeBtn) {
          closeBtn.click();
          this.log('✅ Template manager modal closed', 'success');
        }
        return true;
      } else {
        throw new Error('Template manager modal did not open');
      }
    } catch (error) {
      this.log(`❌ Template manager test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting PromptVerse comprehensive test suite', 'info');
    
    const tests = [
      { name: 'Template Selection', fn: () => this.testTemplateSelection() },
      { name: 'Context Input', fn: () => this.testContextInput() },
      { name: 'Prompt Generation', fn: () => this.testPromptGeneration() },
      { name: 'Model Settings', fn: () => this.testModelSettings() },
      { name: 'Template Manager', fn: () => this.testTemplateManager() },
      { name: 'AI Generation', fn: () => this.testAIGeneration() }
    ];

    const results = {};
    
    for (const test of tests) {
      this.log(`\n--- Running ${test.name} Test ---`, 'info');
      try {
        results[test.name] = await test.fn();
        await this.wait(1000); // Brief pause between tests
      } catch (error) {
        this.log(`❌ ${test.name} test crashed: ${error.message}`, 'error');
        results[test.name] = false;
      }
    }

    // Summary
    this.log('\n=== TEST SUMMARY ===', 'info');
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    for (const [testName, passed] of Object.entries(results)) {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      this.log(`${status}: ${testName}`, passed ? 'success' : 'error');
    }
    
    this.log(`\n🎯 Overall: ${passed}/${total} tests passed`, 
             passed === total ? 'success' : 'warning');
    
    return { results, summary: { passed, total }, logs: this.testResults };
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      testResults: this.testResults
    };
    
    console.log('📊 Full Test Report:', report);
    return report;
  }
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
  window.PromptVerseTestRunner = PromptVerseTestRunner;
  console.log('PromptVerse Test Runner loaded! Run: new PromptVerseTestRunner().runAllTests()');
}
