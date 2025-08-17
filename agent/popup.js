document.addEventListener("DOMContentLoaded", function () {
  const testButton = document.getElementById("testButton");
  const logsDiv = document.getElementById("logs");

  // Fonction pour logger dans l'interface
  function log(message) {
    logsDiv.style.display = "block";
    logsDiv.innerHTML +=
      new Date().toLocaleTimeString() + ": " + message + "<br>";
    logsDiv.scrollTop = logsDiv.scrollHeight;
  }

  // Test de la fonctionnalité
  testButton.addEventListener("click", async function () {
    testButton.disabled = true;
    testButton.textContent = "Test en cours...";
    logsDiv.innerHTML = "";
    log("Début du test...");

    try {
      // Test de la requête vers backend.wplace.live
      log("Test de la requête vers backend.wplace.live...");
      const meResponse = await browserAPI.runtime.sendMessage({
        type: "MAKE_REQUEST",
        url: "https://backend.wplace.live/me",
        method: "GET",
      });

      if (meResponse && meResponse.charges) {
        log("✅ Récupération de me.charges.count: " + meResponse.charges.count);

        // Test de la requête vers localhost
        log("Test de la requête vers localhost:5000...");
        const pixelsResponse = await browserAPI.runtime.sendMessage({
          type: "MAKE_REQUEST",
          url: `http://127.0.0.1:5000/pixels/${meResponse.charges.count}`,
          method: "GET",
        });

        if (pixelsResponse) {
          log("✅ Récupération des données pixels réussie");
          log("Colors: " + (pixelsResponse.colors ? "OK" : "Manquant"));
          log("Coords: " + (pixelsResponse.coords ? "OK" : "Manquant"));

          // Test de JSON.stringify dans l'onglet actuel
          log("Test de JSON.stringify modifié...");
          const tabs = await browserAPI.tabs.query({
            active: true,
            currentWindow: true,
          });

          if (tabs[0]) {
            const testResult = await browserAPI.tabs.executeScript(tabs[0].id, {
              code: `
                // Test avec un objet contenant colors, coords et t
                const testObj = {
                  colors: ['#FF0000', '#00FF00'],
                  coords: [[10, 20], [30, 40]],
                  t: Date.now(),
                  other: 'data'
                };
                
                const result = JSON.stringify(testObj);
                'Test JSON.stringify: ' + (result.includes('colors') ? 'OK' : 'FAILED');
              `,
            });

            log("✅ Test complet terminé avec succès");
          }
        } else {
          log("❌ Erreur: Réponse vide de localhost:5000");
        }
      } else {
        log(
          "❌ Erreur: Structure de réponse inattendue de backend.wplace.live"
        );
      }
    } catch (error) {
      log("❌ Erreur lors du test: " + error.message);

      if (error.message.includes("127.0.0.1")) {
        log(
          "💡 Assurez-vous que votre serveur local est démarré sur le port 5000"
        );
      }

      if (error.message.includes("backend.wplace.live")) {
        log(
          "💡 Vérifiez votre connexion internet et l'accès à backend.wplace.live"
        );
      }
    } finally {
      testButton.disabled = false;
      testButton.textContent = "Tester la modification";
    }
  });

  // Vérifier le statut de l'extension
  browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      // L'extension est active sur cet onglet
      document.getElementById("status").className = "status active";
      document.getElementById("status").innerHTML = "✅ Extension Active";
    } else {
      document.getElementById("status").className = "status inactive";
      document.getElementById("status").innerHTML = "❌ Extension Inactive";
    }
  });
});
const testButton = document.getElementById("testButton");
const logsDiv = document.getElementById("logs");

// Fonction pour logger dans l'interface
function log(message) {
  logsDiv.style.display = "block";
  logsDiv.innerHTML +=
    new Date().toLocaleTimeString() + ": " + message + "<br>";
  logsDiv.scrollTop = logsDiv.scrollHeight;
}

// Test de la fonctionnalité
testButton.addEventListener("click", async function () {
  testButton.disabled = true;
  testButton.textContent = "Test en cours...";
  logsDiv.innerHTML = "";
  log("Début du test...");

  try {
    // Test de la requête vers backend.wplace.live
    log("Test de la requête vers backend.wplace.live...");
    const meResponse = await chrome.runtime.sendMessage({
      type: "MAKE_REQUEST",
      url: "https://backend.wplace.live/me",
      method: "GET",
    });

    if (meResponse && meResponse.charges) {
      log("✅ Récupération de me.charges.count: " + meResponse.charges.count);

      // Test de la requête vers localhost
      log("Test de la requête vers localhost:5000...");
      const pixelsResponse = await chrome.runtime.sendMessage({
        type: "MAKE_REQUEST",
        url: `http://127.0.0.1:5000/pixels/${meResponse.charges.count}`,
        method: "GET",
      });

      if (pixelsResponse) {
        log("✅ Récupération des données pixels réussie");
        log("Colors: " + (pixelsResponse.colors ? "OK" : "Manquant"));
        log("Coords: " + (pixelsResponse.coords ? "OK" : "Manquant"));

        // Test de JSON.stringify dans l'onglet actuel
        log("Test de JSON.stringify modifié...");
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        const testResult = await chrome.tabs.executeScript(tab.id, {
          code: `
              // Test avec un objet contenant colors, coords et t
              const testObj = {
                colors: ['#FF0000', '#00FF00'],
                coords: [[10, 20], [30, 40]],
                t: Date.now(),
                other: 'data'
              };
              
              const result = JSON.stringify(testObj);
              'Test JSON.stringify: ' + (result.includes('colors') ? 'OK' : 'FAILED');
            `,
        });

        log("✅ Test complet terminé avec succès");
      } else {
        log("❌ Erreur: Réponse vide de localhost:5000");
      }
    } else {
      log("❌ Erreur: Structure de réponse inattendue de backend.wplace.live");
    }
  } catch (error) {
    log("❌ Erreur lors du test: " + error.message);

    if (error.message.includes("127.0.0.1")) {
      log(
        "💡 Assurez-vous que votre serveur local est démarré sur le port 5000"
      );
    }

    if (error.message.includes("backend.wplace.live")) {
      log(
        "💡 Vérifiez votre connexion internet et l'accès à backend.wplace.live"
      );
    }
  } finally {
    testButton.disabled = false;
    testButton.textContent = "Tester la modification";
  }
});

// Vérifier le statut de l'extension
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (tabs[0]) {
    // L'extension est active sur cet onglet
    document.getElementById("status").className = "status active";
    document.getElementById("status").innerHTML = "✅ Extension Active";
  } else {
    document.getElementById("status").className = "status inactive";
    document.getElementById("status").innerHTML = "❌ Extension Inactive";
  }
});
