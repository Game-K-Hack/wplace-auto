// Compatibilité Firefox/Chrome
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Injection du script dans le contexte de la page
function injectScript() {
  const script = document.createElement('script');
  script.textContent = `
    (function () {
      const originalStringify = JSON.stringify;

      // Fonction pour faire des requêtes synchrones via XMLHttpRequest (même pour localhost)
      function makeXHRRequest(url, with_credentials=false) {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", url, false); // synchrone
          xhr.withCredentials = with_credentials;
          xhr.setRequestHeader("Accept", "application/json");

          // Pour localhost, essayer sans CORS d'abord
          if (url.includes("127.0.0.1") || url.includes("localhost")) {
            try {
              xhr.send();
              if (xhr.status === 200) {
                return JSON.parse(xhr.responseText);
              }
            } catch (corsError) {
              console.log("CORS bloqué pour localhost, tentative via extension...");
              // Si CORS bloque, on essaiera une autre méthode
              throw new Error("CORS_BLOCKED");
            }
          } else {
            xhr.send();
            if (xhr.status === 200) {
              return JSON.parse(xhr.responseText);
            }
          }

          throw new Error(\`HTTP \${xhr.status}: \${xhr.statusText}\`);
        } catch (error) {
          console.error("Erreur XHR pour", url, ":", error);
          return null;
        }
      }

      // Fonction synchrone pour récupérer les données pixels
      function getPixelsDataSync(count) {
        // Essayer une requête XHR directe
        try {
          const data = makeXHRRequest(\`http://127.0.0.1:5000/pixels/\${count}\`);
          return data;
        } catch (error) {
          console.error(
            "Impossible de récupérer les données pixels de manière synchrone:",
            error
          );
        }

        return null;
      }

      // Override de JSON.stringify
      JSON.stringify = function (value, replacer, space) {
        // Vérifier si l'objet contient les clés colors, coords et t
        if (value && typeof value === "object" && "colors" in value && "coords" in value && "t" in value) {
          console.log("Détection des clés colors, coords et t - Modification en cours...");

          // Créer une copie de l'objet
          const modifiedValue = { ...value };

          try {
            // 1. Récupérer me.charges.count de manière synchrone
            console.log("Récupération de me.charges.count...");
            const meResponse = makeXHRRequest("https://backend.wplace.live/me", true);

            if (
              meResponse &&
              meResponse.charges &&
              typeof meResponse.charges.count !== "undefined"
            ) {
              const chargesCount = meResponse.charges.count;
              console.log("Charges count récupéré:", chargesCount);

              // 2. Récupérer les données pixels de manière synchrone
              const pixelsData = getPixelsDataSync(chargesCount);

              if (pixelsData) {
                if (pixelsData.colors) {
                  modifiedValue.colors = pixelsData.colors;
                  console.log(
                    "Colors mis à jour:",
                    pixelsData.colors.length,
                    "éléments"
                  );
                }
                if (pixelsData.coords) {
                  modifiedValue.coords = pixelsData.coords;
                  console.log(
                    "Coords mis à jour:",
                    pixelsData.coords.length,
                    "éléments"
                  );
                }
                console.log("Données colors et coords mises à jour avec succès");
              } else {
                console.warn(
                  "Impossible de récupérer les données pixels pour count:",
                  chargesCount
                );
              }
            } else {
              console.error("Impossible de récupérer me.charges.count");
            }
          } catch (error) {
            console.error("Erreur lors de la modification JSON.stringify:", error);
          }

          return originalStringify.call(this, modifiedValue, replacer, space);
        }

        // Comportement normal pour les autres objets
        return originalStringify.call(this, value, replacer, space);
      };

      console.log("JSON.stringify modifié avec succès (version synchrone)");
    })();
  `;
  
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// Pour les tests depuis la popup, on garde la possibilité de faire des requêtes via l'extension
window.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'TEST_REQUEST') {
    try {
      const response = await browserAPI.runtime.sendMessage({
        type: 'MAKE_REQUEST',
        url: event.data.url,
        method: event.data.method || 'GET'
      });
      
      window.postMessage({
        type: 'TEST_RESPONSE',
        messageId: event.data.messageId,
        data: response
      }, '*');
      
    } catch (error) {
      console.error('Erreur lors de la requête test:', error);
      window.postMessage({
        type: 'TEST_RESPONSE',
        messageId: event.data.messageId,
        data: { error: error.message }
      }, '*');
    }
  }
});

// Injecter le script dès que possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectScript);
} else {
  injectScript();
}