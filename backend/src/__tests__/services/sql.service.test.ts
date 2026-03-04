import path from 'node:path';
import { resolveFilePath, readSqlFile, executeSql, runSqlFile } from '../../services/sql.service';

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('pg', () => {
  const connect = jest.fn().mockResolvedValue(undefined);
  const query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
  const end = jest.fn().mockResolvedValue(undefined);
  const Client = jest.fn().mockImplementation(() => ({ connect, query, end }));
  return { Client };
});

import fs from 'node:fs';
import { Client } from 'pg';

const mockExistsSync = fs.existsSync as jest.Mock;
const mockReadFileSync = fs.readFileSync as jest.Mock;
const MockClient = Client as jest.MockedClass<typeof Client>;

beforeEach(() => jest.clearAllMocks());

describe('sql.service', () => {
  describe('resolveFilePath', () => {
    it('should return an absolute path unchanged', () => {
      const abs = '/absolute/path/file.sql';
      expect(resolveFilePath(abs)).toBe(abs);
    });

    it('should resolve a relative path to an absolute path', () => {
      const result = resolveFilePath('relative/file.sql');
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).toContain('relative/file.sql');
    });
  });

  describe('readSqlFile', () => {
    it('should throw if the file does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      expect(() => readSqlFile('/no/such/file.sql')).toThrow('File not found');
    });

    it('should throw if the file is empty', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('   ');
      expect(() => readSqlFile('/empty.sql')).toThrow('SQL file is empty');
    });

    it('should return trimmed SQL content', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('  SELECT 1;  ');
      expect(readSqlFile('/valid.sql')).toBe('SELECT 1;');
    });
  });

  describe('executeSql', () => {
    it('should throw when SUPABASE_DB_URL is not set and no connectionString provided', async () => {
      const original = process.env.SUPABASE_DB_URL;
      delete process.env.SUPABASE_DB_URL;
      await expect(executeSql('SELECT 1')).rejects.toThrow('SUPABASE_DB_URL is not set');
      process.env.SUPABASE_DB_URL = original;
    });

    it('should execute SQL and return an array of results', async () => {
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
      const clientInstance = new MockClient({ connectionString: 'pg://...' } as any);
      (clientInstance.query as jest.Mock).mockResolvedValue(mockResult);
      MockClient.mockImplementation(() => clientInstance);

      const results = await executeSql('SELECT 1', { connectionString: 'postgresql://test' });
      expect(results).toHaveLength(1);
      expect(clientInstance.connect).toHaveBeenCalled();
      expect(clientInstance.end).toHaveBeenCalled();
    });

    it('should call client.end() even when query throws', async () => {
      const clientInstance = new MockClient({ connectionString: 'pg://...' } as any);
      (clientInstance.query as jest.Mock).mockRejectedValue(new Error('query error'));
      MockClient.mockImplementation(() => clientInstance);

      await expect(
        executeSql('SELECT 1', { connectionString: 'postgresql://test' })
      ).rejects.toThrow('query error');

      expect(clientInstance.end).toHaveBeenCalled();
    });
  });

  describe('runSqlFile', () => {
    it('should resolve path, read file, execute SQL, and return result', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('SELECT 1;');
      const mockResult = { rows: [], rowCount: 0 };
      const clientInstance = new MockClient({ connectionString: 'pg://...' } as any);
      (clientInstance.query as jest.Mock).mockResolvedValue(mockResult);
      MockClient.mockImplementation(() => clientInstance);

      const result = await runSqlFile('/migration.sql', {
        connectionString: 'postgresql://test',
      });
      expect(result.sql).toBe('SELECT 1;');
      expect(result.results).toHaveLength(1);
    });

    it('should throw when the SQL file does not exist', async () => {
      mockExistsSync.mockReturnValue(false);
      await expect(
        runSqlFile('/no/file.sql', { connectionString: 'postgresql://test' })
      ).rejects.toThrow('File not found');
    });
  });
});
