document.addEventListener('DOMContentLoaded', () => {
    const eventsContainer = document.getElementById('eventsContainer');
    const eventCount = document.getElementById('eventCount');
    const titleFilter = document.getElementById('titleFilter');
    const descriptionFilter = document.getElementById('descriptionFilter');
    const dateFilter = document.getElementById('dateFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const itemsPerPageSelectBottom = document.getElementById('itemsPerPageBottom');
    const nextPageBtn = document.getElementById('nextPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtnBottom = document.getElementById('nextPageBottom');
    const prevPageBtnBottom = document.getElementById('prevPageBottom');

    let events = [];
    let filteredEvents = [];
    let currentPage = 1;
    let itemsPerPage = 25;  // Default items per page

    // Fetch the RSS feed and parse the events
    function fetchEventsFromRSS() {
        fetch('http://0.0.0.0:8000/events.rss')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "application/xml");
            const items = xmlDoc.querySelectorAll("item");
            events = Array.from(items).map(item => {
                const title = item.querySelector('title').textContent;
                const date = item.querySelector('pubDate').textContent;
                const description = item.querySelector('description').textContent.replace(/<[^>]+>/g, ''); // Strip HTML tags
                const image = item.querySelector('enclosure') ? item.querySelector('enclosure').getAttribute('url') : 'default_image_url_here'; // Default image if not present
                return { title, date, description, image };
            });
            applyFilters(); // Initial render with filters applied
        })
        .catch(error => console.error('Error fetching RSS:', error));
    }

    function renderEvents(pageEvents) {
        eventsContainer.innerHTML = "";
        pageEvents.forEach(event => {
            const eventCard = document.createElement('article');
            eventCard.className = 'event-card';
            
            const shortDescription = event.description.slice(0, 100); // Truncate description
            const fullDescription = event.description.slice(100);
            
            eventCard.innerHTML = `
                <img src="${event.image}" alt="${event.title}">
                <h3>${event.title}</h3>
                <p>${event.date}</p>
                <p>${shortDescription}${fullDescription ? '...' : ''}</p>
                <p class="full-description">${fullDescription}</p>
                <a class="learn-more" href="#">${fullDescription ? 'Read more' : ''}</a>
            `;
            eventsContainer.appendChild(eventCard);

            const learnMoreLink = eventCard.querySelector('.learn-more');
            if (learnMoreLink) {
                learnMoreLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (eventCard.classList.contains('expanded')) {
                        eventCard.classList.remove('expanded');
                        learnMoreLink.textContent = 'Read more';
                    } else {
                        eventCard.classList.add('expanded');
                        learnMoreLink.textContent = 'Read less';
                    }
                });
            }
        });
        eventCount.textContent = `Showing ${pageEvents.length} of ${filteredEvents.length} events`;
    }

    function paginate(events) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = itemsPerPage === 'all' ? events.length : startIndex + itemsPerPage;
        return events.slice(startIndex, endIndex);
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
        nextPageBtn.disabled = currentPage >= totalPages;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtnBottom.disabled = nextPageBtn.disabled;
        prevPageBtnBottom.disabled = prevPageBtn.disabled;
    }

    function applyFilters() {
        filteredEvents = events.filter(event =>
            event.title.toLowerCase().includes(titleFilter.value.toLowerCase()) &&
            event.description.toLowerCase().includes(descriptionFilter.value.toLowerCase()) &&
            event.date.toLowerCase().includes(dateFilter.value.toLowerCase())
        );
        currentPage = 1; // Reset to the first page on applying filters
        renderEvents(paginate(filteredEvents));
        updatePagination();
    }

    function changeItemsPerPage() {
        itemsPerPage = itemsPerPageSelect.value === 'all' ? filteredEvents.length : parseInt(itemsPerPageSelect.value, 10);
        currentPage = 1; // Reset to first page when changing items per page
        renderEvents(paginate(filteredEvents));
        updatePagination();
    }

    // Event Listeners for pagination
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        renderEvents(paginate(filteredEvents));
        updatePagination();
    });

    prevPageBtn.addEventListener('click', () => {
        currentPage--;
        renderEvents(paginate(filteredEvents));
        updatePagination();
    });

    nextPageBtnBottom.addEventListener('click', () => {
        currentPage++;
        renderEvents(paginate(filteredEvents));
        updatePagination();
    });

    prevPageBtnBottom.addEventListener('click', () => {
        currentPage--;
        renderEvents(paginate(filteredEvents));
        updatePagination();
    });

    itemsPerPageSelect.addEventListener('change', changeItemsPerPage);
    itemsPerPageSelectBottom.addEventListener('change', () => {
        itemsPerPageSelect.value = itemsPerPageSelectBottom.value;
        changeItemsPerPage();
    });

    clearFiltersBtn.addEventListener('click', () => {
        titleFilter.value = '';
        descriptionFilter.value = '';
        dateFilter.value = '';
        applyFilters();
    });

    applyFiltersBtn.addEventListener('click', applyFilters);

    // Fetch and display events from the RSS feed on page load
    fetchEventsFromRSS();
});
