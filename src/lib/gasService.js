const GAS_URL = 'https://script.google.com/macros/s/AKfycbwnT_SOykvPVcq0IVSFzvxjgJBn5OwPt6LIO7UDuZr6ct6xGj7Q2U9J9-0N3Eu4SN0IaA/exec';

/**
 * Submits training data to Google Sheets via GAS.
 */
export async function submitTraining(formData) {
  const { date, dog, guide, sessions } = formData;
  const now = new Date();
  const colombiaTime = new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(now).replace(',', '');

  const payload = sessions.map(session => ({
    Fecha_Registro: colombiaTime,
    Fecha_Sesion: date,
    Perro: dog,
    Guia: guide,
    Objetivo: session.target,
    UA_C: session.uaCorrect,
    UA_I: session.uaIncorrect,
    Reforzadores: session.reinforcers,
    Notas: session.comments
  }));

  return fetchRequest(payload);
}

/**
 * Adds a new entity (Dog or Guide) to the spreadsheet.
 */
export async function addEntity(entityType, data) {
  return fetchRequest({ action: 'addEntity', entityType, data });
}

/**
 * Fetches all dogs and guides from the spreadsheet.
 * USES GET REQUEST TO BYPASS CORS IN CERTAIN BROWSER MODES (More robust).
 */
export async function getEntities() {
  try {
    const url = `${GAS_URL}?action=getEntities`;
    console.log("Fetching entities via GET:", url);
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) throw new Error('Error al conectar con Google Apps Script (GET)');
    const data = await response.json();
    console.log("Entities Loaded:", data);
    return data;
  } catch (error) {
    console.error("GET Fetch Error:", error);
    // Fallback to post if get fails for some reason
    return fetchRequest({ action: 'getEntities' });
  }
}

/**
 * Standard fetch handler for POST actions.
 */
async function fetchRequest(payload) {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });

    if (!response.ok) throw new Error('Error al conectar con Google Apps Script (POST)');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("POST Request Error:", error);
    throw error;
  }
}
