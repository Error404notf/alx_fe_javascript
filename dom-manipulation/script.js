// ============================================
// TASK 0: INITIAL DATA AND SETUP
// ============================================

// Initial quotes array with sample data
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Motivation" }
];

// Variable to store last selected category filter
let lastSelectedCategory = 'all';


// ============================================
// INITIALIZATION FUNCTION
// ============================================

/**
 * Initialize the application
 * Loads data, sets up event listeners, and starts sync
 */
function initializeApp() {
  // TASK 1: Load quotes from local storage
  loadQuotes();
  
  // TASK 2: Load last selected filter from local storage
  lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';
  
  // TASK 2: Populate categories dropdown
  populateCategories();
  
  // Set the filter to last selected
  document.getElementById('categoryFilter').value = lastSelectedCategory;
  
  // Show initial quote
  filterQuotes();
  
  // Setup event listeners
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
  
  // TASK 3: Start periodic server sync (every 30 seconds)
  setInterval(syncQuotes, 30000);
  
  // TASK 3: Initial sync on load
  syncQuotes();
}


// ============================================
// TASK 1: WEB STORAGE FUNCTIONS
// ============================================

/**
 * Load quotes from local storage
 */
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

/**
 * Save quotes to local storage
 */
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}


// ============================================
// TASK 0: DISPLAY QUOTE FUNCTIONS
// ============================================

/**
 * Show a random quote from filtered quotes
 */
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = 
      '<div class="quote-text">No quotes available for this category.</div>';
    return;
  }
  
  // Get random quote
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  
  // TASK 1: Store in session storage (last viewed quote)
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
  
  displayQuote(quote);
}

/**
 * Display a quote in the DOM
 */
function displayQuote(quote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `
    <div class="quote-text">"${quote.text}"</div>
    <div class="quote-category">- ${quote.category}</div>
  `;
}


// ============================================
// TASK 0: ADD QUOTE FUNCTION
// ============================================

/**
 * Add a new quote to the collection
 */
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  // Validation
  if (newQuoteText === '' || newQuoteCategory === '') {
    alert('Please enter both quote text and category!');
    return;
  }
  
  // Create new quote object
  const newQuote = {
    text: newQuoteText,
    category: newQuoteCategory
  };
  
  // Add to quotes array
  quotes.push(newQuote);
  
  // TASK 1: Save to local storage
  saveQuotes();
  
  // TASK 2: Update categories dropdown
  populateCategories();
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Show notification
  showNotification('Quote added successfully!');
  
  // Display the new quote if it matches current filter
  const currentFilter = document.getElementById('categoryFilter').value;
  if (currentFilter === 'all' || currentFilter === newQuoteCategory) {
    displayQuote(newQuote);
  }
}


// ============================================
// TASK 2: CATEGORY FILTERING FUNCTIONS
// ============================================

/**
 * Populate categories dropdown dynamically
 */
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const currentValue = categoryFilter.value;
  
  // Extract unique categories from quotes
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add each unique category to dropdown
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore previous selection if it still exists
  if (Array.from(categoryFilter.options).some(opt => opt.value === currentValue)) {
    categoryFilter.value = currentValue;
  }
}

/**
 * Filter quotes based on selected category
 */
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  
  // TASK 2: Save filter preference to local storage
  localStorage.setItem('lastSelectedCategory', selectedCategory);
  lastSelectedCategory = selectedCategory;
  
  // Show a random quote from the filtered category
  showRandomQuote();
}

/**
 * Get filtered quotes based on current selection
 */
function getFilteredQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  
  if (selectedCategory === 'all') {
    return quotes;
  }
  
  return quotes.filter(quote => quote.category === selectedCategory);
}


// ============================================
// TASK 1: JSON IMPORT/EXPORT FUNCTIONS
// ============================================

/**
 * Export quotes to JSON file
 */
function exportToJsonFile() {
  // Convert quotes array to JSON string
  const dataStr = JSON.stringify(quotes, null, 2);
  
  // Create a Blob from the JSON string
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  // Create a download URL
  const url = URL.createObjectURL(dataBlob);
  
  // Create and trigger download link
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'quotes.json';
  downloadLink.click();
  
  // Clean up
  URL.revokeObjectURL(url);
  showNotification('Quotes exported successfully!');
}

/**
 * Import quotes from JSON file
 */
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  
  fileReader.onload = function(event) {
    try {
      // Parse JSON from file
      const importedQuotes = JSON.parse(event.target.result);
      
      // Validate that it's an array
      if (!Array.isArray(importedQuotes)) {
        alert('Invalid JSON format. Expected an array of quotes.');
        return;
      }
      
      // Add imported quotes to existing quotes
      quotes.push(...importedQuotes);
      
      // Save to local storage
      saveQuotes();
      
      // Update categories dropdown
      populateCategories();
      
      // Reset file input
      document.getElementById('importFile').value = '';
      
      showNotification('Quotes imported successfully!');
      
      // Show a quote from imported data
      filterQuotes();
    } catch (error) {
      alert('Error importing file: ' + error.message);
    }
  };
  
  // Read the file as text
  fileReader.readAsText(event.target.files[0]);
}


// ============================================
// TASK 3: SERVER SYNC FUNCTIONS
// ============================================

/**
 * Sync quotes with server (using JSONPlaceholder as mock API)
 */
async function syncQuotes() {
  try {
    // Fetch data from mock server
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverData = await response.json();
    
    // Transform server data to quote format (simulation)
    // In a real app, the server would return actual quotes
    const serverQuotes = serverData.slice(0, 3).map(post => ({
      text: post.title,
      category: "Server"
    }));
    
    // TASK 3: Check for new quotes from server and add them
    let newQuotesAdded = false;
    serverQuotes.forEach(serverQuote => {
      // Check if quote already exists
      const exists = quotes.some(q => q.text === serverQuote.text);
      if (!exists) {
        quotes.push(serverQuote);
        newQuotesAdded = true;
      }
    });
    
    // TASK 3: If new quotes were added, save and update UI
    if (newQuotesAdded) {
      saveQuotes();
      populateCategories();
      showSyncStatus('New quotes synced from server!', 'success');
    } else {
      showSyncStatus('Data is up to date', 'info');
    }
    
  } catch (error) {
    console.error('Sync failed:', error);
    showSyncStatus('Sync failed. Using local data.', 'info');
  }
}

/**
 * Show sync status message
 */
function showSyncStatus(message, type) {
  const syncStatus = document.getElementById('syncStatus');
  syncStatus.textContent = message;
  syncStatus.className = `sync-status sync-${type}`;
  
  // Hide after 3 seconds
  setTimeout(() => {
    syncStatus.textContent = '';
    syncStatus.className = '';
  }, 3000);
}


// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Show notification to user
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Create add quote form (mentioned in requirements)
 * This form is already in the HTML
 */
function createAddQuoteForm() {
  console.log('Add quote form is available in the UI');
}


// ============================================
// START THE APPLICATION
// ============================================

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);