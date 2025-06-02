@echo off
echo Creating GitHub Issues for Database Migration Tasks...
echo.

echo Creating TSK-090-DB-EnvironmentSetup Issue...
gh issue create --title "[TSK-090-DB-EnvironmentSetup] Database Environment Setup" --body-file "docs/project-specific/step6-todo-list/issues/TSK-090-DB-EnvironmentSetup.md" --label "augment-20250528" --assignee "toshikazuyokoi"

echo Creating TSK-091-DB-InitialMigration Issue...
gh issue create --title "[TSK-091-DB-InitialMigration] Initial Database Migration Execution" --body-file "docs/project-specific/step6-todo-list/issues/TSK-091-DB-InitialMigration.md" --label "augment-20250528" --assignee "toshikazuyokoi"

echo Creating TSK-092-DB-SeedData Issue...
gh issue create --title "[TSK-092-DB-SeedData] Database Seed Data Implementation" --body-file "docs/project-specific/step6-todo-list/issues/TSK-092-DB-SeedData.md" --label "augment-20250528" --assignee "toshikazuyokoi"

echo.
echo All Database Migration Issues created successfully!
echo Please check GitHub Issues page to verify creation.
pause
