document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const memoryForm = document.getElementById('memory-form');
    const tripNameInput = document.getElementById('trip-name');
    const memoryImageInput = document.getElementById('memory-image');
    const memoryDescriptionInput = document.getElementById('memory-description');
    const memoryDateInput = document.getElementById('memory-date');
    const imagePreview = document.getElementById('image-preview');
    const memoriesContainer = document.getElementById('memories-container');
    const searchInput = document.getElementById('search-memories');
    const filterDate = document.getElementById('filter-date');
    const modal = document.getElementById('memory-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');

    // Load memories from localStorage
    let memories = JSON.parse(localStorage.getItem('memories')) || [];
    let editingMemoryId = null; // Store the ID of the memory being edited

    // Event Listeners
    memoryForm.addEventListener('submit', handleFormSubmit);
    memoryImageInput.addEventListener('change', handleImageUpload);
    searchInput.addEventListener('input', filterMemories);
    filterDate.addEventListener('change', filterMemories);
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Display existing memories
    displayMemories();

    // Functions
    function handleFormSubmit(e) {
        e.preventDefault();

        // Get form values
        const tripName = tripNameInput.value.trim();
        const description = memoryDescriptionInput.value.trim();
        const date = memoryDateInput.value;
        const imageFile = memoryImageInput.files[0];

        if (!tripName || !description || !date) {
            alert('Please fill in all required fields');
            return;
        }

        const newMemory = {
            id: editingMemoryId || Date.now().toString(),
            tripName,
            description,
            date,
            imageUrl: imageFile ? URL.createObjectURL(imageFile) : ''
        };

        // Add to memories array (update if editing)
        if (editingMemoryId) {
            memories = memories.map(memory => memory.id === editingMemoryId ? newMemory : memory);
        } else {
            memories.unshift(newMemory);
        }

        // Save to localStorage
        localStorage.setItem('memories', JSON.stringify(memories));

        // Reset form
        memoryForm.reset();
        imagePreview.innerHTML = '';
        editingMemoryId = null; // Reset editing mode

        // Update UI
        displayMemories();

        // Show success message
        alert('Memory saved successfully!');
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }

    function displayMemories(filteredMemories = null) {
        const memoriesToDisplay = filteredMemories || memories;

        if (memoriesToDisplay.length === 0) {
            memoriesContainer.innerHTML = '<p class="no-memories">No memories yet. Add your first memory above!</p>';
            return;
        }

        memoriesContainer.innerHTML = '';

        memoriesToDisplay.forEach(memory => {
            const memoryCard = document.createElement('div');
            memoryCard.className = 'memory-card';
            memoryCard.innerHTML = `
                ${memory.imageUrl ? `<img src="${memory.imageUrl}" class="memory-image" alt="${memory.tripName}">` : ''}
                <div class="memory-content">
                    <h3 class="memory-title">${memory.tripName}</h3>
                    <p class="memory-date">${formatDate(memory.date)}</p>
                    <p class="memory-description">${memory.description}</p>
                    <div class="memory-actions">
                        <button class="delete-btn" data-id="${memory.id}"><i class="fas fa-trash"></i> Delete</button>
                        <button class="edit-btn" data-id="${memory.id}"><i class="fas fa-edit"></i> Edit</button>
                    </div>
                </div>
            `;

            // Add click event to view memory details
            memoryCard.addEventListener('click', (e) => {
                // Don't open modal if delete or edit button was clicked
                if (e.target.closest('.delete-btn') || e.target.closest('.edit-btn')) return;

                modalTitle.textContent = memory.tripName;
                modalDate.textContent = formatDate(memory.date, true);
                modalDescription.textContent = memory.description;
                if (memory.imageUrl) {
                    modalImage.src = memory.imageUrl;
                    modalImage.style.display = 'block';
                } else {
                    modalImage.style.display = 'none';
                }
                modal.style.display = 'block';
            });

            // Add delete functionality
            const deleteBtn = memoryCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this memory?')) {
                    deleteMemory(memory.id);
                }
            });

            // Add edit functionality
            const editBtn = memoryCard.querySelector('.edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editMemory(memory.id);
            });

            memoriesContainer.appendChild(memoryCard);
        });
    }

    function deleteMemory(id) {
        memories = memories.filter(memory => memory.id !== id);
        localStorage.setItem('memories', JSON.stringify(memories));
        displayMemories();
    }

    function filterMemories() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterDate.value;

        let filtered = memories.filter(memory =>
            memory.tripName.toLowerCase().includes(searchTerm) ||
            memory.description.toLowerCase().includes(searchTerm)
        );

        if (filterValue === 'newest') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (filterValue === 'oldest') {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        displayMemories(filtered);
    }

    function formatDate(dateString, full = false) {
        const options = full ?
            { year: 'numeric', month: 'long', day: 'numeric' } :
            { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function editMemory(id) {
        const memory = memories.find(memory => memory.id === id);
        if (!memory) return;

        // Fill the form with the current memory details
        tripNameInput.value = memory.tripName;
        memoryDescriptionInput.value = memory.description;
        memoryDateInput.value = memory.date;
        // No need to update image preview here, you can implement logic if you want to edit the image
        editingMemoryId = memory.id; // Set the memory ID for updating
    }
});
