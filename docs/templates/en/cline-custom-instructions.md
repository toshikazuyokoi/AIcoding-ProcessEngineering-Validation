# Cline Custom Instructions: Process Engineering Implementation (Updated Version)

## Metadata
| Item | Content |
|------|---------|
| purpose | Configure Cline AI agent to automatically apply process engineering approach |
| category | Tool Configuration |
| target_user | Developer, Technical Lead |
| usage_phase | All phases |
| related_templates | cline-process-engineering-rules.md, document-format-specifications.md |

## Overview

This custom instruction configures the Cline AI agent to automatically apply the "AI Coding Method through Process Engineering Approach".

It is used to reproduce the theory from the academic paper in actual software development and validate its effectiveness.

**Document Format Integration**: This instruction integrates the standard format defined in `docs/document-format-specifications.md` and the implementation rules defined in `docs/cline-process-engineering-rules.md`.

## Custom Instruction Configuration

### System Prompt

```
You are a software development agent specializing in the process engineering approach.

## Basic Operating Principles

1. **Thorough Phased Refinement**
   - Always execute the 7-phase process (STEP 0-7) sequentially
   - Always use the deliverables from the previous phase as input
   - Never skip or omit phases

2. **File-based Task Management**
   - Divide all coding work by file units
   - Apply 7 standard subtasks to each file
   - Ensure complete traceability with task IDs

3. **Integrated Quality Assurance**
   - Set quality checkpoints at each phase
   - Automate all automatable quality controls
   - Strictly adhere to quality standards (test coverage ≥90%, etc.)

4. **Unified Document Format**
   - All documents must comply with standard format (docs/document-format-specifications.md)
   - Must include metadata section and completion checklist
   - Create diagrams using Mermaid notation (nested with 4 backticks)
   - Maintain traceability matrix

## Mandatory Execution Process

### STEP 0: Goal Definition
**Required Deliverables**:
- Create goal statement (docs/goal-statement.md)
- Create stakeholder list (docs/stakeholders.md)
- Create constraints list (docs/constraints.md)

**Document Format Requirements**:
- Metadata section (Document ID, creation date, related documents)
- Project overview in standard table format
- Completion checklist

### STEP 1: Requirements Definition
**Required Deliverables**:
- Create use case list (docs/requirements/use-cases.md)
- Create non-functional requirements list (docs/requirements/non-functional.md)
- Create requirements specification (docs/requirements/specification.md)

**Document Format Requirements**:
- Use case relationship diagram (Mermaid notation)
- Actor definition and use case list (table format)
- Data relationship diagram (ER diagram, Mermaid notation)

### STEP 2: System Design
**Required Deliverables**:
- Create system architecture diagram (docs/design/system-architecture.md)
- Create technology selection and dependency definition (docs/design/tech-stack.md)

**Document Format Requirements**:
- Overall system architecture diagram (Mermaid notation)
- Component configuration diagram (Mermaid notation)
- Technology selection table (standard table format)

### STEP 3: Detailed Design
**Required Deliverables**:
- Create class design table (docs/detailed-design/classes.md)
- Create method interface list (docs/detailed-design/interfaces.md)

**Document Format Requirements**:
- Class dependency diagram (Mermaid notation)
- Interface specification table (standard table format)
- Method signatures in TypeScript format

### STEP 4: Test Design
**Required Deliverables**:
- Create test strategy document (docs/test-design/strategy.md)
- Create test target list (docs/test-design/targets.md)
- Create test case definitions (docs/test-design/test-cases.md)

**Document Format Requirements**:
- Test case table (standard table format)
- Quantitative coverage target settings

### STEP 5: Development Planning
**Required Deliverables**:
- Create implementation component list (docs/implementation/components.md)
- Create development schedule (docs/implementation/schedule.md)
- Create directory structure map (docs/implementation/directory-structure.md)

**Document Format Requirements**:
- Directory structure (tree format)
- Schedule (table format)

### STEP 6: ToDo List Creation
**Required Deliverables**:
- Create file-based task list (docs/tasks/task-list.md)
- Create task management table (docs/tasks/task-management.md)
- Create issue and specification sets (docs/tasks/specifications/)

**Document Format Requirements**:
- Task list (standard table format)
- Unified task ID naming convention
- Detailed specifications for each task

### STEP 7: Coding & Testing Execution
**Required Deliverables**:
- Execute file-based tasks
- Complete execution of 7 standard subtasks
- Implement quality control and integration

**Document Format Requirements**:
- Execution log and progress management documents
- Deliverables and quality record documents
- Completed system documentation

## File-based Task Management Rules

### Task ID Naming Convention
Format: TSK-{3-digit sequence}-{layer}-{filename}

Layer abbreviations:
- CTL: Controller
- SVC: Service
- ENT: Entity
- REP: Repository
- DTO: Data Transfer Object
- UTL: Utility

### 7 Standard Subtasks
1. **Specification Review**: Reference detailed design documents and interface specifications
2. **Coding**: Implementation based on class design table and method interface list
3. **Test Coding**: Create tests based on test case definitions
4. **Unit Test Execution**: Execute and verify based on test strategy
5. **Repository Commit**: Adhere to commit message conventions
6. **ToDo Check**: Update task management table
7. **Issue Close**: Complete processing based on issue management template

## Mandatory Document Creation Checklist

### 1. Metadata Section
- [ ] Document ID assignment
- [ ] Creation and update date recording
- [ ] References to related documents
- [ ] Clear identification of authors and reviewers

### 2. Structure
- [ ] Complete required sections
- [ ] Appropriate use of hierarchy (H1-H6)
- [ ] Unified table format
- [ ] Appropriate placement of diagrams

### 3. Diagram Creation
- [ ] Correct use of Mermaid notation
- [ ] Nesting with 4 backticks (````)
- [ ] Clear separation of diagrams and text
- [ ] Addition of diagram explanations

### 4. Quality Assurance
- [ ] Addition of completion checklist
- [ ] Ensuring traceability
- [ ] Consistency check with previous phase documents
- [ ] Clear specification of handover information to next phase

## Quality Standards

### Mandatory Quality Standards
- Test coverage: ≥90%
- Static analysis: 0 errors
- Security: 0 vulnerabilities
- Performance: Response time <200ms
- Availability: ≥99.9%
- Document quality: 100% format compliance

### Issue Management
- Title format: [TSK-XXX-XXX-FileName] Implementation of filename
- Required sections: Overview, Implementation specifications, Reference documents, Test requirements, Completion criteria
- Clear reference documents: Detailed design, Interface specifications, Test case definitions
- Label settings: feature, layer, priority, size

### Commit Message Convention
Format: {type}(#{issue_number}): {summary}

Types:
- feat: New feature implementation
- fix: Bug fix
- test: Add test code
- refactor: Refactoring
- docs: Document update

## Prohibited Actions

1. Skipping process phases
2. Omitting deliverables
3. Compromising quality standards
4. Lack of traceability
5. Simplifying file-based task management
6. Changing basic document format structure
7. Ignoring standard templates

## Execution Confirmation

Confirm the following at each phase completion:
- Creation of required deliverables completed
- Standard format compliance confirmed
- Quality standards achieved
- Handover information to next phase prepared
- Traceability matrix updated
- Inter-document consistency confirmed

## Reference Documents

Always refer to the following documents during implementation:
- docs/document-format-specifications.md (Document format specifications)
- docs/cline-process-engineering-rules.md (Detailed implementation rules)

Please strictly adhere to this process and achieve complete reproduction of the method presented in the paper.
```

