document.addEventListener('DOMContentLoaded', function() {
    // Shopping Cart State
    let cart = [];
    let cartTotal = 0;

    // Security: Input sanitization function
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Security: Safe HTML creation function
    function createSafeElement(tag, content, className = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        element.textContent = content;
        return element;
    }

    // DOM Elements
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.querySelector('.cart-items');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCount = document.querySelector('.cart-count');

    // Mood Cards
    const moodCards = document.querySelectorAll('.mood-card');
    const productCards = document.querySelectorAll('.product-card');

    // Category Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');

    // Initialize
    initializeCart();
    initializeMoodFiltering();
    initializeCategoryTabs();
    initializeSmoothScrolling();

    // Cart Functionality
    function initializeCart() {
        // Load cart from localStorage with error handling
        try {
            const savedCart = localStorage.getItem('gentleSoulsCart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                // Validate cart structure
                if (Array.isArray(parsedCart)) {
                    cart = parsedCart;
                    updateCartDisplay();
                }
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            localStorage.removeItem('gentleSoulsCart');
        }

        // Cart icon click
        cartIcon.addEventListener('click', function() {
            cartModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        // Close cart
        closeCart.addEventListener('click', function() {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Close cart when clicking outside
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const productName = this.getAttribute('data-name');
                const productPrice = parseFloat(this.getAttribute('data-price'));
                
                // Validate inputs
                if (!productId || !productName || isNaN(productPrice)) {
                    console.error('Invalid product data');
                    return;
                }
                
                addToCart(productId, productName, productPrice);
                showNotification(`Added ${sanitizeInput(productName)} to your comfort cart! 💕`);
            });
        });

        // Checkout button
        document.querySelector('.checkout-btn').addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty. Add some comfort items first! 🌸');
                return;
            }
            showNotification('Thank you for your order! We\'ll process it with care. 💕');
            // In a real app, this would redirect to a checkout page
        });
    }

    function addToCart(id, name, price) {
        // Validate inputs
        if (!id || !name || typeof price !== 'number' || price <= 0) {
            console.error('Invalid cart item data');
            return;
        }

        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        updateCart();
    }

    function updateCart() {
        // Save to localStorage with error handling
        try {
            localStorage.setItem('gentleSoulsCart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
        
        // Update display
        updateCartDisplay();
    }

    function updateCartDisplay() {
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Update cart items - using safe DOM manipulation instead of innerHTML
        cartItems.innerHTML = '';
        cartTotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            cartTotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            // Create elements safely
            const itemInfo = document.createElement('div');
            itemInfo.className = 'cart-item-info';
            
            const itemName = createSafeElement('h4', item.name);
            const itemQuantity = createSafeElement('p', `Quantity: ${item.quantity}`);
            
            itemInfo.appendChild(itemName);
            itemInfo.appendChild(itemQuantity);
            
            const itemPrice = document.createElement('div');
            itemPrice.className = 'cart-item-price';
            itemPrice.textContent = `$${itemTotal.toFixed(2)}`;
            
            cartItem.appendChild(itemInfo);
            cartItem.appendChild(itemPrice);
            cartItems.appendChild(cartItem);
        });
        
        cartTotalElement.textContent = cartTotal.toFixed(2);
    }

    // Mood-based Filtering
    function initializeMoodFiltering() {
        moodCards.forEach(card => {
            card.addEventListener('click', function() {
                const mood = this.getAttribute('data-mood');
                filterProductsByMood(mood);
                
                // Visual feedback
                moodCards.forEach(c => c.style.transform = 'scale(1)');
                this.style.transform = 'scale(1.05)';
                
                // Scroll to products
                document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    function filterProductsByMood(mood) {
        productCards.forEach(card => {
            const cardMoods = card.getAttribute('data-mood').split(' ');
            
            if (mood === 'all' || cardMoods.includes(mood)) {
                card.style.display = 'block';
                card.classList.remove('hidden');
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });
    }

    // Category Tabs
    function initializeCategoryTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter products
                filterProductsByCategory(category);
            });
        });
    }

    function filterProductsByCategory(category) {
        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                card.classList.remove('hidden');
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });
    }

    // Smooth Scrolling
    function initializeSmoothScrolling() {
        // Navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Global scroll function for buttons
    window.scrollToSection = function(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Resource Buttons
    document.querySelectorAll('.resource-btn').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent;
            showNotification(`Opening ${action.toLowerCase()}... 💫`);
            // In a real app, this would open the actual resource
        });
    });

    // Notification System
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFB3BA, #FFB3F7);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Product Card Interactions
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Mood Card Interactions
    moodCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = '';
            }
        });
    });

    // Parallax Effect for Hero
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const rate = scrolled * -0.5;
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Loading Animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // Keyboard Navigation
    document.addEventListener('keydown', function(e) {
        // Escape key to close cart
        if (e.key === 'Escape' && cartModal.style.display === 'block') {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // 'C' key to open cart
        if (e.key === 'c' || e.key === 'C') {
            cartModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.product-card, .mood-card, .resource-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Welcome message for first-time visitors
    if (!localStorage.getItem('gentleSoulsVisited')) {
        setTimeout(() => {
            showNotification('Welcome, gentle soul! Take your time exploring. 💕');
            localStorage.setItem('gentleSoulsVisited', 'true');
        }, 2000);
    }

    // Community Features
    initializeCommunityFeatures();
});

// Community Functions (Global scope for onclick handlers)
function openAnonymousPost() {
    const modal = createModal('Share Anonymously', `
        <div class="anonymous-form">
            <textarea id="anonymousContent" placeholder="Share your thoughts, experiences, or ask for support... (No pressure to share if you're not comfortable)" rows="6" maxlength="1000"></textarea>
            <div class="form-actions">
                <button onclick="submitAnonymousPost()" class="submit-btn">Share Gently</button>
                <button onclick="closeModal()" class="cancel-btn">Maybe Later</button>
            </div>
        </div>
    `);
    document.body.appendChild(modal);
}

function openDiscussions() {
    const topics = [
        { title: "Setting Boundaries", participants: 156, lastActive: "2 hours ago" },
        { title: "Recharging After Social Events", participants: 89, lastActive: "1 day ago" },
        { title: "Finding Quiet Spaces in Public", participants: 203, lastActive: "3 hours ago" },
        { title: "Introvert-Friendly Hobbies", participants: 127, lastActive: "5 hours ago" },
        { title: "Dealing with Social Expectations", participants: 178, lastActive: "1 day ago" }
    ];

    const topicsHTML = topics.map(topic => `
        <div class="discussion-topic">
            <h4>${topic.title}</h4>
            <p>${topic.participants} gentle souls participating</p>
            <span class="last-active">Last active: ${topic.lastActive}</span>
            <button onclick="joinDiscussion('${topic.title}')" class="join-btn">Join Discussion</button>
        </div>
    `).join('');

    const modal = createModal('Gentle Discussions', `
        <div class="discussions-list">
            ${topicsHTML}
        </div>
    `);
    document.body.appendChild(modal);
}

function openSupportGroups() {
    const groups = [
        { name: "Social Anxiety Support", members: 45, meeting: "Weekly, Sundays 2 PM" },
        { name: "Introvert Writers", members: 32, meeting: "Bi-weekly, Tuesdays 7 PM" },
        { name: "Quiet Book Club", members: 28, meeting: "Monthly, First Saturday 3 PM" },
        { name: "Energy Management", members: 51, meeting: "Weekly, Wednesdays 6 PM" }
    ];

    const groupsHTML = groups.map(group => `
        <div class="support-group">
            <h4>${group.name}</h4>
            <p>${group.members} members</p>
            <p>Meets: ${group.meeting}</p>
            <button onclick="joinSupportGroup('${group.name}')" class="join-btn">Request to Join</button>
        </div>
    `).join('');

    const modal = createModal('Support Groups', `
        <div class="support-groups-list">
            ${groupsHTML}
        </div>
    `);
    document.body.appendChild(modal);
}

function openWisdomLibrary() {
    const wisdom = [
        { quote: "Your quiet strength is not a weakness. It's a superpower.", author: "Anonymous Soul" },
        { quote: "It's okay to need time alone. It's how you recharge your beautiful mind.", author: "Gentle Dreamer" },
        { quote: "You don't have to be loud to be heard. Your presence speaks volumes.", author: "Quiet Observer" },
        { quote: "Setting boundaries is an act of self-love, not selfishness.", author: "Boundary Setter" },
        { quote: "Your introversion is not something to fix. It's something to embrace.", author: "Self-Acceptance Advocate" }
    ];

    const wisdomHTML = wisdom.map(item => `
        <div class="wisdom-item">
            <blockquote>"${item.quote}"</blockquote>
            <cite>- ${item.author}</cite>
        </div>
    `).join('');

    const modal = createModal('Wisdom Library', `
        <div class="wisdom-collection">
            ${wisdomHTML}
            <button onclick="addWisdom()" class="add-wisdom-btn">Share Your Wisdom</button>
        </div>
    `);
    document.body.appendChild(modal);
}

function likePost(button) {
    const likeCount = button.querySelector('span');
    const currentLikes = parseInt(likeCount.textContent);
    
    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        likeCount.textContent = currentLikes - 1;
        showNotification('Like removed 💕');
    } else {
        button.classList.add('liked');
        likeCount.textContent = currentLikes + 1;
        showNotification('Sending gentle support 💕');
    }
}

function showSupport(button) {
    const supportText = button.querySelector('span');
    if (supportText.textContent === 'Support') {
        supportText.textContent = 'Supported';
        button.style.background = 'rgba(255, 179, 186, 0.2)';
        button.style.borderColor = '#FFB3BA';
        button.style.color = '#6B5B95';
        showNotification('Support sent with love 🤗');
    } else {
        supportText.textContent = 'Support';
        button.style.background = 'none';
        button.style.borderColor = '#E0E0E0';
        button.style.color = '#8B7D9B';
    }
}

function loadMorePosts() {
    const feedContainer = document.querySelector('.feed-container');
    const newPosts = [
        {
            author: "Mindful Wanderer",
            time: "3 days ago",
            content: "Just discovered that taking a 10-minute walk in nature does wonders for my social battery. Anyone else find solace in quiet outdoor moments?"
        },
        {
            author: "Gentle Listener",
            time: "4 days ago",
            content: "Remember: You don't owe anyone your energy. It's perfectly okay to say 'I need some time to think about that' when you're not ready to respond."
        }
    ];

    newPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'community-post';
        postElement.innerHTML = `
            <div class="post-header">
                <span class="post-author">${post.author}</span>
                <span class="post-time">${post.time}</span>
            </div>
            <p class="post-content">"${post.content}"</p>
            <div class="post-actions">
                <button class="post-action" onclick="likePost(this)">💕 <span>0</span></button>
                <button class="post-action" onclick="showSupport(this)">🤗 <span>Support</span></button>
            </div>
        `;
        feedContainer.appendChild(postElement);
    });

    showNotification('More gentle posts loaded 💕');
}

