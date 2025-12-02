(function () {
  var BASE = (window && window.AUTH_BASE) ? window.AUTH_BASE : 'http://localhost:3001'; // auth-server base (overridable)

  function el(sel) { return document.querySelector(sel); }
  function els(sel) { return Array.from(document.querySelectorAll(sel)); }

  function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderUser(user) {
    var area = document.getElementById('auth-area');
    var mobileArea = document.getElementById('mobile-auth-area');
    function anonHtml(){ return '<a href="javascript:;" id="openAuth">登录 / 注册</a>'; }
    if (area) area.innerHTML = user ? ('<span>'+ escapeHtml(user.username) +'</span>' + (user.role==='admin'? ('&nbsp;|&nbsp;<a href="'+BASE+'/admin" target="_blank">管理</a>') : '') + '&nbsp;|&nbsp;<a href="javascript:;" id="logoutBtn">登出</a>') : anonHtml();
    if (mobileArea) mobileArea.innerHTML = user ? ('<a href="javascript:;">'+escapeHtml(user.username)+'</a>') : anonHtml();
    if (!user) {
      var opener = document.getElementById('openAuth');
      if (opener) opener.addEventListener('click', openModal);
    } else {
      var out = document.getElementById('logoutBtn');
      if (out) out.addEventListener('click', logout);
    }
  }

  // Modal logic
  var mode = 'login'; // or 'register'
  function openModal() {
    mode = 'login';
    el('#authTitle').textContent = '登录';
    el('#auth-username').value = '';
    el('#auth-password').value = '';
    el('#toggleAuthMode').textContent = '切换到注册';
    el('#authModalBackdrop').style.display = 'flex';
  }
  function closeModal() { el('#authModalBackdrop').style.display = 'none'; }

  function submitAuth() {
    var username = el('#auth-username').value.trim();
    var password = el('#auth-password').value.trim();
    if (!username || !password) { alert('请输入用户名和密码'); return; }
    var url = mode === 'login' ? '/api/login' : '/api/register';
    fetch(BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ username: username, password: password }) })
      .then(function (r) {
        if (r.status === 409) throw new Error('用户已存在');
        return r.json();
      }).then(function (data) {
        if (data.ok) {
          location.reload();
        } else {
          alert(data.message || '操作失败');
        }
      }).catch(function (e) { alert(e.message || '网络错误'); });
  }

  function logout() {
    fetch(BASE + '/api/logout', { method: 'POST', credentials: 'include' }).then(function () { location.reload(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // wire modal buttons
    var submit = el('#authSubmit');
    var cancel = el('#authCancel');
    var toggle = el('#toggleAuthMode');
    if (submit) submit.addEventListener('click', submitAuth);
    if (cancel) cancel.addEventListener('click', function (e) { e.preventDefault(); closeModal(); });
    if (toggle) toggle.addEventListener('click', function (e) { e.preventDefault(); mode = (mode==='login'?'register':'login'); el('#authTitle').textContent = mode==='login'?'登录':'注册'; toggle.textContent = mode==='login'?'切换到注册':'切换到登录'; });

    // fetch current user
    fetch(BASE + '/api/me', { credentials: 'include' }).then(r => r.json()).then(function (data) {
      renderUser(data.user);
    }).catch(function () { renderUser(null); });
  });

})();