/* ============================================================
   INTERSTED — UNIFIED JAVASCRIPT  (main.js)
   ============================================================
   This single file replaces all inline <script> blocks that
   were scattered across every HTML page.

   It is structured so that each function is clearly documented
   and only runs when the relevant DOM elements exist — this
   means the same file can be safely included on every page
   without errors.

   TABLE OF CONTENTS
   -----------------
   1.  Utility: showToast()
   2.  Theme (Dark / Light Mode)
   3.  Sidebar Toggle
   4.  Notification Dropdown
   5.  Home Feed — Like Toggle
   6.  Home Feed — Comment Toggle
   7.  Home Feed — Save Post
   8.  Home Feed — Add Comment (event delegation)
   9.  Home Feed — Media Upload Preview
   10. Home Feed — Create & Publish Post
   11. Home Feed — Search / Filter Posts
   12. Friends Page — Tab Switcher
   13. Friends Page — Search Filter
   14. Friends Page — Accept / Decline Requests
   15. Messages Page — Open Chat & Send Message
   16. Messages Page — Filter Contacts
   17. Store Page — Filter Tabs
   18. Store Page — Buy Buttons
   19. Store Page — Image Preview for Listing
   20. Store Page — Publish New Item
   21. News Page — Like Toggle (shared with home)
   22. News Page — Comment logic (shared with home)
   23. News Page — Create Post (News page variant)
   24. Saved Page — Unsave Item
   25. Saved Page — Category Filter
   26. Profile Page — Tab Switcher
   27. Settings Page — Panel Navigation
   28. Settings Page — Theme Picker
   29. Report Content Page — Reason Selection
   30. Contact Us Page — Form Submission
   31. Auth Pages (Login / Register) — Theme persistence
   ============================================================ */


/* ============================================================
   1. UTILITY: showToast(msg)
   ————————————————————————————
   Displays a small toast notification at the bottom of the
   screen for 2.4 seconds. The toast slides up using a CSS
   transition on the .show class.

   @param {string} msg  — The message text to display
   ============================================================ */
function showToast(msg) {
    let t = document.getElementById('toast');
    /* If the toast element doesn't exist on this page, create it */
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        document.body.prepend(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    /* Remove .show after 2.4s, which triggers the CSS slide-down transition */
    setTimeout(() => t.classList.remove('show'), 2400);
}

/* Expose globally so inline onclick attributes on older pages still work */
window.showToast = showToast;


/* ============================================================
   2. THEME — DARK / LIGHT MODE
   ——————————————————————————————
   Reads the saved preference from localStorage on every page
   load, applies it immediately to <html data-theme="…">, and
   wires up the toggle button if it exists on the page.
   ============================================================ */
(function initTheme() {
    /* Read preference — default to 'light' if nothing is stored */
    let dark = localStorage.getItem('theme') === 'dark';

    /**
     * applyTheme()
     * Applies the current `dark` flag to the document and updates
     * any theme button icons.
     */
    function applyTheme() {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        localStorage.setItem('theme', dark ? 'dark' : 'light');

        /* Update the emoji icon on any theme toggle button */
        const btn = document.getElementById('themeBtn');
        if (btn) btn.textContent = dark ? '☀️' : '🌙';

        /* Update theme option buttons on the Settings page */
        const optLight = document.getElementById('opt-light');
        const optDark  = document.getElementById('opt-dark');
        if (optLight) optLight.classList.toggle('active', !dark);
        if (optDark)  optDark.classList.toggle('active', dark);
    }

    /* Apply theme immediately to prevent flash of wrong theme */
    applyTheme();

    /* Wire up the toggle button */
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            dark = !dark;
            applyTheme();
            /* Spin the button icon for a satisfying micro-interaction */
            themeBtn.classList.add('spinning');
            setTimeout(() => themeBtn.classList.remove('spinning'), 400);
        });
    }

    /* Expose setTheme() for the Settings page's explicit Light/Dark buttons */
    window.setTheme = function(mode) {
        dark = (mode === 'dark');
        applyTheme();
        showToast(dark ? 'Dark mode on ✓' : 'Light mode on ✓');
    };
})();


/* ============================================================
   3. SIDEBAR TOGGLE
   ——————————————————
   Toggles the .collapsed class on the sidebar element.
   State is persisted in localStorage so it survives page
   navigation (the sidebar remembers if you closed it).
   ============================================================ */
