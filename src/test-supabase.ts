// Test file to verify Supabase connection
// Run this to test the database setup

import { supabase, createSession, getSession, getAllSessions } from './lib/supabase'

export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...')
    
    // Test 1: Basic connection
    const { data, error } = await supabase.from('form_sessions').select('count').single()
    if (error) throw error
    console.log('✅ Database connection successful')
    
    // Test 2: Create a test session
    const testSession = await createSession({
      first_name: 'Test',
      last_name: 'Connection',
      email: 'test-connection@example.com',
      form_source: 'test',
      services: ['lawn-maintenance'],
      budgets: { 'lawn-maintenance': 300 }
    })
    console.log('✅ Session creation successful:', testSession.id)
    
    // Test 3: Retrieve the session
    const retrievedSession = await getSession(testSession.id)
    console.log('✅ Session retrieval successful:', retrievedSession?.email)
    
    // Test 4: Get all sessions
    const allSessions = await getAllSessions()
    console.log('✅ All sessions retrieved:', allSessions.length, 'total sessions')
    
    // Test 5: Storage bucket test
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) throw bucketError
    const photoBucket = buckets.find(b => b.name === 'property-photos')
    console.log('✅ Storage bucket exists:', !!photoBucket)
    
    console.log('🎉 All tests passed! Supabase is ready to use.')
    return true
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error)
    return false
  }
}

// Uncomment to run the test
// testSupabaseConnection() 