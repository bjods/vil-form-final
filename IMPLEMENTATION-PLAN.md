# Supabase Migration - Implementation Plan

## 🚀 IMMEDIATE NEXT STEPS (Start Today)

### Step 1: Supabase Project Setup (30 minutes)
1. Go to [supabase.com](https://supabase.com) and create new project
2. Choose region closest to your users
3. Save project URL and anon key
4. Install Supabase: `npm install @supabase/supabase-js`

### Step 2: Environment Setup (15 minutes)
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Database Schema (45 minutes)
Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the main table
CREATE TABLE form_sessions (
  -- Core
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Contact Info
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  postal_code TEXT,
  inside_service_area BOOLEAN,
  
  -- Services & Details
  services JSONB,
  service_details JSONB,
  budgets JSONB,
  project_vision TEXT,
  success_criteria TEXT,
  timeline TEXT,
  referral_source TEXT,
  
  -- Status Flags
  initial_form_completed BOOLEAN DEFAULT FALSE,
  follow_up_email_sent BOOLEAN DEFAULT FALSE,
  follow_up_form_completed BOOLEAN DEFAULT FALSE,
  
  -- Photo Management
  upload_link_requested BOOLEAN DEFAULT FALSE,
  upload_link_sent BOOLEAN DEFAULT FALSE,
  photos_uploaded BOOLEAN DEFAULT FALSE,
  photo_urls JSONB,
  
  -- Meeting Management
  meeting_scheduled BOOLEAN DEFAULT FALSE,
  meeting_datetime TIMESTAMP,
  meeting_provider TEXT,
  meeting_confirmation_sent BOOLEAN DEFAULT FALSE,
  google_event_id TEXT,
  google_meet_link TEXT,
  
  -- Reminders
  follow_up_reminder_count INT DEFAULT 0,
  photo_reminder_count INT DEFAULT 0,
  meeting_reminder_count INT DEFAULT 0,
  last_reminder_sent TIMESTAMP,
  
  -- Meta
  form_source TEXT,
  agent_name TEXT
);

-- Create indexes
CREATE INDEX idx_sessions_email ON form_sessions(email);
CREATE INDEX idx_sessions_updated ON form_sessions(updated_at);
CREATE INDEX idx_sessions_meeting ON form_sessions(meeting_scheduled, meeting_datetime);

-- Enable RLS
ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy (allow all for now, will restrict later)
CREATE POLICY "Enable all operations for now" ON form_sessions
FOR ALL USING (true);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_form_sessions_updated_at
    BEFORE UPDATE ON form_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 4: Storage Setup (15 minutes)
1. Go to Storage in Supabase dashboard
2. Create new bucket: `property-photos`
3. Make it public
4. Set up policy:

```sql
-- Storage policy
CREATE POLICY "Anyone can upload photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'property-photos');

CREATE POLICY "Anyone can view photos" ON storage.objects
FOR SELECT USING (bucket_id = 'property-photos');
```

### Step 5: Create Supabase Client (15 minutes)
Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface FormSession {
  id: string
  created_at: string
  updated_at: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  postal_code?: string
  inside_service_area?: boolean
  services?: string[]
  service_details?: Record<string, any>
  budgets?: Record<string, number>
  project_vision?: string
  success_criteria?: string
  timeline?: string
  referral_source?: string
  initial_form_completed?: boolean
  follow_up_email_sent?: boolean
  follow_up_form_completed?: boolean
  upload_link_requested?: boolean
  upload_link_sent?: boolean
  photos_uploaded?: boolean
  photo_urls?: string[]
  meeting_scheduled?: boolean
  meeting_datetime?: string
  meeting_provider?: string
  meeting_confirmation_sent?: boolean
  google_event_id?: string
  google_meet_link?: string
  follow_up_reminder_count?: number
  photo_reminder_count?: number
  meeting_reminder_count?: number
  last_reminder_sent?: string
  form_source?: string
  agent_name?: string
}
```

## 📋 WEEK 1 PRIORITIES

### Day 1-2: Basic Connection
- [ ] Complete Steps 1-5 above
- [ ] Test database connection
- [ ] Create first test record
- [ ] Verify storage upload works

### Day 3-4: Form Store Migration
- [ ] Update `formStore.ts` to create sessions in Supabase
- [ ] Implement session loading
- [ ] Add error handling
- [ ] Test with existing form

### Day 5-7: Auto-Save Implementation
- [ ] Create auto-save hook
- [ ] Add to existing form fields
- [ ] Test performance and reliability
- [ ] Add visual feedback

## 🔧 CRITICAL FILES TO CREATE/MODIFY

### 1. `src/lib/supabase.ts` (New)
Supabase client and types

### 2. `src/hooks/useAutoSave.ts` (New)
```typescript
import { useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { debounce } from 'lodash'

export const useAutoSave = (sessionId: string) => {
  const saveRef = useRef(
    debounce(async (field: string, value: any) => {
      try {
        const { error } = await supabase
          .from('form_sessions')
          .update({ [field]: value })
          .eq('id', sessionId)
        
        if (error) throw error
        console.log(`Auto-saved ${field}`)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, 500)
  )

  return useCallback((field: string, value: any) => {
    saveRef.current(field, value)
  }, [])
}
```

### 3. `src/store/formStore.ts` (Modify)
Update to use Supabase instead of localStorage

### 4. `src/utils/uploadImage.ts` (New)
```typescript
import { supabase } from '../lib/supabase'

export const uploadImage = async (file: File, sessionId: string) => {
  try {
    const fileName = `${sessionId}/${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from('property-photos')
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('property-photos')
      .getPublicUrl(fileName)
    
    return publicUrl
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
```

## 🎯 SUCCESS CRITERIA FOR WEEK 1

- [ ] Supabase project is set up and accessible
- [ ] Database schema is created and tested
- [ ] Storage bucket is working
- [ ] Existing form can create sessions in Supabase
- [ ] Auto-save is working on at least one field
- [ ] File upload is working with Supabase Storage

## 🚨 POTENTIAL BLOCKERS

1. **Supabase Setup Issues**: Make sure you have the correct URLs and keys
2. **CORS Issues**: Ensure your domain is added to Supabase allowed origins
3. **RLS Policies**: Start with permissive policies, tighten later
4. **Auto-save Performance**: Monitor for too frequent saves

## 📞 NEED HELP?

If you run into issues:
1. Check Supabase logs in dashboard
2. Use browser dev tools to debug API calls
3. Test with simple operations first
4. Verify environment variables are loaded

---

**Start with Step 1 and work through each step methodically. Don't move to the next step until the current one is working perfectly.** 