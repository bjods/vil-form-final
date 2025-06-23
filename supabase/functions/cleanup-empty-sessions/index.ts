import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  try {
    console.log('🧹 Starting cleanup of empty form sessions...');
    
    // Delete sessions that have no personal information (required fields)
    // These are sessions where:
    // - first_name is null or empty
    // - email is null or empty
    // - phone is null or empty
    // - created more than 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // First, get the sessions to delete (for logging)
    const { data: sessionsToDelete, error: selectError } = await supabase
      .from('form_sessions')
      .select('id, created_at, form_source')
      .or('first_name.is.null,first_name.eq.')
      .or('email.is.null,email.eq.')
      .or('phone.is.null,phone.eq.')
      .lt('created_at', twentyFourHoursAgo.toISOString());
    
    if (selectError) {
      console.error('❌ Error fetching sessions to delete:', selectError);
      throw selectError;
    }
    
    const deleteCount = sessionsToDelete?.length || 0;
    console.log(`📊 Found ${deleteCount} empty sessions to delete`);
    
    if (deleteCount > 0) {
      // Log details of sessions being deleted
      sessionsToDelete?.forEach(session => {
        console.log(`  - Session ${session.id} created at ${session.created_at} from ${session.form_source || 'unknown'}`);
      });
      
      // Delete the empty sessions
      const { error: deleteError } = await supabase
        .from('form_sessions')
        .delete()
        .or('first_name.is.null,first_name.eq.')
        .or('email.is.null,email.eq.')
        .or('phone.is.null,phone.eq.')
        .lt('created_at', twentyFourHoursAgo.toISOString());
      
      if (deleteError) {
        console.error('❌ Error deleting sessions:', deleteError);
        throw deleteError;
      }
      
      console.log(`✅ Successfully deleted ${deleteCount} empty sessions`);
    } else {
      console.log('✅ No empty sessions to delete');
    }
    
    // Also cleanup orphaned photos (photos in sessions that no longer exist)
    console.log('🖼️ Checking for orphaned photos...');
    
    // Get all sessions with photos
    const { data: sessionsWithPhotos, error: photoError } = await supabase
      .from('form_sessions')
      .select('id, photo_urls')
      .not('photo_urls', 'is', null);
    
    if (!photoError && sessionsWithPhotos) {
      const validSessionIds = new Set(sessionsWithPhotos.map(s => s.id));
      
      // List all folders in the property-photos bucket
      const { data: files, error: listError } = await supabase.storage
        .from('property-photos')
        .list();
      
      if (!listError && files) {
        // Group files by session ID (folder name)
        const sessionFolders = new Set<string>();
        files.forEach(file => {
          const parts = file.name.split('/');
          if (parts.length > 1) {
            sessionFolders.add(parts[0]);
          }
        });
        
        // Find orphaned folders
        const orphanedFolders = Array.from(sessionFolders).filter(
          folderId => !validSessionIds.has(folderId) && folderId !== 'no-session'
        );
        
        console.log(`📊 Found ${orphanedFolders.length} orphaned photo folders`);
        
        // Note: Actual deletion of storage files would require listing and deleting
        // each file individually, which is more complex. For now, we'll just log.
        if (orphanedFolders.length > 0) {
          console.log('⚠️  Orphaned folders found (manual cleanup may be needed):', orphanedFolders);
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: deleteCount,
        message: `Deleted ${deleteCount} empty sessions`
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});