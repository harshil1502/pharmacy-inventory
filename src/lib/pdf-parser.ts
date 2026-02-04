import { ParsedInventoryItem } from '@/types';

interface ParseResult {
  storeName: string;
  storeCode: string;
  reportDate: string;
  items: ParsedInventoryItem[];
  totalQuantity: number;
  totalCost: number;
}

export function parseInventoryReport(text: string): ParseResult {
  const lines = text.split('\n');
  
  // Extract store info from header
  let storeName = '';
  let storeCode = '';
  let reportDate = '';
  
  for (const line of lines.slice(0, 5)) {
    // Match store name and code pattern like "KRUNAL PATEL APOTHECARY LTD. (0713)"
    const storeMatch = line.match(/([A-Z][A-Z\s]+(?:LTD|INC|CORP)?\.?)\s*\((\d+)\)/i);
    if (storeMatch) {
      storeName = storeMatch[1].trim();
      storeCode = storeMatch[2];
    }
    
    // Match date at start of line like "Jan 28/26"
    const dateMatch = line.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\/(\d{2})/i);
    if (dateMatch && !reportDate) {
      const monthMap: Record<string, string> = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const month = monthMap[dateMatch[1]] || '01';
      const day = dateMatch[2].padStart(2, '0');
      const year = '20' + dateMatch[3];
      reportDate = `${year}-${month}-${day}`;
    }
  }

  const items: ParsedInventoryItem[] = [];
  let currentItem: Partial<ParsedInventoryItem> | null = null;
  
  // Regex to match main item lines - relaxed description length (8-80 chars)
  // Format: DAYS_AGING   ITEM_CODE MANUF_CODE   DESCRIPTION   SIZE   UOM   MS   O/C   B/R_STOCK   ON_HAND   TOTAL   COST
  const mainItemRegex = /^\s*(\d+)?\s+(\d{5})\s+(\d{10,12})\s+(.{8,80}?)\s+(\d+)\s+([A-Z]+)\s+([A-Z])\s+([A-Z])\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)/;
  
  // Regex for continuation lines (just days aging, quantity, and cost)
  const continuationRegex = /^\s+(\d+)\s+(\d+)\s+([\d.]+)\s*$/;
  
  // Alternative main item regex with more flexible spacing
  const altMainItemRegex = /^\s*(\d+)?\s*(\d{5})\s+(\d{10,12})\s+(.+?)\s{2,}(\d+)\s+([A-Z]+)\s+([A-Z])\s+([A-Z])\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)/;

  for (const line of lines) {
    // Skip header lines and empty lines
    if (line.includes('INVESTMENT ANALYSIS') || 
        line.includes('SALES DEPARTMENT') ||
        line.includes('AREA OF STORE') ||
        line.includes('DAYS AGING RANGE') ||
        line.includes('MARKETING STATUS') ||
        line.includes('TYPE OF SORT') ||
        line.includes('PLANOGRAM') ||
        line.includes('ORDER CONTROL') ||
        line.includes('DAYS') && line.includes('ITEM') ||
        line.includes('AGING') && line.includes('DESCRIPTION') ||
        line.includes('---') ||
        line.includes('continued') ||
        line.includes('PAGE:') ||
        line.includes('GRAND TOTAL') ||
        line.trim() === '') {
      continue;
    }

    // Try to match main item line
    let match = line.match(mainItemRegex) || line.match(altMainItemRegex);
    
    if (match) {
      // Save previous item if exists
      if (currentItem && currentItem.item_code) {
        items.push(currentItem as ParsedInventoryItem);
      }
      
      currentItem = {
        days_aging: match[1] ? parseInt(match[1]) : null,
        item_code: match[2],
        manufacturer_code: match[3],
        description: match[4].trim(),
        size: parseInt(match[5]),
        unit_of_measure: match[6],
        marketing_status: match[7],
        order_control: match[8],
        backroom_stock: parseInt(match[9]),
        on_hand: parseInt(match[10]),
        total_quantity: parseInt(match[11]),
        cost: parseFloat(match[12]),
      };
    } else {
      // Try continuation line (sub-lots with different aging)
      const contMatch = line.match(continuationRegex);
      if (contMatch && currentItem) {
        // These are sub-entries for the same item with different aging
        // We could track these separately or aggregate - for now we skip
        // as the main line already has total
      }
    }
  }
  
  // Don't forget the last item
  if (currentItem && currentItem.item_code) {
    items.push(currentItem as ParsedInventoryItem);
  }

  // Extract grand totals if present
  let totalQuantity = 0;
  let totalCost = 0;
  
  for (const line of lines) {
    const grandTotalMatch = line.match(/GRAND TOTAL:\s+(\d+)\s+([\d.]+)/);
    if (grandTotalMatch) {
      totalQuantity = parseInt(grandTotalMatch[1]);
      totalCost = parseFloat(grandTotalMatch[2]);
      break;
    }
  }
  
  // If no grand total found, calculate from items
  if (totalQuantity === 0) {
    totalQuantity = items.reduce((sum, item) => sum + item.total_quantity, 0);
    totalCost = items.reduce((sum, item) => sum + item.cost, 0);
  }

  return {
    storeName,
    storeCode,
    reportDate,
    items,
    totalQuantity,
    totalCost,
  };
}

