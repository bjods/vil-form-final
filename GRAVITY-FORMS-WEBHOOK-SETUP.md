# Gravity Forms Webhook Integration Setup

This document explains how to set up the complete Gravity Forms to Supabase mapping system.

## 1. Deploy the Webhook Handler

### Deploy the Edge Function

```bash
# Make sure you have the Supabase CLI installed
supabase functions deploy gravity-forms-webhook --project-ref fkrfpgbdgdxfgzxkiuoe
```

### Get the Webhook URL

After deployment, your webhook URL will be:
```
https://furekgiahpuetskjtkaj.supabase.co/functions/v1/gravity-forms-webhook
```

## 2. Configure Gravity Forms

1. Go to your WordPress admin panel
2. Navigate to Forms → Settings → Webhooks
3. Add a new webhook with:
   - **Name**: VIL Landscape Form Webhook
   - **Request URL**: `https://furekgiahpuetskjtkaj.supabase.co/functions/v1/gravity-forms-webhook`
   - **Request Method**: POST
   - **Request Format**: JSON

## 3. Field Mapping Reference

The webhook handler maps Gravity Forms fields to the `form_sessions` table as follows:

### Direct Field Mappings
- Field 1 (first name) → `first_name`
- Field 2 (last name) → `last_name` 
- Field 3 (email) → `email`
- Field 4 (phone) → `phone`
- Field 5 (address) → `address`
- Field 6 (City) → `city`
- Field 7 (Postal Code) → `postal_code`
- Field 8 (site challenges) → `site_challenges`
- Field 9 (services) → `services` (parsed from comma-separated string to array)
- Field 10 (project vision) → `project_vision`
- Field 11 (describe your vision - other page) → `project_vision` (fallback if Field 10 is empty)
- Field 12 (uploaded images) → `photo_urls` (if not empty)

### Service Details (JSONB)
```json
{
  "landscape_design_build": {
    "elements": ["Walkway", "Fence/gates", "Lighting"]  // from Field 13
  },
  "landscape_enhancement": {
    "elements": []  // from Field 14 if not empty
  },
  "lawn_maintenance": {
    "package": "Standard"  // from Field 15
  },
  "snow_management": {
    "property_size": ""  // from Field 16
  }
}
```

### Budgets (JSONB)
```json
{
  "landscape_design_build": 8000,     // from Field 17
  "landscape_enhancement": null,      // from Field 18
  "lawn_maintenance": 450,            // from Field 19
  "snow_management": null,            // from Field 20
  "other": null,                      // from Field 21
  "total": 8450                       // calculated sum
}
```

### Start Deadlines (JSONB)
```json
{
  "landscape_design_build": "1-3 Months",    // from Field 22
  "landscape_enhancement": "1-3 Months",     // same as design_build
  "lawn_maintenance": "2025-06-19",          // from Field 23
  "snow_management": null                    // from Field 24
}
```

### Additional Fields Set Automatically
- `form_source`: 'gravity_forms'
- `form_type`: 'initial'
- `initial_form_completed`: true
- `photos_uploaded`: true if Field 12 is not empty
- `gravity_forms_data`: stores entire raw webhook payload
- `gravity_forms_entry_date`: new Date().toISOString()

## 4. Testing the Webhook

### Test with Sample Data

You can test the webhook using curl:

```bash
curl -X POST https://furekgiahpuetskjtkaj.supabase.co/functions/v1/gravity-forms-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": {
      "1": "John",
      "2": "Doe", 
      "3": "john.doe@example.com",
      "4": "(555) 123-4567",
      "5": "123 Main St",
      "6": "Toronto",
      "7": "M5V 3A8",
      "8": "Steep slope in backyard",
      "9": "Landscape Design & Build, Lawn Maintenance",
      "10": "Create a beautiful outdoor space for entertaining",
      "12": "https://example.com/image.jpg",
      "13": "Walkway, Lighting, Fence/gates",
      "15": "Premium",
      "17": 15000,
      "19": 500,
      "22": "1-3 Months",
      "23": "2025-05-01",
      "date_created": "2025-01-15 10:30:00",
      "id": "123"
    },
    "form": {
      "id": "1",
      "title": "VIL Landscape Quote Form"
    }
  }'
```

### Expected Response

```json
{
  "success": true,
  "session_id": "uuid-here",
  "message": "Gravity Forms entry processed successfully"
}
```

## 5. Monitoring and Logs

### View Edge Function Logs

```bash
supabase functions logs gravity-forms-webhook --project-ref fkrfpgbdgdxfgzxkiuoe
```

### Check Database Records

After a successful webhook, you should see a new record in the `form_sessions` table with:
- All mapped fields populated
- `form_source` set to 'gravity_forms'
- `gravity_forms_data` containing the raw webhook payload

## 6. Error Handling

The webhook handler includes comprehensive error handling:

- **400 errors**: Invalid JSON or missing required fields
- **500 errors**: Database connection issues or mapping errors
- **CORS support**: Handles preflight OPTIONS requests

All errors are logged with detailed information for debugging.

## 7. Security Considerations

- The webhook endpoint is publicly accessible (required for Gravity Forms)
- All data is validated before database insertion
- Raw webhook data is stored for audit purposes
- Consider adding webhook signature verification for production use

## 8. Next Steps

After setting up the webhook:

1. Test with a real Gravity Forms submission
2. Verify data appears correctly in Supabase
3. Check that follow-up email sequences work with Gravity Forms leads
4. Monitor webhook performance and error rates 