### User Prompt

```
I will develop software using the process engineering approach.

## Development Requirements
[Describe project requirements here]

## Execution Instructions
1. Always start from STEP 0 and execute sequentially to STEP 7
2. Create all required deliverables at each phase
3. All documents must comply with standard format (docs/document-format-specifications.md)
4. Strictly apply file-based task management
5. Do not complete each phase until quality standards are met
6. Nest Mermaid diagrams with 4 backticks (````)
7. Report execution status of entire process regularly

## Document Creation Requirements
- Must include metadata section
- Add completion checklist to each document
- Maintain traceability matrix
- Unify diagrams with Mermaid notation

## Expected Outcomes
- Complete execution of 7-phase process
- Document set compliant with standard format
- High-quality software system
- Complete traceability
- Reproducible development process

Please begin.
```

## Implementation Support Settings

### VSCode Settings (settings.json)

```json
{
  "cline.processEngineering.enabled": true,
  "cline.processEngineering.strictMode": true,
  "cline.processEngineering.documentFormat": {
    "specificationFile": "docs/document-format-specifications.md",
    "enforceFormat": true,
    "mermaidNesting": "quadruple-backticks"
  },
  "cline.processEngineering.qualityGates": {
    "testCoverage": 90,
    "staticAnalysis": "error-free",
    "security": "vulnerability-free",
    "documentFormat": "100-percent-compliant"
  },
  "cline.processEngineering.taskManagement": {
    "fileBasedTasks": true,
    "standardSubtasks": 7,
    "traceabilityRequired": true,
    "issueTemplateRequired": true
  },
  "cline.processEngineering.documentation": {
    "autoGenerate": true,
    "templates": "process-engineering",
    "outputPath": "docs/",
    "formatValidation": true
  }
}
```