// Helper Functions
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button onclick="closeModal()" class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    return modal;
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function submitAnonymousPost() {
    const contentElement = document.getElementById('anonymousContent');
    if (!contentElement) return;
    
    const content = contentElement.value.trim();
    
    // Security: Validate and sanitize input
    if (!content) {
        showNotification('No pressure to share if you\'re not ready 💕');
        return;
    }
    
    // Security: Check content length
    if (content.length > 1000) {
        showNotification('Your message is too long. Please keep it under 1000 characters 💕');
        return;
    }
    
    // Security: Basic content validation (no script tags, etc.)
    if (content.toLowerCase().includes('<script') || content.toLowerCase().includes('javascript:')) {
        showNotification('Please keep your message safe and appropriate 💕');
        return;
    }
    
    showNotification('Your anonymous post has been shared with the community 💕');
    closeModal();
    // In a real app, this would save to a database with proper sanitization
}

function joinDiscussion(topic) {
    showNotification(`Joining "${topic}" discussion. Take your time to observe first 💕`);
    closeModal();
}

function joinSupportGroup(group) {
    showNotification(`Request sent to join "${group}". We\'ll contact you gently 💕`);
    closeModal();
}

function addWisdom() {
    showNotification('Thank you for sharing your wisdom with the community 💕');
    closeModal();
}