(function initSidebar() {
    const sidebar   = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');

    /* If neither element exists, this page has no sidebar — skip */
    if (!sidebar || !toggleBtn) return;

    /*
     * Sidebar defaults to CLOSED (collapsed) so the search box
     * inside it is also hidden by default.
     * Stored value of 'true' (string) means open.
     */
    let isOpen = localStorage.getItem('sidebarOpen') === 'true';

    /**
     * applySidebar()
     * Adds/removes .collapsed on the sidebar and .open on the
     * toggle button, then saves state to localStorage.
     * Also reveals the search box inside the sidebar when open
     * by toggling .sb-search-open on the sidebar element.
     */
    function applySidebar() {
        sidebar.classList.toggle('collapsed',      !isOpen);
        sidebar.classList.toggle('sb-search-open',  isOpen);
        toggleBtn.classList.toggle('open',           isOpen);
        localStorage.setItem('sidebarOpen', isOpen ? 'true' : 'false');
    }

    applySidebar();

    toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        applySidebar();
    });
})();


/* ============================================================
   4. NOTIFICATION DROPDOWN
   ——————————————————————————
   Toggles the notification panel open/closed.
   Clicking anywhere outside the panel closes it.
   ============================================================ */
(function initNotifications() {
    const notifBtn  = document.getElementById('notifBtn');
    const notifDD   = document.getElementById('notifDropdown');
    const notifDot  = document.getElementById('notifDot');
    const notifClear = document.getElementById('notifClear');

    if (!notifBtn || !notifDD) return;

    /* Toggle dropdown visibility on bell click */
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();   /* Prevent the document click handler from immediately closing it */
        notifDD.classList.toggle('open');
    });

    /* Close dropdown when clicking anywhere outside it */
    document.addEventListener('click', () => notifDD.classList.remove('open'));

    /* Stop clicks inside the dropdown from bubbling up and closing it */
    notifDD.addEventListener('click', (e) => e.stopPropagation());

    /* "Mark all read" clears the unread dot and closes the panel */
    if (notifClear) {
        notifClear.addEventListener('click', () => {
            if (notifDot) notifDot.style.display = 'none';
            notifDD.classList.remove('open');
            showToast('All notifications marked as read ✓');
        });
    }
})();


/* ============================================================
   5. HOME FEED — LIKE TOGGLE
   ——————————————————————————
   Toggles between liked (❤️) and unliked (🤍) state
   and increments/decrements the like count accordingly.

   Called via the global window scope because it is referenced
   in dynamically-created post HTML (onclick="toggleLike(this)").

   @param {HTMLElement} btn — The action button that was clicked
   ============================================================ */
window.toggleLike = function(btn) {
    const isLiked = btn.classList.toggle('liked');
    /* Extract the current number from the button text (strips all non-digits) */
    const count = parseInt(btn.textContent.replace(/\D/g, '')) || 0;
    btn.textContent = (isLiked ? '❤️ ' : '🤍 ') + (isLiked ? count + 1 : Math.max(0, count - 1));
    if (isLiked) showToast('Post liked! ❤️');
};


/* ============================================================
   6. HOME FEED — COMMENT SECTION TOGGLE
   ———————————————————————————————————————
   Shows/hides the .comments-section inside the closest .post.

   @param {HTMLElement} btn — The "💬 Comments" button
   ============================================================ */
window.toggleComments = function(btn) {
    const section = btn.closest('.post').querySelector('.comments-section');
    if (section) section.classList.toggle('open');
};


/* ============================================================
   7. HOME FEED — SAVE POST
   ——————————————————————————
   Toggles the saved state of a post and shows a toast.

   @param {HTMLElement} btn — The "🔖 Save" action button
   ============================================================ */
window.savePost = function(btn) {
    const isSaved = btn.classList.toggle('saved');
    btn.textContent = isSaved ? '🔖 Saved' : '🔖 Save';
    showToast(isSaved ? 'Post saved! 🔖' : 'Post removed from saved');
};


/* ============================================================
   8. HOME FEED — ADD COMMENT (Event Delegation)
   ———————————————————————————————————————————————
   Uses event delegation on the document so that comments can
   be added to dynamically-created posts (not just posts that
   exist at page load).
   ============================================================ */
