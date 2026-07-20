'use server';

import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';

export async function submitMarketingRequest(formData: FormData) {
  try {
    // Check if Vercel backend is configured (for local testing without keys)
    if (!process.env.POSTGRES_URL || !process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn("Vercel Postgres or Blob keys are missing. Skipping backend save.");
      return { success: true, fileUrls: [] };
    }

    // 1. Upload files to Vercel Blob
    const files = formData.getAll('files') as File[];
    const uploadedFileUrls: string[] = [];

    for (const file of files) {
      if (file.size === 0) continue;
      // create a unique name to prevent overwriting
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
      const blob = await put(`marketing_requests/${uniqueName}`, file, {
        access: 'public',
      });
      uploadedFileUrls.push(blob.url);
    }

    // 2. Insert into Postgres Database
    // Create the table if it doesn't exist yet
    await sql`
      CREATE TABLE IF NOT EXISTS marketing_requests (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        department VARCHAR(255),
        email VARCHAR(255),
        assistance_types TEXT,
        details TEXT,
        deadline VARCHAR(50),
        quotes_required VARCHAR(50),
        preferred_supplier TEXT,
        file_urls TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Extract form fields
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const department = formData.get('department') as string;
    const email = formData.get('email') as string;
    
    // Checkboxes are multiple, so get all checked values
    const assistanceTypesArray = formData.getAll('assistance_type[]') as string[];
    const assistanceOther = formData.get('assistance_type_other') as string;
    if (assistanceOther) {
      assistanceTypesArray.push(`Other: ${assistanceOther}`);
    }
    const assistanceTypes = JSON.stringify(assistanceTypesArray);
    
    const details = formData.get('details') as string;
    const deadline = formData.get('deadline') as string;
    const quotesRequired = formData.get('quotes_required') as string;
    const preferredSupplier = formData.get('preferred_supplier') as string;
    const fileUrlsStr = JSON.stringify(uploadedFileUrls);

    await sql`
      INSERT INTO marketing_requests (
        first_name, last_name, department, email, assistance_types, details, deadline, quotes_required, preferred_supplier, file_urls
      ) VALUES (
        ${firstName}, ${lastName}, ${department}, ${email}, ${assistanceTypes}, ${details}, ${deadline}, ${quotesRequired}, ${preferredSupplier}, ${fileUrlsStr}
      )
    `;

    return { success: true, fileUrls: uploadedFileUrls };
  } catch (error: any) {
    console.error('Error saving request:', error);
    return { success: false, error: error.message };
  }
}

export async function getMarketingRequests(password: string) {
  if (password !== 'Lunacat@2026') {
    return { success: false, error: 'Incorrect password' };
  }
  
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error("Missing POSTGRES_URL");
    }
    const { rows } = await sql`SELECT * FROM marketing_requests ORDER BY created_at DESC`;
    return { success: true, requests: rows };
  } catch (error: any) {
    // If the table doesn't exist yet (no submissions)
    if (error.message.includes('relation "marketing_requests" does not exist')) {
      return { success: true, requests: [] };
    }
    
    // If Postgres is not configured (running locally without env variables)
    if (error.message.includes('Missing POSTGRES_URL') || error.message.includes('invalid password')) {
      return { 
        success: true, 
        requests: [{
          id: "dummy1",
          first_name: "Jane",
          last_name: "Doe",
          department: "Childcare",
          email: "jane.doe@ymcatrinity.org.uk",
          assistance_types: '["Website update", "Social media post/campaign"]',
          details: "Need a new landing page for the summer childcare program and a few facebook posts to promote it.",
          deadline: "2026-08-01",
          quotes_required: "No",
          preferred_supplier: "N/A",
          file_urls: '[]',
          created_at: new Date()
        }]
      };
    }
    
    return { success: false, error: error.message };
  }
}
