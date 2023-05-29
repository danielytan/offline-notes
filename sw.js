self.addEventListener('fetch', (event) => {
  // Intercept the fetch request
  if (event.request.url.includes('/api/save-note')) {
    event.respondWith(handleSaveNoteRequest(event.request));
  }
});

async function handleSaveNoteRequest(request) {
  try {
    // Extract the note data from the request body
    const noteData = await request.clone().json();

    // Save the note data to the database using an API endpoint
    const response = await fetch('/api/save-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });

    // Return the response from the API endpoint
    return response;
  } catch (error) {
    // Handle any errors
    console.error('Error saving note:', error);
    return new Response('Error saving note', { status: 500 });
  }
}