// Enhanced parser that handles the specific format better
export function parseInventoryReportEnhanced(text: string): ParseResult {
  const lines = text.split('\n');
  
  let storeName = '';
  let storeCode = '';
  let reportDate = '';
  
  // Parse header — only check first 5 lines for date/store info
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    
    const storeMatch = line.match(/([A-Z][A-Z\s]+(?:LTD|INC|CORP|PHARMACY)?\.?)\s*\((\d+)\)/i);
    if (storeMatch) {
      storeName = storeMatch[1].trim();
      storeCode = storeMatch[2];
    }
    
    // Only match date at the start of a line (e.g. "Jan 28/26  13:53")
    const dateMatch = line.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\/(\d{2})/i);
    if (dateMatch && !reportDate) {
      const monthMap: Record<string, string> = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const month = monthMap[dateMatch[1]] || '01';
      const day = dateMatch[2].padStart(2, '0');
      const year = '20' + dateMatch[3];
      reportDate = `${year}-${month}-${day}`;
    }
  }

  const items: ParsedInventoryItem[] = [];
  const itemMap = new Map<string, ParsedInventoryItem>();
  
  // More flexible regex patterns - relaxed description length to 8-80 chars
  const patterns = [
    // Pattern 1: Full line with days aging at start
    /^\s*(\d+)\s+(\d{5})\s+(\d{10,12})\s+(.{8,80}?)\s+(\d+)\s+([A-Z]+)\s+([A-Z])\s+([A-Z])\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)/,
    // Pattern 2: Full line without days aging (starts with item code)
    /^\s+(\d{5})\s+(\d{10,12})\s+(.{8,80}?)\s+(\d+)\s+([A-Z]+)\s+([A-Z])\s+([A-Z])\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)/,
    // Pattern 3: More flexible spacing - use greedy description match up to numbers
    /^\s*(\d+)\s+(\d{5})\s+(\d{10,12})\s+(.+?)\s{2,}(\d+)\s+([A-Z]+)\s+([A-Z])\s+([A-Z])\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)/,
    // Pattern 4: Without days aging, flexible spacing
    /^\s+(\d{5})\s+(\d{10,12})\s+(.+?)\s{2,}(\d+)\s+([A-Z]+)\s+([A-Z])\s+([A-Z])\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)/,
  ];

  for (const line of lines) {
    // Skip non-data lines
    if (line.includes('INVESTMENT ANALYSIS') || 
        line.includes('KRUNAL PATEL') ||
        line.includes('SALES DEPARTMENT') ||
        line.includes('AREA OF STORE') ||
        line.includes('DAYS AGING') && !line.match(/^\s*\d/) ||
        line.includes('MARKETING STATUS') ||
        line.includes('TYPE OF SORT') ||
        line.includes('PLANOGRAM') ||
        line.includes('ORDER CONTROL') ||
        line.includes('---') ||
        line.includes('continued') ||
        line.includes('PAGE:') ||
        line.includes('GRAND TOTAL') ||
        line.trim() === '' ||
        line.match(/^DAYS\s+.*ITEM/)) {
      continue;
    }

    // Try patterns with days aging first (patterns 0 and 2)
    let match = line.match(patterns[0]) || line.match(patterns[2]);
    if (match) {
      const item: ParsedInventoryItem = {
        days_aging: parseInt(match[1]),
        item_code: match[2],
        manufacturer_code: match[3],
        description: match[4].trim(),
        size: parseInt(match[5]),
        unit_of_measure: match[6],
        marketing_status: match[7],
        order_control: match[8],
        backroom_stock: parseInt(match[9]),
        on_hand: parseInt(match[10]),
        total_quantity: parseInt(match[11]),
        cost: parseFloat(match[12]),
      };
      
      const key = `${item.item_code}-${item.manufacturer_code}`;
      if (!itemMap.has(key)) {
        itemMap.set(key, item);
      }
      continue;
    }

    // Try patterns without days aging (patterns 1 and 3)
    match = line.match(patterns[1]) || line.match(patterns[3]);
    if (match) {
      const item: ParsedInventoryItem = {
        days_aging: null,
        item_code: match[1],
        manufacturer_code: match[2],
        description: match[3].trim(),
        size: parseInt(match[4]),
        unit_of_measure: match[5],
        marketing_status: match[6],
        order_control: match[7],
        backroom_stock: parseInt(match[8]),
        on_hand: parseInt(match[9]),
        total_quantity: parseInt(match[10]),
        cost: parseFloat(match[11]),
      };
      
      const key = `${item.item_code}-${item.manufacturer_code}`;
      if (!itemMap.has(key)) {
        itemMap.set(key, item);
      }
    }
  }

  // Convert map to array
  itemMap.forEach(item => items.push(item));

  // Calculate totals
  const totalQuantity = items.reduce((sum, item) => sum + item.total_quantity, 0);
  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  return {
    storeName: storeName || 'Unknown Store',
    storeCode: storeCode || '0000',
    reportDate: reportDate || new Date().toISOString().split('T')[0],
    items,
    totalQuantity,
    totalCost,
  };
}
