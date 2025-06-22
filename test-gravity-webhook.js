#!/usr/bin/env node

// Test script for Gravity Forms webhook
// Run with: node test-gravity-webhook.js

const WEBHOOK_URL = 'https://furekgiahpuetskjtkaj.supabase.co/functions/v1/gravity-forms-webhook';

// Sample Gravity Forms webhook payload with correct field names
const samplePayload = {
  entry: {
    "first name": "John",                    // first name
    "last name": "Doe",                      // last name  
    "email": "john.doe@example.com",         // email
    "phone": "(555) 123-4567",              // phone
    "address": "123 Main St",                // address
    "City": "Toronto",                       // city
    "Postal Code": "M5V 3A8",               // postal code
    "site challenges": "Steep slope in backyard", // site challenges
    "referral source": "Google Search",      // referral source
    "services": "Landscape Design & Build, Lawn Maintenance", // services
    "project vision": "Create a beautiful outdoor space for entertaining", // project vision
    "describe your vision(other page)": "",  // fallback project vision
    "uploaded images": "https://example.com/image1.jpg,https://example.com/image2.jpg", // uploaded images
    "design and build elements": "Walkway, Lighting, Fence/gates", // design and build elements
    "enhancement elements": "Pruning, Mulching",      // enhancement elements
    "lawn maintenance package": "Premium",            // lawn maintenance package
    "snow management property size": "Large (1+ acre)", // snow management property size
    "design and build budget": 15000,                // design and build budget
    "landscape enhancement budget": 3000,             // landscape enhancement budget
    "lawn maintenance budget": 500,                   // lawn maintenance budget
    "snow management budget": 800,                    // snow management budget
    "other budget": 200,                             // other budget
    "project start time": "1-3 Months",              // project start time
    "lawn maintenance start date": "2025-05-01",     // lawn maintenance start date
    "snow management start date": "2025-11-01",      // snow management start date
    "date_created": "2025-01-15 10:30:00",
    "id": "123"
  },
  form: {
    id: "1",
    title: "VIL Landscape Quote Form"
  }
};

async function testWebhook() {
  console.log('🧪 Testing Gravity Forms webhook...');
  console.log('📡 Webhook URL:', WEBHOOK_URL);
  console.log('📋 Sample payload:', JSON.stringify(samplePayload, null, 2));
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(samplePayload)
    });
    
    const responseText = await response.text();
    
    console.log('\n📊 Response Status:', response.status);
    console.log('📄 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📝 Response Body:', responseText);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
      
      try {
        const responseData = JSON.parse(responseText);
        if (responseData.session_id) {
          console.log('🆔 Created session ID:', responseData.session_id);
          console.log('🔗 Follow-up link:', responseData.data.follow_up_link);
        }
      } catch (e) {
        console.log('⚠️ Response is not valid JSON');
      }
    } else {
      console.log('❌ Webhook test failed');
    }
    
  } catch (error) {
    console.error('💥 Error testing webhook:', error.message);
  }
}

// Expected mapping output for verification
console.log('\n🗺️ Expected field mapping:');
console.log('Direct mappings:');
console.log('  first_name:', samplePayload.entry["first name"]);
console.log('  last_name:', samplePayload.entry["last name"]);
console.log('  email:', samplePayload.entry["email"]);
console.log('  phone:', samplePayload.entry["phone"]);
console.log('  address:', samplePayload.entry["address"]);
console.log('  city:', samplePayload.entry["City"]);
console.log('  postal_code:', samplePayload.entry["Postal Code"]);
console.log('  site_challenges:', samplePayload.entry["site challenges"]);
console.log('  referral_source:', samplePayload.entry["referral source"]);
console.log('  services:', samplePayload.entry["services"].split(',').map(s => s.trim()));
console.log('  project_vision:', samplePayload.entry["project vision"]);
console.log('  photo_urls:', samplePayload.entry["uploaded images"].split(',').map(s => s.trim()));

console.log('\nJSONB mappings:');
console.log('  service_details:', {
  landscape_design_build: {
    elements: samplePayload.entry["design and build elements"].split(',').map(s => s.trim())
  },
  landscape_enhancement: {
    elements: samplePayload.entry["enhancement elements"].split(',').map(s => s.trim())
  },
  lawn_maintenance: {
    package: samplePayload.entry["lawn maintenance package"]
  },
  snow_management: {
    property_size: samplePayload.entry["snow management property size"]
  }
});

console.log('  budgets:', {
  landscape_design_build: samplePayload.entry["design and build budget"],
  landscape_enhancement: samplePayload.entry["landscape enhancement budget"],
  lawn_maintenance: samplePayload.entry["lawn maintenance budget"],
  snow_management: samplePayload.entry["snow management budget"],
  other: samplePayload.entry["other budget"],
  total: samplePayload.entry["design and build budget"] + samplePayload.entry["landscape enhancement budget"] + samplePayload.entry["lawn maintenance budget"] + samplePayload.entry["snow management budget"] + samplePayload.entry["other budget"]
});

console.log('  start_deadlines:', {
  landscape_design_build: samplePayload.entry["project start time"],
  landscape_enhancement: samplePayload.entry["project start time"],
  lawn_maintenance: samplePayload.entry["lawn maintenance start date"],
  snow_management: samplePayload.entry["snow management start date"]
});

console.log('\nAuto-set fields:');
console.log('  form_source: gravity_forms');
console.log('  form_type: initial');
console.log('  initial_form_completed: true');
console.log('  photos_uploaded: true');
console.log('  follow_up_sequence_status: active');
console.log('  next_follow_up: now + 2 hours');
console.log('  follow_up_email_sent: false (will be true after email sends)');

// Run the test
testWebhook();