document.addEventListener('click', function(e) {
    /* Check if the click was on a "Post" button inside an .add-comment row */
    const addCommentBtn = e.target.closest('.add-comment button');
    if (!addCommentBtn) return;

    const input   = addCommentBtn.previousElementSibling;
    const text    = input ? input.value.trim() : '';
    if (!text) return;

    const commentsSection = addCommentBtn.closest('.comments-section');
    if (!commentsSection) return;

    /* Build the new comment DOM node */
    const commentEl = document.createElement('div');
    commentEl.className = 'comment';
    commentEl.innerHTML = `
        <div class="comment-avatar" style="background:linear-gradient(135deg,orangered,#4a0a00);color:#fff">Me</div>
        <div class="comment-bubble">
            <strong>You</strong>
            <p>${escapeHtml(text)}</p>
            <div class="comment-time">Just now</div>
        </div>`;

    /* Insert the new comment above the add-comment row */
    commentsSection.insertBefore(commentEl, addCommentBtn.closest('.add-comment'));

    /* Clear the input */
    input.value = '';

    /* Update the comment count in the section title */
    const titleEl = commentsSection.querySelector('.comments-title');
    if (titleEl) {
        const total = commentsSection.querySelectorAll('.comment').length;
        titleEl.textContent = `Comments · ${total}`;
    }

    showToast('Comment posted! 💬');
});


/* ============================================================
   9. HOME FEED — MEDIA UPLOAD PREVIEW
   ——————————————————————————————————————
   Renders thumbnail previews of selected images/videos
   below the "Create Post" input.
   ============================================================ */
(function initMediaUpload() {
    const mediaInput = document.getElementById('mediaUpload');
    const preview    = document.getElementById('mediaPreview');
    if (!mediaInput || !preview) return;

    mediaInput.addEventListener('change', function() {
        Array.from(this.files).forEach(file => {
            const url  = URL.createObjectURL(file);
            const wrap = document.createElement('div');
            wrap.className = 'media-thumb-wrap';

            let media;
            if (file.type.startsWith('video/')) {
                /* Video thumbnails get a controls attribute */
                media = document.createElement('video');
                media.src      = url;
                media.controls = true;
            } else {
                media = document.createElement('img');
                media.src = url;
                media.alt = file.name;
            }

            /* Remove button overlaid on the thumbnail */
            const removeBtn = document.createElement('button');
            removeBtn.className   = 'remove-media';
            removeBtn.textContent = '✕';
            removeBtn.onclick     = () => wrap.remove();

            wrap.appendChild(media);
            wrap.appendChild(removeBtn);
            preview.appendChild(wrap);
        });

        /* Reset the input so the same file can be re-selected if removed */
        this.value = '';
    });
})();


/* ============================================================
   10. HOME FEED — CREATE & PUBLISH POST
   ————————————————————————————————————————
   Reads text + media from the create-post form, builds a new
   .post article, and prepends it to the feed.
   ============================================================ */
(function initCreatePost() {
    const postBtn   = document.getElementById('postBtn');
    const postText  = document.getElementById('postText');
    const preview   = document.getElementById('mediaPreview');
    const feed      = document.getElementById('feed');

    if (!postBtn || !feed) return;

    postBtn.addEventListener('click', () => {
        const text     = postText ? postText.value.trim() : '';
        const hasMedia = preview && preview.children.length > 0;

        /* Validation: require either text or media */
        if (!text && !hasMedia) {
            showToast('Write something or attach media first!');
            return;
        }

        /* Build media HTML from any image previews */
        let mediaHTML = '';
        if (hasMedia) {
            const imgs = Array.from(preview.querySelectorAll('img'));
            if (imgs.length) {
                mediaHTML = `<div class="post-image" style="background:#1a0400">
                    ${imgs.map(i => `<img src="${i.src}" alt="post image">`).join('')}
                </div>`;
            }
        }

        /* Create the post article element */
        const article = document.createElement('article');
        article.className = 'post';
        article.innerHTML = `
            <div class="post-header">
                <div class="p-avatar">You</div>
                <div class="post-meta">
                    <strong>You</strong>
                    <span>Just now</span>
                </div>
                <button class="post-options">⋯</button>
            </div>
            ${mediaHTML}
            <div class="post-body"><p>${escapeHtml(text)}</p></div>
            <div class="post-actions">
                <button class="action-btn" onclick="toggleLike(this)">🤍 0</button>
                <button class="action-btn" onclick="toggleComments(this)">💬 Comments (0)</button>
                <button class="action-btn" onclick="savePost(this)">🔖 Save</button>
            </div>
            <div class="comments-section">
                <div class="comments-title">Comments · 0</div>
                <div class="add-comment">
                    <div class="comment-avatar" style="background:linear-gradient(135deg,orangered,#4a0a00);color:#fff">Me</div>
                    <input type="text" placeholder="Add a comment…">
                    <button>Post</button>
                </div>
            </div>`;

        /* Prepend the new post so it appears at the top of the feed */
        feed.prepend(article);

        /* Reset the form */
        if (postText)  postText.value = '';
        if (preview)   preview.innerHTML = '';

        showToast('Post published! 🎉');
    });
})();


