/**
 * Parse drug description to extract chemical name and strength
 * Example: "LIPITOR 10MG TB 90" -> { chemical: "LIPITOR", strength: "10MG" }
 * Example: "AA-AMILZIDE 5/50MG TB 1000" -> { chemical: "AA-AMILZIDE", strength: "5/50MG" }
 */
export interface ParsedDrug {
  chemical: string;
  strength: string | null;
  form: string | null;
  rawDescription: string;
}

// Common dosage form abbreviations
const DOSAGE_FORMS = [
  'TB', 'TAB', 'TABLET', 'TABLETS',
  'CP', 'CAP', 'CAPS', 'CAPSULE', 'CAPSULES',
  'ML', 'MG', 'MCG', 'G', 'GM',
  'INJ', 'INJECTION',
  'SYR', 'SYRUP',
  'SOL', 'SOLUTION',
  'SUSP', 'SUSPENSION',
  'CR', 'CREAM',
  'OINT', 'OINTMENT',
  'GEL',
  'LOT', 'LOTION',
  'DROP', 'DROPS',
  'SPRAY',
  'PATCH',
  'INH', 'INHALER',
  'PEN',
  'DISKUS',
  'HFA',
  'UD',
  'XR', 'SR', 'ER', 'CD', 'LA', 'XL', 'CR', 'DR', 'EC', 'OD', 'IR',
  'CONTIN',
];

// Strength pattern: number followed by unit (mg, mcg, ml, etc.)
const STRENGTH_PATTERN = /(\d+\.?\d*\/?\d*\.?\d*)\s*(MG|MCG|G|ML|%|IU|UNIT|UNITS|UG|MEQ)/i;

export function parseDrugDescription(description: string): ParsedDrug {
  if (!description) {
    return { chemical: '', strength: null, form: null, rawDescription: description };
  }

  const parts = description.trim().toUpperCase().split(/\s+/);
  
  let chemical = '';
  let strength: string | null = null;
  let form: string | null = null;
  
  // Find the strength in the description
  const strengthMatch = description.toUpperCase().match(STRENGTH_PATTERN);
  
  if (strengthMatch) {
    strength = strengthMatch[0];
    
    // Chemical name is everything before the strength
    const strengthIndex = description.toUpperCase().indexOf(strengthMatch[0]);
    chemical = description.substring(0, strengthIndex).trim();
    
    // Clean up chemical name - remove trailing form codes if accidentally included
    const chemicalParts = chemical.split(/\s+/);
    while (chemicalParts.length > 0 && DOSAGE_FORMS.includes(chemicalParts[chemicalParts.length - 1].toUpperCase())) {
      form = chemicalParts.pop() || null;
    }
    chemical = chemicalParts.join(' ');
  } else {
    // No strength found, use first part as chemical
    chemical = parts[0] || '';
  }
  
  // Clean up chemical name
  chemical = chemical.replace(/\s+/g, ' ').trim();
  
  return {
    chemical,
    strength,
    form,
    rawDescription: description,
  };
}

/**
 * Generate a duplicate key from chemical name and strength
 * Used for grouping duplicates together
 */
export function getDuplicateKey(description: string): string {
  const parsed = parseDrugDescription(description);
  const chemical = parsed.chemical.toUpperCase().trim();
  const strength = parsed.strength?.toUpperCase().trim() || 'NO_STRENGTH';
  return `${chemical}|${strength}`;
}

/**
 * Find duplicate groups in inventory items
 * Returns a map of duplicate keys to item counts
 */
export function findDuplicateGroups<T extends { description: string; manufacturer_code: string }>(
  items: T[]
): Map<string, { count: number; mfrCodes: Set<string>; items: T[] }> {
  const groups = new Map<string, { count: number; mfrCodes: Set<string>; items: T[] }>();
  
  for (const item of items) {
    const key = getDuplicateKey(item.description);
    const existing = groups.get(key);
    
    if (existing) {
      existing.count++;
      existing.mfrCodes.add(item.manufacturer_code);
      existing.items.push(item);
    } else {
      groups.set(key, {
        count: 1,
        mfrCodes: new Set([item.manufacturer_code]),
        items: [item],
      });
    }
  }
  
  return groups;
}

/**
 * Get duplicate keys that have multiple different MFR codes
 * These are the "true" duplicates we want to highlight
 */
export function getTrueDuplicateKeys<T extends { description: string; manufacturer_code: string }>(
  items: T[]
): Set<string> {
  const groups = findDuplicateGroups(items);
  const duplicateKeys = new Set<string>();
  
  for (const [key, group] of groups) {
    // Only consider it a duplicate if there are multiple different MFR codes
    if (group.mfrCodes.size > 1) {
      duplicateKeys.add(key);
    }
  }
  
  return duplicateKeys;
}
