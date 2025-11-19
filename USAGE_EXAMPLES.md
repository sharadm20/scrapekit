# Web Scraper CLI - Usage Examples

## Installation

1. Clone or download the project
2. Install dependencies:
```bash
npm install
```
3. Build the project:
```bash
npm run build
```

## Basic Usage

### Command Format
```bash
node dist/scraper.js --url <URL> --selector <CSS_SELECTOR> [OPTIONS]
```

### Examples

1. Scrape all links and export to JSON:
```bash
node dist/scraper.js --url https://example.com --selector "a" --output links --format json
```

2. Scrape images with src attribute and export to Excel:
```bash
node dist/scraper.js --url https://example.com --selector "img" --attribute "src" --output images --format excel
```

3. Scrape all paragraphs and export to SQL:
```bash
node dist/scraper.js --url https://example.com --selector "p" --output paragraphs --format sql
```

4. Scrape links and export to MongoDB (requires MongoDB running):
```bash
node dist/scraper.js --url https://example.com --selector "a" --output links --format mongo --mongodb-url mongodb://localhost:27017 --db-name myapp --collection-name scraped_links
```

5. Scrape articles and export to XML:
```bash
node dist/scraper.js --url https://example.com --selector ".article" --output articles --format xml
```

## Output

- JSON: Creates a `.json` file with scraped data
- Excel: Creates a `.xlsx` spreadsheet with scraped data  
- SQL: Creates a `.sql` file with CREATE TABLE and INSERT statements
- MongoDB: Inserts data into the specified MongoDB collection
- XML: Creates a `.xml` file with the scraped data