/* ============================================================
   11. HOME FEED — SEARCH / FILTER POSTS
   ———————————————————————————————————————
   Filters visible feed posts in real-time as the user types
   in the navbar search box.
   ============================================================ */
(function initFeedSearch() {
    const searchInput = document.getElementById('searchInput');
    const feed        = document.getElementById('feed');
    if (!searchInput || !feed) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        feed.querySelectorAll('.post').forEach(post => {
            /* Show the post if the query matches any text inside it */
            post.style.display = post.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
    });
})();


/* ============================================================
   12. FRIENDS PAGE — TAB SWITCHER
   —————————————————————————————————
   Shows the selected tab panel and hides the others.
   Also updates the .active class on the tab buttons.

   Exposed globally because tabs call: onclick="showFTab('all', this)"
   ============================================================ */
window.showFTab = function(name, clickedBtn) {
    /* Hide all tab panels */
    ['all', 'requests', 'suggestions'].forEach(tab => {
        const el = document.getElementById('ftab-' + tab);
        if (el) el.style.display = 'none';
    });

    /* Show the selected panel */
    const target = document.getElementById('ftab-' + name);
    if (target) target.style.display = '';

    /* Update active state on the buttons */
    document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');
};


/* ============================================================
   13. FRIENDS PAGE — SEARCH FILTER
   ———————————————————————————————————
   Filters friend cards based on the data-name attribute.
   ============================================================ */
window.filterFriends = function() {
    const input = document.getElementById('friendSearch');
    if (!input) return;
    const query = input.value.toLowerCase();
    document.querySelectorAll('#friendsGrid .friend-card').forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        card.style.display = name.includes(query) ? '' : 'none';
    });
};


/* ============================================================
   14. FRIENDS PAGE — ACCEPT / DECLINE REQUESTS
   ——————————————————————————————————————————————
   Accept: dims the item and shows a confirmation state.
   Decline: removes the item from the DOM.
   ============================================================ */
window.acceptRequest = function(btn) {
    const item = btn.closest('.request-item');
    if (!item) return;
    /* Dim to indicate the action was taken */
    item.style.opacity = '0.55';
    btn.textContent = '✓ Accepted';
    btn.style.background = '#2e7d32';
    /* Hide the Decline button */
    if (btn.nextElementSibling) btn.nextElementSibling.style.display = 'none';
    showToast('Friend request accepted! 🤝');
};

window.declineRequest = function(btn) {
    const item = btn.closest('.request-item');
    if (!item) return;
    /* Animate out then remove */
    item.style.transition = 'opacity 0.25s, transform 0.25s';
    item.style.opacity    = '0';
    item.style.transform  = 'translateX(20px)';
    setTimeout(() => item.remove(), 280);
    showToast('Request declined');
};


/* ============================================================
   15. MESSAGES PAGE — OPEN CHAT & SEND MESSAGE
   ——————————————————————————————————————————————
   openChat() — switches the active contact and updates the
                chat header with the contact's name/status.

   sendMsg()  — appends the user's message to the chat window
                and simulates a reply after a short delay.
   ============================================================ */

/**
 * openChat()
 * @param {HTMLElement} el       — The contact list item clicked
 * @param {string}      name     — Display name of the contact
 * @param {string}      initials — Avatar initials
 * @param {string}      bg       — CSS background value for the avatar
 * @param {boolean}     online   — Whether the contact is online
 */
