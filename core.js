document.addEventListener('DOMContentLoaded', () => {
    // Video Player Functionality
    const videoButtons = document.querySelectorAll('[video="open"]');
    const videoOverlay = document.querySelector('.video-overlay');

    if (videoButtons.length && videoOverlay) {
        // Function to stop videos
        const stopVideos = () => {
            // Stop HTML5 videos
            const videos = videoOverlay.querySelectorAll('video');
            videos.forEach(video => video.pause());

            // Stop iframe embeds (YouTube, Vimeo, etc.)
            const iframes = videoOverlay.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                const src = iframe.src;
                iframe.src = '';
                iframe.src = src;
            });
        };

        // Open video overlay when button is clicked
        videoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                videoOverlay.classList.add('is-open');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        });

        // Close video overlay when clicking outside the video holder
        videoOverlay.addEventListener('click', (e) => {
            if (e.target === videoOverlay) {
                stopVideos(); // Stop videos before closing
                videoOverlay.classList.remove('is-open');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });

        // Optional: Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && videoOverlay.classList.contains('is-open')) {
                stopVideos(); // Stop videos before closing
                videoOverlay.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        });
    }

    // Circle Widget Functionality
    const circleButtons = document.querySelectorAll('[circle-widget^="button-"]');
    const centerItems = document.querySelectorAll('[circle-widget^="item-"]');
    const circle2 = document.querySelector('.circle-2');
    
    if (circleButtons.length && centerItems.length) {
        // Add hover listeners to buttons
        circleButtons.forEach(button => {
            const buttonId = button.getAttribute('circle-widget'); // e.g., "button-1"
            const itemNumber = buttonId.split('-')[1]; // Extract number from "button-1" -> "1"
            
            button.addEventListener('mouseenter', () => {
                // Remove visible class from all items
                centerItems.forEach(item => {
                    item.classList.remove('center-item__is-visible');
                });
                
                // Add visible class to the corresponding item
                const targetItem = document.querySelector(`[circle-widget="item-${itemNumber}"]`);
                if (targetItem) {
                    targetItem.classList.add('center-item__is-visible');
                }
                
                // Add faded class to circle-2
                if (circle2) {
                    circle2.classList.add('circle-2__is-faded');
                }
            });
            
            button.addEventListener('mouseleave', () => {
                // When leaving button, show item-0 again
                const item0 = document.querySelector('[circle-widget="item-0"]');
                if (item0) {
                    centerItems.forEach(item => {
                        item.classList.remove('center-item__is-visible');
                    });
                    item0.classList.add('center-item__is-visible');
                }
                
                // Remove faded class from circle-2
                if (circle2) {
                    circle2.classList.remove('circle-2__is-faded');
                }
            });
        });
    }

    // Filter System Functionality
    const filterButtons = document.querySelectorAll('.filter-label');
    const accordionItems = document.querySelectorAll('.list7_item');

    if (filterButtons.length && accordionItems.length) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // If button is already selected, do nothing
                if (button.classList.contains('filter-is-selected')) {
                    return;
                }

                // Get filter value from button
                const filterButtonDiv = button.querySelector('[filter="button"]');
                const buttonFilterValue = filterButtonDiv 
                    ? filterButtonDiv.textContent.trim() 
                    : (button.classList.contains('all') ? 'all' : null);

                // Clear all selections
                filterButtons.forEach(btn => btn.classList.remove('filter-is-selected'));

                // Select only the clicked button
                button.classList.add('filter-is-selected');

                // Filter accordion items
                if (buttonFilterValue === 'all') {
                    accordionItems.forEach(item => {
                        item.style.display = '';
                    });
                } else if (buttonFilterValue) {
                    accordionItems.forEach(item => {
                        const filterElements = item.querySelectorAll('[filter="value"]');
                        const itemFilterValues = Array.from(filterElements).map(el => el.textContent.trim());
                        
                        if (itemFilterValues.includes(buttonFilterValue)) {
                            item.style.display = '';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                }
            });
        });

        // Set initial state - show all
        const allButton = Array.from(filterButtons).find(btn => btn.classList.contains('all'));
        if (allButton) {
            allButton.classList.add('filter-is-selected');
        }
    }
});