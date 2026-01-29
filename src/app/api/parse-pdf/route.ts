import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseInventoryReportEnhanced } from '@/lib/pdf-parser';
import { PdfReader } from 'pdfreader';

// Increase the timeout for this route
export const maxDuration = 300; // 5 minutes for large PDFs

// Extract text from PDF using pdfreader (Node.js native, no worker required)
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const bufferData = Buffer.from(buffer);
      const pdfReader = new PdfReader();

      // Group text items by page and row (y coordinate)
      const pages: Map<number, Map<number, string[]>> = new Map();
      let currentPage = 0;

      pdfReader.parseBuffer(bufferData, (err, item) => {
        if (err) {
          console.error('PDF extraction error:', err);
          const errorMsg = typeof err === 'string' ? err : (err as Error).message;
          reject(new Error(`Failed to extract text from PDF: ${errorMsg}`));
        } else if (!item) {
          // End of file - reconstruct text with proper line breaks
          const allLines: string[] = [];

          // Process each page
          pages.forEach((rows) => {
            // Sort rows by y coordinate (top to bottom)
            const sortedRows = Array.from(rows.entries()).sort((a, b) => a[0] - b[0]);

            // Join text items in each row
            sortedRows.forEach(([, textItems]) => {
              const line = textItems.join(' ');
              if (line.trim()) {
                allLines.push(line);
              }
            });
          });

          const fullText = allLines.join('\n');
          console.log(`[PDF Extract] Extracted ${pages.size} pages, ${allLines.length} lines, ${fullText.length} chars total`);
          console.log(`[PDF Extract] First 500 chars:`, fullText.substring(0, 500));
          resolve(fullText);
        } else if (item.page) {
          // New page marker
          currentPage = item.page;
          if (!pages.has(currentPage)) {
            pages.set(currentPage, new Map());
          }
        } else if (item.text && typeof item.y === 'number') {
          // Text item with coordinates
          if (!pages.has(currentPage)) {
            pages.set(currentPage, new Map());
          }

          const pageRows = pages.get(currentPage)!;
          const rowKey = Math.floor(item.y * 10); // Group items on similar y coordinate

          if (!pageRows.has(rowKey)) {
            pageRows.set(rowKey, []);
          }

          pageRows.get(rowKey)!.push(item.text);
        }
      });
    } catch (error) {
      console.error('PDF extraction error:', error);
      reject(new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const storeId = formData.get('storeId') as string;
    const fileName = formData.get('fileName') as string;
    const userId = formData.get('userId') as string;

    if (!file || !storeId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse PDF to extract text
    let textContent: string;
    try {
      console.log(`[PDF Upload] Starting extraction for file: ${fileName} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)`);
      const startTime = Date.now();
      textContent = await extractTextFromPDF(arrayBuffer);
      const extractionTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[PDF Upload] Extraction completed in ${extractionTime}s, extracted ${textContent.length} characters`);
    } catch (pdfError) {
      console.error('[PDF Upload] PDF parsing error:', pdfError);
      return NextResponse.json(
        { 
          error: pdfError instanceof Error ? pdfError.message : 'Failed to parse PDF file. Make sure it is a valid PDF.',
          details: process.env.NODE_ENV === 'development' ? String(pdfError) : undefined
        },
        { status: 400 }
      );
    }

    // Create admin Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse the extracted text content
    console.log('[PDF Upload] Parsing inventory data from extracted text...');
    const parseStartTime = Date.now();
    const parsed = parseInventoryReportEnhanced(textContent);
    const parseTime = ((Date.now() - parseStartTime) / 1000).toFixed(1);
    console.log(`[PDF Upload] Parsed ${parsed.items.length} items in ${parseTime}s`);

    if (parsed.items.length === 0) {
      return NextResponse.json(
        { error: 'No inventory items found in the report. Please check the PDF format.' },
        { status: 400 }
      );
    }

    // Extract store code from PDF
    const pdfStoreCode = parsed.storeCode;
    console.log(`[PDF Upload] PDF Store Code: ${pdfStoreCode}, Store Name: ${parsed.storeName}`);

    // Validate store code exists in database
    const { data: storeFromPDF, error: storeError } = await supabase
      .from('stores')
      .select('id, name, code')
      .eq('code', pdfStoreCode)
      .single();

    if (storeError || !storeFromPDF) {
      console.error(`[PDF Upload] Unknown store code in PDF: ${pdfStoreCode}`);
      return NextResponse.json(
        {
          error: `PDF contains unknown store code "${pdfStoreCode}". Please verify the PDF is correct.`,
          pdfStoreCode,
        },
        { status: 400 }
      );
    }

    // Validate PDF store matches selected store
    if (storeFromPDF.id !== storeId) {
      console.error(`[PDF Upload] Store mismatch - PDF: ${pdfStoreCode} (${storeFromPDF.id}), Selected: ${storeId}`);
      return NextResponse.json(
        {
          error: `PDF mismatch: This report is for "${storeFromPDF.name}" (${pdfStoreCode}) but you selected a different store. Please select the correct store and try again.`,
          pdfStoreCode,
          pdfStoreName: storeFromPDF.name,
          selectedStoreId: storeId,
        },
        { status: 400 }
      );
    }

    // Fetch uploader's profile to check role and store_id
    const { data: uploaderProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, store_id')
      .eq('id', userId)
      .single();

    if (profileError || !uploaderProfile) {
      console.error('[PDF Upload] Invalid user ID:', userId);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid user' },
        { status: 403 }
      );
    }

    // Role-based access control
    // Associates can upload for any store
    // Admins can only upload for their own store
    if (uploaderProfile.role === 'admin' && uploaderProfile.store_id !== storeId) {
      console.error(`[PDF Upload] Admin ${userId} attempted to upload for different store. Admin store: ${uploaderProfile.store_id}, Attempted: ${storeId}`);
      return NextResponse.json(
        {
          error: 'Unauthorized: Admins can only upload PDFs for their assigned store.',
          uploaderStoreId: uploaderProfile.store_id,
          attemptedStoreId: storeId,
        },
        { status: 403 }
      );
    }

    if (uploaderProfile.role !== 'admin' && uploaderProfile.role !== 'associate') {
      console.error(`[PDF Upload] User ${userId} with role ${uploaderProfile.role} attempted upload`);
      return NextResponse.json(
        { error: 'Unauthorized: Only admins and associates can upload inventory reports.' },
        { status: 403 }
      );
    }

    // Log successful validation
    console.log(`[PDF Upload] Store validation passed:`);
    console.log(`  - PDF Store Code: ${pdfStoreCode}`);
    console.log(`  - PDF Store Name: ${storeFromPDF.name}`);
    console.log(`  - Selected Store ID: ${storeId}`);
    console.log(`  - Uploader: ${userId} (${uploaderProfile.role})`)

    // Create report upload record
    console.log('[PDF Upload] Creating upload record...');
    const { data: upload, error: uploadError } = await supabase
      .from('report_uploads')
      .insert({
        store_id: storeId,
        uploaded_by: userId,
        file_name: fileName,
        report_date: parsed.reportDate || new Date().toISOString().split('T')[0],
        items_count: parsed.items.length,
        total_value: parsed.totalCost,
        status: 'processing',
      })
      .select()
      .single();

    if (uploadError) {
      console.error('[PDF Upload] Error creating upload record:', uploadError);
      throw uploadError;
    }

    // Delete ALL existing inventory for this store
    // Supabase may limit rows affected per request, so loop until all are gone
    console.log('[PDF Upload] Deleting existing inventory items...');
    const deleteStartTime = Date.now();
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: deleted, error: deleteError } = await supabase
        .from('inventory_items')
        .delete()
        .eq('store_id', storeId)
        .select('id');

      if (deleteError) {
        console.error('[PDF Upload] Error deleting existing inventory:', deleteError);
        throw deleteError;
      }

      const batchDeleted = deleted?.length || 0;
      totalDeleted += batchDeleted;
      hasMore = batchDeleted >= 1000; // If we deleted 1000, there might be more
      if (hasMore) {
        console.log(`[PDF Upload] Deleted batch of ${batchDeleted}, checking for more...`);
      }
    }
    console.log(`[PDF Upload] Deleted ${totalDeleted} existing items in ${((Date.now() - deleteStartTime) / 1000).toFixed(1)}s`);

    // Insert new inventory items
    const inventoryItems = parsed.items.map((item) => ({
      store_id: storeId,
      item_code: item.item_code,
      manufacturer_code: item.manufacturer_code,
      description: item.description,
      size: item.size,
      unit_of_measure: item.unit_of_measure,
      marketing_status: item.marketing_status,
      order_control: item.order_control,
      backroom_stock: item.backroom_stock,
      on_hand: item.on_hand,
      total_quantity: item.total_quantity,
      cost: item.cost,
      days_aging: item.days_aging,
      report_date: parsed.reportDate || new Date().toISOString().split('T')[0],
    }));

    // Insert in batches of 100
    console.log(`[PDF Upload] Inserting ${inventoryItems.length} items in batches...`);
    const insertStartTime = Date.now();
    const batchSize = 100;
    const totalBatches = Math.ceil(inventoryItems.length / batchSize);
    
    for (let i = 0; i < inventoryItems.length; i += batchSize) {
      const batch = inventoryItems.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const { error: insertError } = await supabase
        .from('inventory_items')
        .insert(batch);

      if (insertError) {
        console.error(`[PDF Upload] Error inserting batch ${batchNum}/${totalBatches}:`, insertError);
        throw insertError;
      }
      console.log(`[PDF Upload] Inserted batch ${batchNum}/${totalBatches} (${batch.length} items)`);
    }
    console.log(`[PDF Upload] All items inserted in ${((Date.now() - insertStartTime) / 1000).toFixed(1)}s`);

    // Update upload record status
    await supabase
      .from('report_uploads')
      .update({ status: 'completed' })
      .eq('id', upload.id);
    
    const totalTime = ((Date.now() - requestStartTime) / 1000).toFixed(1);
    console.log(`[PDF Upload] ✅ Upload completed successfully in ${totalTime}s total`);

    return NextResponse.json({
      success: true,
      itemsCount: parsed.items.length,
      totalValue: parsed.totalCost,
      reportDate: parsed.reportDate,
      storeName: parsed.storeName,
    });
  } catch (error) {
    console.error('Parse PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to process report', details: error instanceof Error ? error.message : JSON.stringify(error) },
      { status: 500 }
    );
  }
}