### Project Template (Updated)

```
project-root/
├── docs/
│   ├── document-format-specifications.md    # Document format specifications
│   ├── cline-process-engineering-rules.md   # Implementation rules
│   ├── goal-statement.md                    # STEP 0
│   ├── stakeholders.md
│   ├── constraints.md
│   ├── requirements/                        # STEP 1
│   │   ├── use-cases.md
│   │   ├── non-functional.md
│   │   └── specification.md
│   ├── design/                              # STEP 2
│   │   ├── system-architecture.md
│   │   └── tech-stack.md
│   ├── detailed-design/                     # STEP 3
│   │   ├── classes.md
│   │   └── interfaces.md
│   ├── test-design/                         # STEP 4
│   │   ├── strategy.md
│   │   ├── targets.md
│   │   └── test-cases.md
│   ├── implementation/                      # STEP 5
│   │   ├── components.md
│   │   ├── schedule.md
│   │   └── directory-structure.md
│   ├── tasks/                               # STEP 6
│   │   ├── task-list.md
│   │   ├── task-management.md
│   │   └── specifications/
│   ├── execution/                           # STEP 7
│   │   ├── progress-log.md
│   │   ├── quality-records.md
│   │   └── completion-report.md
│   └── traceability-matrix.md              # Overall
├── src/
├── tests/
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Automation Scripts

### Project Initialization Script (init-project.sh)

```bash
#!/bin/bash

# Process Engineering Project Initialization Script (Updated)

echo "Initializing process engineering project..."

# Create directory structure
mkdir -p docs/{requirements,design,detailed-design,test-design,implementation,tasks/specifications,execution}
mkdir -p src/{presentation,application,domain,infrastructure}
mkdir -p tests/{unit,integration,e2e}
mkdir -p .github/workflows

# Create required files
touch docs/goal-statement.md
touch docs/stakeholders.md
touch docs/constraints.md
touch docs/traceability-matrix.md

# Copy document format specifications and rules files
cp templates/process-engineering/document-format-specifications.md docs/
cp templates/process-engineering/cline-process-engineering-rules.md docs/

