/**
 * Simple Database Connection Test
 * Generated for TSK-IT-000-002-TestDatabase
 * Purpose: Basic database connectivity verification
 */

const { Pool } = require('pg');

describe('Simple Database Connection Test', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5434'),
      database: process.env.POSTGRES_DB || 'taskdb_integration',
      user: process.env.POSTGRES_USER || 'integration_user',
      password: process.env.POSTGRES_PASSWORD || 'integration_password_123',
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      ssl: false
    });
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  test('should connect to integration database', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1 as test_value');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].test_value).toBe(1);
    } finally {
      client.release();
    }
  });

  test('should verify database name', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT current_database() as db_name');
      expect(result.rows[0].db_name).toBe('taskdb_integration');
    } finally {
      client.release();
    }
  });

  test('should verify user permissions', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT current_user as username');
      expect(result.rows[0].username).toBe('integration_user');
    } finally {
      client.release();
    }
  });

  test('should verify tables exist', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      const tableNames = result.rows.map(row => row.table_name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('categories');
      expect(tableNames).toContain('tasks');
    } finally {
      client.release();
    }
  });

  test('should verify test utility functions exist', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'test_utilities'
        AND routine_type = 'FUNCTION'
        ORDER BY routine_name
      `);
      
      const functionNames = result.rows.map(row => row.routine_name);
      expect(functionNames.length).toBeGreaterThan(0);
    } finally {
      client.release();
    }
  });
});
