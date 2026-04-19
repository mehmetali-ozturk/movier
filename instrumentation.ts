export async function register() {

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();


    // to change all is_likes=true to false for new start
    await supabase
      .from('movies')
      .update({ is_liked: false })
      .eq('is_liked', true);


    }
  }
