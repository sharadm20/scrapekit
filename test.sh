#!/bin/bash
# Test script for the web scraper CLI

echo "Testing Web Scraper CLI..."

# Test 1: Scrape example.com for title tag and export to JSON
echo "Test 1: Scraping title from example.com to JSON..."
npm run dev -- --url https://example.com --selector "title" --output test_title --format json

# Test 2: Scrape all links from example.com and export to Excel
echo -e "\nTest 2: Scraping links from example.com to Excel..."
npm run dev -- --url https://example.com --selector "a" --output test_links --format excel

# Test 3: Scrape all paragraphs from example.com and export to SQL
echo -e "\nTest 3: Scraping paragraphs from example.com to SQL..."
npm run dev -- --url https://example.com --selector "p" --output test_paragraphs --format sql

# Test 4: Scrape all headings from example.com and export to XML
echo -e "\nTest 4: Scraping headings from example.com to XML..."
npm run dev -- --url https://example.com --selector "h1, h2, h3" --output test_headings --format xml

# Test 5: Show help
echo -e "\nTest 5: Showing help..."
npm run dev -- --help

echo -e "\nAll tests completed!"