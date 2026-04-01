function doGet(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const action = e.parameter.action;

    if (action === 'getEntities') {
      return handleGetEntities(doc);
    }

    checkAndCreateSheet(doc, 'Unidad Canina', ["ID", "Nombre", "Raza", "Estado"]);
    checkAndCreateSheet(doc, 'Equipo', ["ID", "Nombre", "Rol", "Estado"]);
    checkAndCreateSheet(doc, 'Entrenamientos', ["Fecha_Registro", "Fecha_Sesion", "Perro", "Guia", "OCP", "UA_C", "UA_I", "Reforzadores", "Notas"]);
    
    return ContentService.createTextOutput("✅ Conexión establecida correctamente.").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("❌ Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const contents = e.postData.contents;
    const payload = JSON.parse(contents);
    const locTime = Utilities.formatDate(new Date(), "GMT-6", "dd/MM/yyyy HH:mm:ss");

    if (Array.isArray(payload)) return handleTrainingBatch(doc, payload, locTime);
    if (payload.action === 'addEntity') return handleAddEntity(doc, payload.entityType, payload.data, locTime);
    if (payload.action === 'getEntities') return handleGetEntities(doc);
    
    return errorResponse('Acción no reconocida');
  } catch (error) {
    return errorResponse(error.toString());
  }
}

function handleTrainingBatch(doc, sessions, timestamp) {
  const sheet = doc.getSheetByName('Entrenamientos');
  const rows = sessions.map(r => [
    r.Fecha_Registro || timestamp, r.Fecha_Sesion || "", r.Perro || "", r.Guia || "",
    r.Objetivo || r.OCP || "", r.UA_C || 0, r.UA_I || 0, r.Reforzadores || "", r.Notas || ""
  ]);
  if (rows.length > 0) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return successResponse({ rowsAdded: rows.length });
}

function handleAddEntity(doc, entityType, data, timestamp) {
  const sheet = doc.getSheetByName(entityType);
  if (!sheet) return errorResponse('Hoja no encontrada');
  const id = sheet.getLastRow();
  let rowData = (entityType === 'Unidad Canina') 
    ? [id, data.nombre || "", data.raza || "", data.estado || "Activo"]
    : [id, data.nombre || "", data.rol || "", data.estado || "Activo"];
  sheet.appendRow(rowData);
  return successResponse({ id: id });
}

function handleGetEntities(doc) {
  let dogs = getRowsAsObject(doc.getSheetByName('Unidad Canina'));
  let guides = getRowsAsObject(doc.getSheetByName('Equipo'));
  
  return successResponse({
    dogs: dogs,
    guides: guides,
    counts: { dogs: dogs.length, guides: guides.length }
  });
}

function getRowsAsObject(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().trim().toLowerCase());
  const rows = data.slice(1);
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => { obj[header] = row[i]; });
    return obj;
  });
}

function checkAndCreateSheet(doc, name, headers) {
  let sheet = doc.getSheetByName(name);
  if (!sheet) {
    sheet = doc.insertSheet(name);
    sheet.appendRow(headers);
  }
}

function successResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', ...data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
