// ==================== Supabase Client Configuration ====================
// TODO: Replace with your actual Supabase project URL and anon key
// Get these from: https://app.supabase.com/project/_/settings/api

const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client (loaded via CDN in index.html)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global auth state
let currentUser = null;

// ==================== Auth Status Management ====================

async function checkAuthStatus() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;
    updateUIForAuthState();
    return currentUser;
  } catch (error) {
    console.error('Failed to check auth status:', error);
    return null;
  }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event);
  currentUser = session?.user || null;
  updateUIForAuthState();

  // If user just signed in, migrate local data
  if (event === 'SIGNED_IN' && currentUser) {
    migrateLocalDataToSupabase();
  }
});

// Check auth status on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});

// ==================== UI Update ====================

function updateUIForAuthState() {
  const loggedInBar = document.getElementById('logged-in-bar');
  const loggedOutBar = document.getElementById('logged-out-bar');
  const userNameDisplay = document.getElementById('user-name-display');

  if (!loggedInBar || !loggedOutBar || !userNameDisplay) return;

  if (currentUser) {
    // Logged in state
    loggedInBar.style.display = 'flex';
    loggedOutBar.style.display = 'none';

    // Display user name
    const displayName = currentUser.user_metadata?.name ||
                       currentUser.email.split('@')[0];
    userNameDisplay.textContent = displayName;

  } else {
    // Logged out state
    loggedInBar.style.display = 'none';
    loggedOutBar.style.display = 'flex';
  }
}

// ==================== Data Migration ====================

async function migrateLocalDataToSupabase() {
  if (!currentUser) return;

  const localData = LocalDataManager._load();
  if (!localData.results || localData.results.length === 0) return;

  try {
    console.log(`Migrating ${localData.results.length} local games to Supabase...`);

    const sessions = localData.results.map(result => ({
      user_id: currentUser.id,
      score: result.score || 0,
      accuracy: result.accuracy || 0,
      correct_count: result.correct || 0,
      total_questions: result.total || 0,
      mode_key: result.modeKey || 'full',
      mode_name: result.mode || '전체 도전',
      selected_category: result.selectedCategory,
      selected_difficulty: 'all',
      longest_streak: result.streak || 0,
      elapsed_seconds: 0,
      completed_at: result.timestamp ? new Date(result.timestamp).toISOString() : new Date().toISOString(),
      base_score: result.totalBaseScore || 0,
      time_bonus: result.totalTimeBonus || 0,
      combo_bonus: result.totalComboBonus || 0,
      hint_bonus: result.totalHintBonus || 0,
      category_scores: result.categoryScores,
      response_times: [],
      avg_response_time: result.avgResponseTime || 0
    }));

    const { error } = await supabase.from('game_sessions').insert(sessions);

    if (error) throw error;

    console.log(`✅ Successfully migrated ${sessions.length} games to Supabase`);

  } catch (error) {
    console.error('Migration failed:', error);
    // Fallback: keep using localStorage
  }
}
