@echo off
REM Test script for the web scraper CLI

echo Testing Web Scraper CLI...

REM Test 1: Scrape example.com for title tag and export to JSON
echo Test 1: Scraping title from example.com to JSON...
npm run dev -- --url https://example.com --selector "title" --output test_title --format json

REM Test 2: Scrape all links from example.com and export to Excel
echo.
echo Test 2: Scraping links from example.com to Excel...
npm run dev -- --url https://example.com --selector "a" --output test_links --format excel

REM Test 3: Scrape all paragraphs from example.com and export to SQL
echo.
echo Test 3: Scraping paragraphs from example.com to SQL...
npm run dev -- --url https://example.com --selector "p" --output test_paragraphs --format sql

REM Test 4: Scrape all headings from example.com and export to XML
echo.
echo Test 4: Scraping headings from example.com to XML...
npm run dev -- --url https://example.com --selector "h1, h2, h3" --output test_headings --format xml

REM Test 5: Show help
echo.
echo Test 5: Showing help...
npm run dev -- --help

echo.
echo All tests completed!
pause