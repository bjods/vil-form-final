import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface GravityFormsEntry {
  [key: string]: any;
  "1"?: string;    // first name
  "2"?: string;    // last name
  "3"?: string;    // email
  "4"?: string;    // phone
  "5"?: string;    // address
  "6"?: string;    // city
  "7"?: string;    // postal code
  "8"?: string;    // site challenges
  "9"?: string;    // services (comma-separated)
  "10"?: string;   // project vision
  "11"?: string;   // describe your vision (other page)
  "12"?: string;   // uploaded images
  "13"?: string;   // design and build elements
  "14"?: string;   // enhancement elements
  "15"?: string;   // lawn maintenance package
  "16"?: string;   // snow management property size
  "17"?: number;   // design and build budget
  "18"?: number;   // landscape enhancement budget
  "19"?: number;   // lawn maintenance budget
  "20"?: number;   // snow management budget
  "21"?: number;   // other budget
  "22"?: string;   // project start time
  "23"?: string;   // lawn maintenance start date
  "24"?: string;   // snow management start date
  date_created?: string;
  id?: string;
}

interface GravityFormsWebhookPayload {
  entry: GravityFormsEntry;
  form: {
    id: string;
    title: string;
  };
}

// Helper function to parse services string into array
function parseServices(servicesString: string | undefined): string[] {
  if (!servicesString) return [];
  return servicesString
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Helper function to parse photo URLs
function parsePhotoUrls(photosString: string | undefined): string[] {
  if (!photosString || !photosString.trim()) return [];
  return photosString
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Helper function to build service_details JSONB
function buildServiceDetails(entry: GravityFormsEntry): Record<string, any> {
  const serviceDetails: Record<string, any> = {};
  
  // Design and build elements
  if (entry["13"] && entry["13"].trim()) {
    serviceDetails.landscape_design_build = {
      elements: entry["13"].split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    };
  }
  
  // Enhancement elements
  if (entry["14"] && entry["14"].trim()) {
    serviceDetails.landscape_enhancement = {
      elements: entry["14"].split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    };
  }
  
  // Lawn maintenance package
  if (entry["15"] && entry["15"].trim()) {
    serviceDetails.lawn_maintenance = {
      package: entry["15"]
    };
  }
  
  // Snow management property size
  if (entry["16"] && entry["16"].trim()) {
    serviceDetails.snow_management = {
      property_size: entry["16"]
    };
  }
  
  return serviceDetails;
}

// Helper function to build budgets JSONB
function buildBudgets(entry: GravityFormsEntry): Record<string, number | null> {
  const budgets: Record<string, number | null> = {
    landscape_design_build: entry["17"] ? Number(entry["17"]) : null,
    landscape_enhancement: entry["18"] ? Number(entry["18"]) : null,
    lawn_maintenance: entry["19"] ? Number(entry["19"]) : null,
    snow_management: entry["20"] ? Number(entry["20"]) : null,
    other: entry["21"] ? Number(entry["21"]) : null,
    total: 0
  };
  
  // Calculate total
  budgets.total = Object.values(budgets)
    .filter(v => v !== null && typeof v === 'number')
    .reduce((sum, budget) => sum + (budget as number), 0);
  
  return budgets;
}

// Helper function to build start_deadlines JSONB
function buildStartDeadlines(entry: GravityFormsEntry): Record<string, string | null> {
  const startDeadlines: Record<string, string | null> = {
    landscape_design_build: entry["22"] || null,
    landscape_enhancement: entry["22"] || null, // Same as design_build
    lawn_maintenance: entry["23"] || null,
    snow_management: entry["24"] || null
  };
  
  return startDeadlines;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }

  try {
    console.log('🎯 Gravity Forms webhook received');
    
    // Parse the webhook payload
    const payload: GravityFormsWebhookPayload = await req.json();
    const entry = payload.entry;
    
    console.log('📋 Raw Gravity Forms entry:', JSON.stringify(entry, null, 2));
    
    // Validate required fields
    if (!entry["3"] || !entry["1"]) {
      throw new Error('Missing required fields: email and first name are required');
    }
    
    // Map Gravity Forms data to form_sessions format
    const services = parseServices(entry["9"]);
    const serviceDetails = buildServiceDetails(entry);
    const budgets = buildBudgets(entry);
    const startDeadlines = buildStartDeadlines(entry);
    const photoUrls = parsePhotoUrls(entry["12"]);
    
    // Determine project vision - use main field or fallback to "other page" field
    const projectVision = entry["10"] || entry["11"] || null;
    
    // Check if photos were uploaded
    const hasPhotos = photoUrls.length > 0;
    
    // Build the form session record
    const formSessionData = {
      // Direct field mappings
      first_name: entry["1"] || null,
      last_name: entry["2"] || null,
      email: entry["3"] || null,
      phone: entry["4"] || null,
      address: entry["5"] || null,
      city: entry["6"] || null,
      postal_code: entry["7"] || null,
      site_challenges: entry["8"] || null,
      services: services,
      project_vision: projectVision,
      photo_urls: photoUrls,
      
      // JSONB fields
      service_details: serviceDetails,
      budgets: budgets,
      start_deadlines: startDeadlines,
      
      // Additional fields to set
      form_source: 'gravity_forms',
      form_type: 'initial',
      initial_form_completed: true,
      photos_uploaded: hasPhotos,
      
      // Store raw Gravity Forms data
      gravity_forms_data: entry,
      gravity_forms_entry_date: entry.date_created || new Date().toISOString(),
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('💾 Mapped form session data:', JSON.stringify(formSessionData, null, 2));
    
    // Insert into Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/form_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(formSessionData)
    });
    
    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('❌ Failed to insert form session:', errorText);
      throw new Error(`Database insert failed: ${insertResponse.status} - ${errorText}`);
    }
    
    const insertedRecord = await insertResponse.json();
    const sessionId = insertedRecord[0]?.id;
    
    console.log('✅ Form session created successfully:', sessionId);
    console.log('📊 Session data summary:', {
      session_id: sessionId,
      email: formSessionData.email,
      services: formSessionData.services,
      total_budget: formSessionData.budgets.total,
      has_photos: formSessionData.photos_uploaded
    });
    
    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      session_id: sessionId,
      message: 'Gravity Forms entry processed successfully',
      data: {
        email: formSessionData.email,
        services_count: formSessionData.services.length,
        total_budget: formSessionData.budgets.total,
        photos_uploaded: formSessionData.photos_uploaded
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
    
  } catch (error) {
    console.error('💥 Error processing Gravity Forms webhook:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
}); 