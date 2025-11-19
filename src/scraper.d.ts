type ScrapeResult = Record<string, any>;
export declare function scrapeWebPage(url: string, selector: string, attribute?: string): Promise<ScrapeResult[]>;
export declare function exportToJson(data: ScrapeResult[], filename: string): void;
export declare function exportToExcel(data: ScrapeResult[], filename: string): void;
export declare function exportToXml(data: ScrapeResult[], filename: string): void;
export declare function exportToMongo(data: ScrapeResult[], dbName: string, collectionName: string, connectionString: string): Promise<void>;
declare function main(): Promise<void>;
export default main;
//# sourceMappingURL=scraper.d.ts.map