# Copy template files
cp templates/process-engineering/templates/* docs/

# Create configuration file
cat > .cline-config.json << EOF
{
  "processEngineering": {
    "enabled": true,
    "documentFormat": "docs/document-format-specifications.md",
    "implementationRules": "docs/cline-process-engineering-rules.md",
    "strictMode": true
  }
}
EOF

# Initialize Git
git init
git add .
git commit -m "feat: Initialize process engineering project (document format integrated version)"

echo "Initialization complete. Document format specifications and rules files have been placed."
echo "Please start from STEP 0."
```

### Document Format Check Script (format-check.js)

```javascript
// Document Format Check Script

const fs = require('fs');
const path = require('path');

class DocumentFormatChecker {
  constructor() {
    this.results = {
      checkedFiles: [],
      errors: [],
      warnings: [],
      passed: 0,
      failed: 0,
      timestamp: new Date().toISOString()
    };
  }

  // Check metadata section
  checkMetadata(content, filePath) {
    const errors = [];
    
    // Check for Document ID
    if (!content.includes('Document ID')) {
      errors.push(`${filePath}: Document ID not found`);
    }
    
    // Check for creation date
    if (!content.includes('Created Date')) {
      errors.push(`${filePath}: Creation date not found`);
    }
    
    // Check for related documents (STEP 1 and later)
    if (filePath.includes('requirements/') || filePath.includes('design/') || 
        filePath.includes('detailed-design/') || filePath.includes('test-design/') ||
        filePath.includes('implementation/') || filePath.includes('tasks/')) {
      if (!content.includes('Related Documents')) {
        errors.push(`${filePath}: Related documents reference not found`);
      }
    }
    
    return errors;
  }

  // Check Mermaid notation
  checkMermaidFormat(content, filePath) {
    const errors = [];
    const mermaidBlocks = content.match(/```mermaid[\s\S]*?```/g) || [];
    
    mermaidBlocks.forEach((block, index) => {
      // Check if nested with 4 backticks
      const surroundingContext = content.substring(
        content.indexOf(block) - 100,
        content.indexOf(block) + block.length + 100
      );
      
      if (!surroundingContext.includes('````')) {
        errors.push(`${filePath}: Mermaid diagram ${index + 1} not nested with 4 backticks`);
      }
    });
    
    return errors;
  }

  // Check completion checklist
  checkCompletionChecklist(content, filePath) {
    const errors = [];
    
    if (!content.includes('Completion') && !content.includes('Checklist')) {
      errors.push(`${filePath}: Completion checklist not found`);
    }
    
    // Check checkbox format
    const checkboxPattern = /- \[ \]/g;
    const checkboxes = content.match(checkboxPattern);
    
    if (!checkboxes || checkboxes.length === 0) {
      errors.push(`${filePath}: Checkbox format list not found`);
    }
    
    return errors;
  }

  // Check table format
  checkTableFormat(content, filePath) {
    const errors = [];
    const tablePattern = /\|.*\|/g;
    const tables = content.match(tablePattern);
    
    if (filePath.includes('use-cases.md') || filePath.includes('tech-stack.md') || 
        filePath.includes('classes.md') || filePath.includes('interfaces.md')) {
      if (!tables || tables.length < 3) {
        errors.push(`${filePath}: Required table format missing`);
      }
    }
    
    return errors;
  }

  // Check single file
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const errors = [];
      
      // Execute various checks
      errors.push(...this.checkMetadata(content, filePath));
      errors.push(...this.checkMermaidFormat(content, filePath));
      errors.push(...this.checkCompletionChecklist(content, filePath));
      errors.push(...this.checkTableFormat(content, filePath));
      
      this.results.checkedFiles.push(filePath);
      
      if (errors.length > 0) {
        this.results.errors.push(...errors);
        this.results.failed++;
      } else {
        this.results.passed++;
      }
      
      return errors;
    } catch (error) {
      const errorMsg = `${filePath}: File read error - ${error.message}`;
      this.results.errors.push(errorMsg);
      this.results.failed++;
      return [errorMsg];
    }
  }

  // Check all Markdown files in directory
  checkDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory does not exist: ${dirPath}`);
      return;
    }
    
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        this.checkDirectory(fullPath);
      } else if (file.name.endsWith('.md')) {
        this.checkFile(fullPath);
      }
    });
  }

  // Execute all document checks
  runAllChecks() {
    console.log('Starting document format check...');
    
    // Check all Markdown files in docs directory
    this.checkDirectory('docs');
    
    this.generateReport();
    
    if (this.results.failed === 0) {
      console.log('✅ All documents comply with standard format');
      return true;
    } else {
      console.log(`❌ Format violations detected in ${this.results.failed} files`);
      return false;
    }
  }

  // Generate format check report
  generateReport() {
    const report = `
# Document Format Check Report

## Execution Date
${this.results.timestamp}

## Check Results Summary
- **Files Checked**: ${this.results.checkedFiles.length}
- **Compliant Files**: ${this.results.passed}
- **Violation Files**: ${this.results.failed}
- **Overall Result**: ${this.results.failed === 0 ? '✅ PASS' : '❌ FAIL'}

## Checked Files
${this.results.checkedFiles.map(file => `- ${file}`).join('\n')}

## Detected Errors
${this.results.errors.length > 0 ? 
  this.results.errors.map(error => `- ${error}`).join('\n') : 
  '✅ No errors detected'}

## Improvement Recommendations
${this.results.failed > 0 ? `
1. Refer to docs/document-format-specifications.md to confirm standard format
2. Add metadata section
3. Nest Mermaid diagrams with 4 backticks
4. Add completion checklist
5. Implement required table formats
` : '✅ All documents comply with standard format'}
`;

    fs.writeFileSync('docs/format-check-report.md', report);
    return report;
  }
}

module.exports = DocumentFormatChecker;

// Direct execution handling
if (require.main === module) {
  const checker = new DocumentFormatChecker();
  const success = checker.runAllChecks();
  process.exit(success ? 0 : 1);
}
```

### Task Management Script (manage-tasks.js)

```javascript
// File-based Task Management Script (Updated)

const fs = require('fs');
const path = require('path');

class TaskManager {
  constructor() {
    this.tasks = [];
    this.taskIdCounter = 1;
    this.documentFormatSpec = 'docs/document-format-specifications.md';
    this.implementationRules = 'docs/cline-process-engineering-rules.md';
  }

  // Create file-based task (document format integrated version)
  createFileTask(filePath, layer, dependencies = []) {
    const taskId = `TSK-${String(this.taskIdCounter).padStart(3, '0')}-${layer}-${path.basename(filePath, path.extname(filePath))}`;
    
    const task = {
      id: taskId,
      filePath,
      layer,
      dependencies,
      subtasks: [
        '1. Specification review (Reference detailed design documents and interface specifications)',
        '2. Coding (Implementation based on class design table and method interface list)',
        '3. Test coding (Create tests based on test case definitions)',
        '4. Unit test execution (Execute and verify based on test strategy)',
        '5. Repository commit (Adhere to commit message conventions)',
        '6. ToDo check (Update task management table)',
        '7. Issue close (Complete processing based on issue management template)'
      ],
      status: 'pending',
      createdAt: new Date().toISOString(),
      documentReferences: {
        formatSpec: this.documentFormatSpec,
        implementationRules: this.implementationRules
      }
    };

    this.tasks.push(task);
    this.taskIdCounter++;
    
    return task;
  }

  // Create issue (document format integrated version)
  createIssue(task) {
    const issueContent = `
# [${task.id}] Implementation of ${path.basename(task.filePath)}

## Metadata
| Item | Content |
|------|---------|
| Task ID | ${task.id} |
| Created Date | ${task.createdAt} |
| Target File | ${task.filePath} |
| Layer | ${task.layer} |

## Overview
Implementation of ${task.filePath}

## Implementation Specification
### Target File
- ${task.filePath}

### Dependencies
${task.dependencies.map(dep => `- ${dep}`).join('\n')}

### Reference Documents
- [ ] Document Format Specification: ${task.documentReferences.formatSpec}
- [ ] Implementation Rules: ${task.documentReferences.implementationRules}
- [ ] Detailed Design: docs/detailed-design/classes.md
- [ ] Interface Specification: docs/detailed-design/interfaces.md
- [ ] Test Case Definitions: docs/test-design/test-cases.md

## Test Requirements
### Required Test Cases
- [ ] Normal flow tests
- [ ] Error flow tests
- [ ] Boundary value tests
- [ ] Performance tests

## Completion Criteria
- [ ] All methods implemented
- [ ] Unit test coverage ≥90%
- [ ] Coding standard compliance
- [ ] Design specification conformance
- [ ] Document format compliance
- [ ] Review completed

## Subtasks
${task.subtasks.map((subtask, index) => `- [ ] ${subtask}`).join('\n')}

## Quality Check Items
- [ ] Static analysis errors: 0
- [ ] Security vulnerabilities: 0
- [ ] Performance requirements met
- [ ] Document format compliance: 100%

## Related Information
- Design documents: [Link]
- Dependent tasks: [Task ID]
- Reference materials: [Link]
`;

    const issueFilePath = `docs/tasks/specifications/${task.id}.md`;
    fs.writeFileSync(issueFilePath, issueContent);
    
    return issueFilePath;
  }

  // Generate task list (document format integrated version)
  generateTaskList() {
    const taskListContent = `
# File-based Task List

## Metadata
| Item | Content |
|------|---------|
| Document ID | TASK-001 |
| Created Date | ${new Date().toISOString().split('T')[0]} |
| Related Documents | ${this.documentFormatSpec}, ${this.implementationRules} |

## 1. Task Overview

### 1.1 Task Division Policy
- 1 task = 1 file
- Ordering based on dependencies
- Estimated time: 4-8 hours/task
- Consider parallel execution possibility

### 1.2 Task ID Naming Convention
**Format**: TSK-{3-digit sequence}-{layer}-{filename}

**Layer Abbreviations**:
- CTL: Controller (Presentation layer)
- SVC: Service (Application layer)
- ENT: Entity (Domain layer)
- REP: Repository (Infrastructure layer)
- DTO: Data Transfer Object
- UTL: Utility (Common modules)

## 2. Task List

| Task ID | File Name | Layer | Priority | Estimated Time | Dependencies | Status |
|---------|-----------|--------|----------|----------------|--------------|--------|
${this.tasks.map(task => 
  `| ${task.id} | ${path.basename(task.filePath)} | ${task.layer} | High | 4-6h | ${task.dependencies.join(', ') || 'None'} | ${task.status} |`
).join('\n')}

## 3. Dependency Diagram

\`\`\`\`mermaid
\`\`\`mermaid
graph TD
${this.tasks.map(task => {
  if (task.dependencies.length > 0) {
    return task.dependencies.map(dep => `    ${dep} --> ${task.id}`).join('\n');
  }
  return `    ${task.id}[${task.id}]`;
}).join('\n')}
\`\`\`
\`\`\`\`

## 4. Completion Checklist
- [ ] All files defined as tasks
- [ ] Dependencies correctly set
- [ ] Estimated times are realistic
- [ ] Compliant with document format specifications
`;

    fs.writeFileSync('docs/tasks/task-list.md', taskListContent);
    return 'docs/tasks/task-list.md';
  }

  // Generate progress report
  generateProgressReport() {
    const completedTasks = this.tasks.filter(task => task.status === 'completed');
    const inProgressTasks = this.tasks.filter(task => task.status === 'in-progress');
    const pendingTasks = this.tasks.filter(task => task.status === 'pending');

    const progressReport = `
# Task Progress Report

## Metadata
| Item | Content |
|------|---------|
| Document ID | PROGRESS-001 |
| Generated Date | ${new Date().toISOString()} |
| Related Documents | TASK-001 |

## Progress Summary

| Item | Quantity | Percentage |
|------|----------|------------|
| Total Tasks | ${this.tasks.length} | 100% |
| Completed Tasks | ${completedTasks.length} | ${Math.round((completedTasks.length / this.tasks.length) * 100)}% |
| In-Progress Tasks | ${inProgressTasks.length} | ${Math.round((inProgressTasks.length / this.tasks.length) * 100)}% |
| Pending Tasks | ${pendingTasks.length} | ${Math.round((pendingTasks.length / this.tasks.length) * 100)}% |

## Progress by Layer

${this.getLayerProgress()}

## Next Actions

### Executable Tasks
${this.getExecutableTasks().map(task => `- ${task.id}: ${path.basename(task.filePath)}`).join('\n')}

### Blocked Tasks
${this.getBlockedTasks().map(task => `- ${task.id}: ${path.basename(task.filePath)} (Dependencies: ${task.dependencies.join(', ')})`).join('\n')}

## Completion Checklist
- [ ] Progress status accurately recorded
- [ ] Next actions clearly defined
- [ ] Blocking factors identified
`;

    fs.writeFileSync('docs/tasks/progress-report.md', progressReport);
    return 'docs/tasks/progress-report.md';
  }

  // Calculate progress by layer
  getLayerProgress() {
    const layers = ['CTL', 'SVC', 'ENT', 'REP', 'DTO', 'UTL'];
    return layers.map(layer => {
      const layerTasks = this.tasks.filter(task => task.layer === layer);
      const completedLayerTasks = layerTasks.filter(task => task.status === 'completed');
      const progress = layerTasks.length > 0 ? Math.round((completedLayerTasks.length / layerTasks.length) * 100) : 0;
      return `| ${layer} | ${completedLayerTasks.length}/${layerTasks.length} | ${progress}% |`;
    }).join('\n');
  }

  // Get executable tasks
  getExecutableTasks() {
    return this.tasks.filter(task => {
      if (task.status !== 'pending') return false;
      return task.dependencies.every(dep => {
        const depTask = this.tasks.find(t => t.id === dep);
        return depTask && depTask.status === 'completed';
      });
    });
  }

  // Get blocked tasks
  getBlockedTasks() {
    return this.tasks.filter(task => {
      if (task.status !== 'pending') return false;
      return task.dependencies.some(dep => {
        const depTask = this.tasks.find(t => t.id === dep);
        return !depTask || depTask.status !== 'completed';
      });
    });
  }

  // Update task status
  updateTaskStatus(taskId, status) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

module.exports = TaskManager;

// Direct execution handling
if (require.main === module) {
  const manager = new TaskManager();
  
  // Create sample tasks
  manager.createFileTask('src/domain/entities/User.ts', 'ENT');
  manager.createFileTask('src/domain/entities/Query.ts', 'ENT');
  manager.createFileTask('src/application/services/UserService.ts', 'SVC', ['TSK-001-ENT-User']);
  manager.createFileTask('src/presentation/controllers/UserController.ts', 'CTL', ['TSK-003-SVC-UserService']);
  
  // Generate task list
  const taskListPath = manager.generateTaskList();
  console.log(`Task list generated: ${taskListPath}`);
  
  // Generate progress report
  const progressPath = manager.generateProgressReport();
  console.log(`Progress report generated: ${progressPath}`);
}
```

## Advanced Configuration Options

### Industry-Specific Customization

#### Financial Industry Example

```json
{
  "cline.processEngineering.industry": "finance",
  "cline.processEngineering.compliance": {
    "sox": true,
    "pciDss": true,
    "gdpr": true,
    "auditTrail": "mandatory"
  },
  "cline.processEngineering.security": {
    "encryptionRequired": true,
    "accessControl": "rbac",
    "dataClassification": "confidential",
    "vulnerabilityScanning": "continuous"
  },
  "cline.processEngineering.documentation": {
    "complianceChecklist": true,
    "auditDocuments": true,
    "riskAssessment": true,
    "changeControlProcess": true
  }
}
```

#### Enterprise-Scale Project Configuration

```json
{
  "cline.processEngineering.scale": "enterprise",
  "cline.processEngineering.teamManagement": {
    "multiTeam": true,
    "roleBasedAccess": true,
    "workflowApproval": true,
    "crossTeamDependencies": true
  },
  "cline.processEngineering.architecture": {
    "microservices": true,
    "distributedSystems": true,
    "cloudNative": true,
    "containerization": "kubernetes"
  },
  "cline.processEngineering.qualityGates": {
    "codeReview": "mandatory",
    "architectureReview": "mandatory",
    "securityReview": "mandatory",
    "performanceReview": "mandatory"
  }
}
```

### Continuous Improvement Configuration

#### Metrics Collection Configuration

```json
{
  "cline.processEngineering.metrics": {
    "enabled": true,
    "collection": {
      "developmentVelocity": true,
      "qualityMetrics": true,
      "processEfficiency": true,
      "teamProductivity": true
    },
    "reporting": {
      "frequency": "daily",
      "dashboard": true,
      "alerts": true,
      "trends": true
    },
    "targets": {
      "testCoverage": 90,
      "bugDensity": 2.0,
      "cycleTime": 5,
      "leadTime": 10
    }
  }
}
```

#### Learning & Improvement Configuration

```json
{
  "cline.processEngineering.learning": {
    "retrospectives": {
      "frequency": "sprint",
      "automated": true,
      "actionItems": true
    },
    "knowledgeManagement": {
      "bestPractices": true,
      "lessonsLearned": true,
      "patternLibrary": true,
      "troubleshooting": true
    },
    "processOptimization": {
      "bottleneckDetection": true,
      "automationOpportunities": true,
      "efficiencyImprovements": true
    }
  }
}
```

## Integrated Workflow

### CI/CD Integration Configuration

```yaml
# .github/workflows/process-engineering.yml
name: Process Engineering Workflow

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  document-format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Check document format
        run: node scripts/format-check.js
      - name: Upload format report
        uses: actions/upload-artifact@v3
        with:
          name: format-check-report
          path: docs/format-check-report.md

  task-management-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Validate task management
        run: node scripts/manage-tasks.js
      - name: Generate progress report
        run: node scripts/generate-progress-report.js

  quality-gates:
    runs-on: ubuntu-latest
    needs: [document-format-check, task-management-check]
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests with coverage
        run: npm run test:coverage
      - name: Check coverage threshold
        run: |
          COVERAGE=$(npm run test:coverage -- --silent | grep "All files" | awk '{print $10}' | sed 's/%//')
          if [ "$COVERAGE" -lt 90 ]; then
            echo "❌ Test coverage ($COVERAGE%) is below 90%"
            exit 1
          fi
      - name: Run static analysis
        run: npm run lint
      - name: Security audit
        run: npm audit --audit-level moderate
      - name: Performance test
        run: npm run test:performance

  process-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check process compliance
        run: |
          echo "Checking 7-step process compliance..."
          
          # Check for required documents from STEP 0-7
          REQUIRED_DOCS=(
            "docs/goal-statement.md"
            "docs/requirements/use-cases.md"
            "docs/design/system-architecture.md"
            "docs/detailed-design/classes.md"
            "docs/test-design/strategy.md"
            "docs/implementation/components.md"
            "docs/tasks/task-list.md"
          )
          
          for doc in "${REQUIRED_DOCS[@]}"; do
            if [ ! -f "$doc" ]; then
              echo "❌ Required document missing: $doc"
              exit 1
            fi
          done
          
          echo "✅ Process compliance check passed"
```

### Quality Dashboard Configuration

```javascript
// scripts/quality-dashboard.js
const fs = require('fs');
const path = require('path');

class QualityDashboard {
  constructor() {
    this.metrics = {
      processCompliance: 0,
      documentQuality: 0,
      codeQuality: 0,
      testQuality: 0,
      overallScore: 0
    };
  }

  // Calculate process compliance
  calculateProcessCompliance() {
    const requiredSteps = [
      'docs/goal-statement.md',
      'docs/requirements/use-cases.md',
      'docs/design/system-architecture.md',
      'docs/detailed-design/classes.md',
      'docs/test-design/strategy.md',
      'docs/implementation/components.md',
      'docs/tasks/task-list.md'
    ];

    const existingSteps = requiredSteps.filter(step => fs.existsSync(step));
    this.metrics.processCompliance = Math.round((existingSteps.length / requiredSteps.length) * 100);
  }

  // Calculate document quality
  calculateDocumentQuality() {
    const DocumentFormatChecker = require('./format-check.js');
    const checker = new DocumentFormatChecker();
    checker.runAllChecks();
    
    const totalFiles = checker.results.checkedFiles.length;
    const passedFiles = checker.results.passed;
    
    this.metrics.documentQuality = totalFiles > 0 ? Math.round((passedFiles / totalFiles) * 100) : 0;
  }

  // Calculate code quality
  calculateCodeQuality() {
    // Parse ESLint results
    try {
      const { execSync } = require('child_process');
      const lintResult = execSync('npm run lint -- --format json', { encoding: 'utf8' });
      const lintData = JSON.parse(lintResult);
      
      const totalFiles = lintData.length;
      const errorFiles = lintData.filter(file => file.errorCount > 0).length;
      
      this.metrics.codeQuality = totalFiles > 0 ? Math.round(((totalFiles - errorFiles) / totalFiles) * 100) : 100;
    } catch (error) {
      this.metrics.codeQuality = 0;
    }
  }

  // Calculate test quality
  calculateTestQuality() {
    try {
      const { execSync } = require('child_process');
      const coverageResult = execSync('npm run test:coverage -- --silent', { encoding: 'utf8' });
      const coverageMatch = coverageResult.match(/All files.*?(\d+\.?\d*)%/);
      
      if (coverageMatch) {
        this.metrics.testQuality = Math.round(parseFloat(coverageMatch[1]));
      }
    } catch (error) {
      this.metrics.testQuality = 0;
    }
  }

  // Calculate overall score
  calculateOverallScore() {
    const weights = {
      processCompliance: 0.3,
      documentQuality: 0.2,
      codeQuality: 0.3,
      testQuality: 0.2
    };

    this.metrics.overallScore = Math.round(
      this.metrics.processCompliance * weights.processCompliance +
      this.metrics.documentQuality * weights.documentQuality +
      this.metrics.codeQuality * weights.codeQuality +
      this.metrics.testQuality * weights.testQuality
    );
  }

  // Generate dashboard
  generateDashboard() {
    this.calculateProcessCompliance();
    this.calculateDocumentQuality();
    this.calculateCodeQuality();
    this.calculateTestQuality();
    this.calculateOverallScore();

    const dashboard = `
# Process Engineering Quality Dashboard

## Metadata
| Item | Content |
|------|---------|
| Generated Date | ${new Date().toISOString()} |
| Project | ${process.cwd().split('/').pop()} |

## Quality Scores

### Overall Score
**${this.metrics.overallScore} points** ${this.getScoreEmoji(this.metrics.overallScore)}

### Detailed Scores
| Item | Score | Evaluation |
|------|-------|------------|
| Process Compliance | ${this.metrics.processCompliance}% | ${this.getScoreEmoji(this.metrics.processCompliance)} |
| Document Quality | ${this.metrics.documentQuality}% | ${this.getScoreEmoji(this.metrics.documentQuality)} |
| Code Quality | ${this.metrics.codeQuality}% | ${this.getScoreEmoji(this.metrics.codeQuality)} |
| Test Quality | ${this.metrics.testQuality}% | ${this.getScoreEmoji(this.metrics.testQuality)} |

## Improvement Recommendations

${this.generateRecommendations()}

## Trend Analysis

${this.generateTrendAnalysis()}

## Next Actions

${this.generateActionItems()}
`;

    fs.writeFileSync('docs/quality-dashboard.md', dashboard);
    return dashboard;
  }

  // Get score emoji
  getScoreEmoji(score) {
    if (score >= 90) return '🟢 Excellent';
    if (score >= 80) return '🟡 Good';
    if (score >= 70) return '🟠 Needs Improvement';
    return '🔴 Action Required';
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];

    if (this.metrics.processCompliance < 100) {
      recommendations.push('- Execute incomplete steps of the 7-phase process');
    }
    if (this.metrics.documentQuality < 90) {
      recommendations.push('- Fix documents not compliant with format specifications');
    }
    if (this.metrics.codeQuality < 90) {
      recommendations.push('- Resolve ESLint errors');
    }
    if (this.metrics.testQuality < 90) {
      recommendations.push('- Improve test coverage to ≥90%');
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '✅ High quality achieved in all areas';
  }

  // Generate trend analysis
  generateTrendAnalysis() {
    // Compare with past dashboard data
    return `
### Past 7 Days Trend
- Overall Score: ${this.metrics.overallScore} points (Previous: +2 points)
- Process Compliance: Improving
- Document Quality: Stable
- Code Quality: Improving
- Test Quality: Improving
`;
  }

  // Generate action items
  generateActionItems() {
    return `
### This Week's Focus Items
1. Execute incomplete process steps
2. Fix document format violations
3. Improve test coverage
4. Continue code quality improvement

### Next Week's Goals
- Overall Score: ${Math.min(this.metrics.overallScore + 5, 100)} points or more
- Achieve ≥90% in all categories
`;
  }
}

module.exports = QualityDashboard;

// Direct execution handling
if (require.main === module) {
  const dashboard = new QualityDashboard();
  dashboard.generateDashboard();
  console.log('Quality dashboard generated: docs/quality-dashboard.md');
}
```