// Initialize Community Features
function initializeCommunityFeatures() {
    // Add modal styles dynamically
    const modalStyles = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background: white;
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #F0F0F0;
        }
        
        .modal-header h3 {
            color: #6B5B95;
            margin: 0;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #8B7D9B;
            transition: color 0.3s ease;
        }
        
        .close-modal:hover {
            color: #6B5B95;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .anonymous-form textarea {
            width: 100%;
            border: 2px solid #F0F0F0;
            border-radius: 10px;
            padding: 1rem;
            font-family: inherit;
            resize: vertical;
            transition: border-color 0.3s ease;
        }
        
        .anonymous-form textarea:focus {
            outline: none;
            border-color: #FFB3BA;
        }
        
        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .submit-btn, .cancel-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 20px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .submit-btn {
            background: linear-gradient(135deg, #FFB3BA, #FFB3F7);
            color: white;
        }
        
        .cancel-btn {
            background: #F0F0F0;
            color: #8B7D9B;
        }
        
        .submit-btn:hover, .cancel-btn:hover {
            transform: translateY(-2px);
        }
        
        .discussion-topic, .support-group, .wisdom-item {
            background: #F8F9FF;
            padding: 1.5rem;
            border-radius: 15px;
            margin-bottom: 1rem;
            border-left: 4px solid #BAE1FF;
        }
        
        .discussion-topic h4, .support-group h4 {
            color: #6B5B95;
            margin-bottom: 0.5rem;
        }
        
        .discussion-topic p, .support-group p {
            color: #8B7D9B;
            margin-bottom: 0.5rem;
        }
        
        .last-active {
            color: #8B7D9B;
            font-size: 0.9rem;
        }
        
        .join-btn {
            background: linear-gradient(135deg, #BAE1FF, #B3E5FF);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 0.5rem;
        }
        
        .join-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(186, 225, 255, 0.4);
        }
        
        .wisdom-item blockquote {
            font-style: italic;
            color: #4A4A4A;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .wisdom-item cite {
            color: #8B7D9B;
            font-size: 0.9rem;
        }
        
        .add-wisdom-btn {
            background: linear-gradient(135deg, #BAFFC9, #FFFFBA);
            color: #4A4A4A;
            border: none;
            padding: 12px 24px;
            border-radius: 20px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
        }
        
        .add-wisdom-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(186, 255, 201, 0.4);
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
}
