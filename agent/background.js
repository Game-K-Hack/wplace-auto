// Background script pour Firefox/Chrome compatibilité
const browser = chrome || browser;

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'MAKE_REQUEST') {
    makeRequest(request.url, request.method)
      .then(data => sendResponse(data))
      .catch(error => {
        console.error('Erreur dans background.js:', error);
        sendResponse({ error: error.message });
      });
    
    // Indique que la réponse sera asynchrone
    return true;
  }
});

async function makeRequest(url, method = 'GET') {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      // Désactiver les credentials pour éviter les problèmes CORS
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    throw error;
  }
}

// Log de démarrage
console.log('Background script JSON Stringify Modifier démarré');