window.openChat = function(el, name, initials, bg, online) {
    /* Deactivate all contacts, activate the clicked one */
    document.querySelectorAll('.contact-item').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    /* Clear unread badge */
    const badge = el.querySelector('.c-unread');
    if (badge) badge.remove();

    /* Update chat header */
    const chatName   = document.getElementById('chatName');
    const chatStatus = document.getElementById('chatStatus');
    const chatAvatar = document.getElementById('chatAvatar');

    if (chatName)   chatName.textContent   = name;
    if (chatStatus) {
        chatStatus.textContent = online ? '● Online' : '● Offline';
        chatStatus.style.color = online ? '#4caf50' : '#aaa';
    }
    if (chatAvatar) {
        chatAvatar.style.background = bg;
        chatAvatar.textContent      = initials;
    }
};

/**
 * sendMsg()
 * Reads the chat input, appends the message, then simulates
 * a reply from the contact after 1.2 seconds.
 */
window.sendMsg = function() {
    const input    = document.getElementById('msgInput');
    const messages = document.getElementById('chatMessages');
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    /* Format current time as HH:MM */
    const now  = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' +
                 now.getMinutes().toString().padStart(2, '0');

    /* Append the user's outgoing message */
    const outgoing = document.createElement('div');
    outgoing.className = 'msg-row mine';
    outgoing.innerHTML = `
        <div class="msg-avatar" style="background:linear-gradient(135deg,orangered,#4a0a00);color:#fff">Me</div>
        <div>
            <div class="msg-bubble">${escapeHtml(text)}</div>
            <div class="msg-time">${time}</div>
        </div>`;
    messages.appendChild(outgoing);
    messages.scrollTop = messages.scrollHeight;   /* Auto-scroll to bottom */
    input.value = '';

    /* Simulate a reply from the contact */
    const chatAvatar = document.getElementById('chatAvatar');
    setTimeout(() => {
        const replies = [
            'Got it! 👍',
            'Sounds great!',
            'Haha, totally! 😄',
            'Let me check and get back to you.',
            'Nice one! 🔥',
            'That\'s awesome 🙌',
            'I agree!',
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];

        const incoming = document.createElement('div');
        incoming.className = 'msg-row';
        incoming.innerHTML = `
            <div class="msg-avatar" style="background:${chatAvatar ? chatAvatar.style.background : '#888'};color:#fff">
                ${chatAvatar ? chatAvatar.textContent : '?'}
            </div>
            <div>
                <div class="msg-bubble">${reply}</div>
                <div class="msg-time">${time}</div>
            </div>`;
        messages.appendChild(incoming);
        messages.scrollTop = messages.scrollHeight;
    }, 1200);
};

/* Allow pressing Enter to send a message */
(function initMessageEnterKey() {
    const input = document.getElementById('msgInput');
    if (!input) return;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            window.sendMsg();
        }
    });
})();


/* ============================================================
   16. MESSAGES PAGE — FILTER CONTACTS
   ——————————————————————————————————————
   Real-time search filter for the contacts list.
   ============================================================ */
window.filterContacts = function() {
    const input = document.getElementById('contactSearch');
    if (!input) return;
    const query = input.value.toLowerCase();
    document.querySelectorAll('.contact-item').forEach(item => {
        const nameEl = item.querySelector('.c-name');
        const name   = nameEl ? nameEl.textContent.toLowerCase() : '';
        item.style.display = name.includes(query) ? '' : 'none';
    });
};


/* ============================================================
   17. STORE PAGE — FILTER TABS
   ——————————————————————————————
   Toggles the active state on store filter buttons.
   (Actual product filtering would require data-category
   attributes on product cards; this handles the UI state.)
   ============================================================ */
(function initStoreFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
})();


/* ============================================================
   18. STORE PAGE — BUY BUTTONS
   ——————————————————————————————
   Temporarily changes the Buy button to "✓ Added" then
   reverts it after 2 seconds.
   ============================================================ */
(function initBuyButtons() {
    /* Use event delegation on the products grid for dynamic cards too */
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-btn');
        if (!btn) return;
        btn.textContent      = '✓ Added';
        btn.style.background = '#2e7d32';
        showToast('Item added to cart! 🛍️');
        setTimeout(() => {
            btn.textContent      = 'Buy';
            btn.style.background = '';
        }, 2000);
    });
})();


/* ============================================================
   19. STORE PAGE — IMAGE PREVIEW FOR LISTING
   ——————————————————————————————————————————————
   Shows thumbnails of selected images in the "List an Item"
   form before publishing.
   ============================================================ */
