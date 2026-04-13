// ============================================
// தேர்வு வெற்றி — Shared Data Layer v3
// Storage: JSONBin.io (no CORS issues)
// ============================================

const BIN_ID  = '69dc9e58aaba882197f2816d';
const API_KEY = '$2a$10$/Ohov5o0YEoMvDi0TQwjsu6VP51Fk1QO/Zsh6rrHhj5ZCDcz.Xody';
const BIN_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID;

// ---- READ all articles ----
async function getAllArticles() {
  try {
    const res = await fetch(BIN_URL + '/latest', {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    return data.record.articles || [];
  } catch(e) {
    console.error('Failed to load articles:', e);
    return [];
  }
}

// ---- READ one article by id ----
async function getArticleById(id) {
  try {
    const articles = await getAllArticles();
    return articles.find(a => a.id === id) || null;
  } catch(e) {
    console.error('Failed to load article:', e);
    return null;
  }
}

// ---- ADD article ----
async function addArticle(article) {
  try {
    article.id        = new Date().getTime().toString();
    article.createdAt = new Date().toISOString();

    const articles = await getAllArticles();
    articles.push(article);

    await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify({ articles })
    });

    return { success: true, id: article.id };
  } catch(e) {
    console.error('Failed to add article:', e);
    return { success: false };
  }
}

// ---- DELETE article ----
async function deleteArticle(id) {
  try {
    const articles = await getAllArticles();
    const updated   = articles.filter(a => a.id !== id);

    await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify({ articles: updated })
    });

    return { success: true };
  } catch(e) {
    console.error('Failed to delete article:', e);
    return { success: false };
  }
}

// ---- HELPERS ----

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['ஜன','பிப்','மார்','ஏப்','மே','ஜூன்','ஜூலை','ஆக','செப்','அக்','நவ','டிச'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

const THUMB_COLORS = [
  ['#FDF0E8','#FAD9B8'], ['#EBF0FF','#C8D8FF'],
  ['#E8F5EE','#B8E8CB'], ['#FDF0E8','#F5C8A0'],
  ['#EEEDFE','#C8C4F4'], ['#FBF8F3','#F0EBE0'],
];

const CATEGORY_META = {
  'அரசியல் & நிர்வாகம்':      { icon: '🏛️' },
  'அறிவியல் & தொழில்நுட்பம்': { icon: '🔬' },
  'சுற்றுச்சூழல்':             { icon: '🌍' },
  'பொருளாதாரம்':               { icon: '💰' },
  'தமிழ்நாடு':                 { icon: '🗺️' },
  'வரலாறு':                    { icon: '📜' },
  'விளையாட்டு':                { icon: '🏆' },
  'சர்வதேசம்':                 { icon: '🌐' },
};

// ---- SHARED NAV ----

function renderNav(activePage) {
  return `
  <nav>
    <a href="index.html" class="logo">
      <div class="logo-icon">📚</div>
      <div>
        <div class="logo-text">தேர்வு வெற்றி</div>
        <div class="logo-sub">TNPSC Current Affairs</div>
      </div>
    </a>
    <ul class="nav-links">
      <li><a href="index.html" ${activePage==='home'?'class="active"':''}>இன்றைய செய்தி</a></li>
      <li><a href="index.html#categories">தலைப்புகள்</a></li>
      <li><a href="admin.html" style="color:var(--ink-light);font-size:12px;">⚙ Admin</a></li>
      <li><a href="#mock" class="nav-cta">Mock Test — ₹299</a></li>
    </ul>
    <button class="hamburger" onclick="toggleMobileNav()" aria-label="menu">☰</button>
  </nav>
  <div class="mobile-nav" id="mobileNav">
    <a href="index.html">இன்றைய செய்தி</a>
    <a href="index.html#categories">தலைப்புகள்</a>
    <a href="admin.html">⚙ Admin</a>
    <a href="#mock" class="nav-cta-mobile">Mock Test — ₹299</a>
  </div>`;
}

function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ---- LOADING / ERROR ----

function showLoading(containerId, message) {
  document.getElementById(containerId).innerHTML = `
    <div style="text-align:center; padding:60px 20px; color:var(--ink-light);">
      <div style="font-size:28px; margin-bottom:12px;">⏳</div>
      <div style="font-size:14px;">${message || 'படிக்கிறது...'}</div>
    </div>`;
}

function showError(containerId, message) {
  document.getElementById(containerId).innerHTML = `
    <div style="text-align:center; padding:60px 20px; color:var(--ink-light);">
      <div style="font-size:28px; margin-bottom:12px;">⚠️</div>
      <div style="font-size:14px; color:#A32D2D;">${message}</div>
      <button onclick="location.reload()" class="btn-secondary" style="margin-top:16px; font-size:13px;">மீண்டும் முயற்சிக்கவும்</button>
    </div>`;
}
