type ScrapeResult = Record<string, any>;
/**
 * Generates SQL INSERT statements from scraped data
 * @param data - Array of scraped data objects
 * @param tableName - Name of the SQL table to insert into
 * @param filename - Output filename for the SQL file
 */
export declare function exportToSql(data: ScrapeResult[], tableName: string, filename: string): void;
export {};
//# sourceMappingURL=sql-export.d.ts.map