(function initItemImagePreview() {
    const imgInput  = document.getElementById('itemImages');
    const imgPreview = document.getElementById('itemImgPreview');
    if (!imgInput || !imgPreview) return;

    imgInput.addEventListener('change', function() {
        Array.from(this.files).forEach(file => {
            const url  = URL.createObjectURL(file);
            const wrap = document.createElement('div');
            wrap.className = 'img-thumb-wrap';

            const img  = document.createElement('img');
            img.src    = url;
            img.alt    = file.name;

            const rm   = document.createElement('button');
            rm.className   = 'remove-thumb';
            rm.textContent = '✕';
            rm.onclick     = () => wrap.remove();

            wrap.appendChild(img);
            wrap.appendChild(rm);
            imgPreview.appendChild(wrap);
        });
        this.value = '';   /* Allow re-selecting the same file */
    });
})();


/* ============================================================
   20. STORE PAGE — PUBLISH NEW ITEM
   ——————————————————————————————————
   Validates the listing form, creates a new product card, and
   prepends it to the products grid.
   ============================================================ */
(function initListItem() {
    const listBtn = document.getElementById('listItemBtn');
    if (!listBtn) return;

    listBtn.addEventListener('click', () => {
        const nameEl     = document.getElementById('itemName');
        const descEl     = document.getElementById('itemDesc');
        const priceEl    = document.getElementById('itemPrice');
        const catEl      = document.getElementById('itemCategory');
        const imgPreview = document.getElementById('itemImgPreview');
        const grid       = document.getElementById('productsGrid');

        const name  = nameEl  ? nameEl.value.trim()         : '';
        const desc  = descEl  ? descEl.value.trim()         : '';
        const price = priceEl ? parseFloat(priceEl.value)   : 0;

        /* Validation */
        if (!name)            { showToast('Please enter an item name'); return; }
        if (!price || price <= 0) { showToast('Please enter a valid price'); return; }

        /* Grab first preview image if any */
        const thumbEl = imgPreview ? imgPreview.querySelector('img') : null;
        const imgSrc  = thumbEl ? thumbEl.src : null;

        /* Build the product card */
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrap">
                <div class="product-img" style="${imgSrc ? `background:url('${imgSrc}') center/cover no-repeat;font-size:0` : ''}">
                    ${imgSrc ? '' : '🛍️'}
                </div>
                <span class="new-badge">NEW</span>
            </div>
            <div class="product-body">
                <div class="product-name">${escapeHtml(name)}</div>
                <div class="product-desc">${escapeHtml(desc) || 'No description provided.'}</div>
                <div class="product-footer">
                    <div class="product-price">$${price.toFixed(2)}</div>
                    <button class="add-btn">Buy</button>
                </div>
            </div>`;

        if (grid) grid.prepend(card);

        /* Reset form fields */
        if (nameEl)     nameEl.value  = '';
        if (descEl)     descEl.value  = '';
        if (priceEl)    priceEl.value = '';
        if (catEl)      catEl.value   = '';
        if (imgPreview) imgPreview.innerHTML = '';

        /* Briefly confirm the action */
        listBtn.textContent      = '✓ Item Listed!';
        listBtn.style.background = '#2e7d32';
        showToast('Item listed in the Store! 🎉');
        setTimeout(() => {
            listBtn.textContent      = 'List Item';
            listBtn.style.background = '';
        }, 2500);
    });
})();


/* ============================================================
   21–22. NEWS PAGE — Likes, Comments
   ————————————————————————————————————
   The News page reuses toggleLike(), toggleComments(), and
   the add-comment event delegation defined in sections 5–8.

   The News page also has its own create-post widget
   with different element IDs (cpText, cpBtn, cpMedia, cpPreview).
   ============================================================ */
(function initNewsCreatePost() {
    const cpBtn     = document.getElementById('cpBtn');
    const cpText    = document.getElementById('cpText');
    const cpPreview = document.getElementById('cpPreview');
    const cpMedia   = document.getElementById('cpMedia');

    /* Media preview for news page create-post */
    if (cpMedia && cpPreview) {
        cpMedia.addEventListener('change', function() {
            Array.from(this.files).forEach(file => {
                const url  = URL.createObjectURL(file);
                const wrap = document.createElement('div');
                wrap.className = 'media-thumb-wrap';
                let el;
                if (file.type.startsWith('video/')) {
                    el = document.createElement('video');
                    el.src = url; el.controls = true;
                } else {
                    el = document.createElement('img');
                    el.src = url; el.alt = file.name;
                }
                const rm = document.createElement('button');
                rm.className   = 'remove-media';
                rm.textContent = '✕';
                rm.onclick = () => wrap.remove();
                wrap.appendChild(el); wrap.appendChild(rm);
                cpPreview.appendChild(wrap);
            });
            this.value = '';
        });
    }

    /* Publish button for news page */
    if (cpBtn) {
        cpBtn.addEventListener('click', () => {
            const text     = cpText ? cpText.value.trim() : '';
            const hasMedia = cpPreview && cpPreview.children.length > 0;

            if (!text && !hasMedia) {
                showToast('Write something or attach media first!');
                return;
            }

            /* Reset the form */
            if (cpText)    cpText.value = '';
            if (cpPreview) cpPreview.innerHTML = '';

            cpBtn.textContent      = '✓ Posted!';
            cpBtn.style.background = '#2e7d32';
            showToast('Post published! 🎉');
            setTimeout(() => {
                cpBtn.textContent      = 'Post';
                cpBtn.style.background = '';
            }, 2200);
        });
    }
})();


/* ============================================================
   24. SAVED PAGE — UNSAVE ITEM
   ——————————————————————————————
   Animates the saved card out and removes it from the DOM,
   then calls checkEmpty() to show an empty state if needed.

   @param {HTMLElement} btn — The "Unsave" button inside the card
   ============================================================ */
window.unsave = function(btn) {
    const card = btn.closest('.saved-card');
    if (!card) return;
    card.style.transition = 'opacity 0.28s, transform 0.28s';
    card.style.opacity    = '0';
    card.style.transform  = 'scale(0.95)';
    setTimeout(() => {
        card.remove();
        checkSavedEmpty();
        showToast('Post removed from saved');
    }, 300);
};

/**
 * checkSavedEmpty()
 * Shows the empty state message when no saved cards are visible.
 */
function checkSavedEmpty() {
    const emptyState = document.getElementById('emptyState');
    if (!emptyState) return;
    const visible = [...document.querySelectorAll('.saved-card')]
        .filter(c => c.style.display !== 'none');
    emptyState.style.display = visible.length ? 'none' : 'block';
}


/* ============================================================
   25. SAVED PAGE — CATEGORY FILTER
   ——————————————————————————————————
   Filters saved cards by the data-cat attribute.

   @param {string}      cat — Category slug ('all', 'posts', 'news', etc.)
   @param {HTMLElement} btn — The filter button that was clicked
   ============================================================ */
window.filterSaved = function(cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.saved-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
    });

    checkSavedEmpty();
};


/* ============================================================
   26. PROFILE PAGE — TAB SWITCHER
   —————————————————————————————————
   Shows the selected tab panel (Posts / Saved / About).

   @param {string}      name — Tab key ('posts', 'saved', 'about')
   @param {HTMLElement} btn  — The tab button that was clicked
   ============================================================ */
window.showTab = function(name, btn) {
    ['posts', 'saved', 'about'].forEach(tab => {
        const el = document.getElementById('tab-' + tab);
        if (el) el.style.display = 'none';
    });

    const target = document.getElementById('tab-' + name);
    if (target) target.style.display = '';

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
};


/* ============================================================
   27. SETTINGS PAGE — PANEL NAVIGATION
   ———————————————————————————————————————
   Shows the correct settings panel and highlights the nav item.

   @param {string}      id  — Panel ID suffix (e.g. 'account', 'privacy')
   @param {HTMLElement} el  — The nav item that was clicked
   ============================================================ */
window.showPanel = function(id, el) {
    /* Hide all panels */
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    /* Remove active from all nav items */
    document.querySelectorAll('.s-nav-item').forEach(n => n.classList.remove('active'));

    /* Activate selected panel and nav item */
    const panel = document.getElementById('panel-' + id);
    if (panel) panel.classList.add('active');
    if (el)    el.classList.add('active');
};

/* Save settings helper used by settings page buttons */
window.saveSettings = function(msg) {
    showToast(msg || 'Settings saved ✓');
};

/* Wire up settings toggles to show toast feedback */
(function initSettingsToggles() {
    document.querySelectorAll('.toggle input').forEach(toggle => {
        toggle.addEventListener('change', () => {
            showToast(toggle.checked ? 'Setting enabled ✓' : 'Setting disabled');
        });
    });
})();


/* ============================================================
   28. SETTINGS PAGE — THEME PICKER BUTTONS
   ——————————————————————————————————————————
   These are handled by window.setTheme() defined in section 2.
   This block just wires up click listeners to the opt-light
   and opt-dark buttons in a declarative way.
   ============================================================ */
(function initThemeOptionBtns() {
    const optLight = document.getElementById('opt-light');
    const optDark  = document.getElementById('opt-dark');
    if (optLight) optLight.addEventListener('click', () => window.setTheme('light'));
    if (optDark)  optDark.addEventListener('click',  () => window.setTheme('dark'));
})();


/* ============================================================
   29. REPORT CONTENT PAGE — REASON SELECTION
   ——————————————————————————————————————————————
   Clicking a reason option toggles the .selected class,
   enforcing single-select behaviour.
   ============================================================ */
(function initReportPage() {
    const submitBtn = document.getElementById('submitBtn');

    /* Single-select reason options */
    document.querySelectorAll('.reason-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.reason-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    if (!submitBtn) return;

    submitBtn.addEventListener('click', () => {
        const selected = document.querySelector('.reason-option.selected');
        if (!selected) {
            showToast('Please select a reason for the report');
            return;
        }

        submitBtn.textContent      = '✓ Report Submitted';
        submitBtn.style.background = '#2e7d32';
        showToast('Report submitted. Thank you for keeping the community safe.');

        /* Reset button after 3 seconds */
        setTimeout(() => {
            submitBtn.textContent      = 'Submit Report';
            submitBtn.style.background = '';
        }, 3000);
    });
})();


/* ============================================================
   30. CONTACT US PAGE — FORM SUBMISSION
   ————————————————————————————————————————
   Basic client-side validation and submission feedback.
   In a real application the form would POST to a server.
   ============================================================ */
(function initContactForm() {
    const form      = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmitBtn');
    if (!form && !submitBtn) return;

    const handleSubmit = () => {
        const nameInput    = document.getElementById('contactName');
        const emailInput   = document.getElementById('contactEmail');
        const messageInput = document.getElementById('contactMessage');

        const name    = nameInput    ? nameInput.value.trim()    : 'ok';
        const email   = emailInput   ? emailInput.value.trim()   : 'ok';
        const message = messageInput ? messageInput.value.trim() : 'ok';

        /* Simple validation */
        if (!name || !email || !message) {
            showToast('Please fill in all fields');
            return;
        }

        /* Email format sanity check */
        if (!/\S+@\S+\.\S+/.test(email)) {
            showToast('Please enter a valid email address');
            return;
        }

        /* Simulate submission */
        if (submitBtn) {
            submitBtn.textContent      = '✓ Message Sent!';
            submitBtn.style.background = '#2e7d32';
        }
        showToast('Message sent! We\'ll get back to you soon 📬');

        /* Reset form */
        setTimeout(() => {
            if (nameInput)    nameInput.value    = '';
            if (emailInput)   emailInput.value   = '';
            if (messageInput) messageInput.value = '';
            if (submitBtn) {
                submitBtn.textContent      = 'Send Message';
                submitBtn.style.background = '';
            }
        }, 2500);
    };

    /* Support both a <button id="contactSubmitBtn"> and a <form> submit event */
    if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
    if (form)      form.addEventListener('submit', (e) => { e.preventDefault(); handleSubmit(); });
})();


/* ============================================================
   31. AUTH PAGES — THEME PERSISTENCE
   ————————————————————————————————————
   On the Login and Register pages there is no sidebar or
   standard nav — but we still want dark mode to persist.
   Theme is already applied by the initTheme() IIFE above
   (section 2), so no extra code is needed here.

   This comment block is intentionally kept as documentation.
   ============================================================ */


/* ============================================================
   HELPER FUNCTIONS
   ——————————————————
   Small utilities used internally by functions above.
   ============================================================ */

/**
 * escapeHtml(str)
 * Converts special HTML characters to their entity equivalents
 * to prevent XSS when injecting user input into innerHTML.
 *
 * @param  {string} str — Raw user input
 * @return {string}     — Safe HTML string
 */
function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, ch => map[ch]);
}
