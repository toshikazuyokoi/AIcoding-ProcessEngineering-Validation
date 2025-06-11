/**
 * ===================================
 * TypeScript Configuration Test
 * ===================================
 * Purpose: Verify TypeScript configuration includes tests directory
 */

const fs = require('fs');
const path = require('path');

describe('TypeScript Configuration', () => {
  test('should include tests directory in tsconfig.json', () => {
    const tsconfigPath = path.resolve(__dirname, '../../../tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    const tsconfig = JSON.parse(tsconfigContent);
    
    expect(tsconfig.include).toContain('tests/**/*');
  });

  test('should have correct compiler options', () => {
    const tsconfigPath = path.resolve(__dirname, '../../../tsconfig.json');
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    const tsconfig = JSON.parse(tsconfigContent);
    
    expect(tsconfig.compilerOptions.target).toBe('ES2022');
    expect(tsconfig.compilerOptions.module).toBe('commonjs');
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
  });
});
