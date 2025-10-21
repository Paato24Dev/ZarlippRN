# 🗺️ Configuración de Google Maps para ZarlippRN

## 🚨 PROBLEMA ACTUAL
El mapa no carga porque necesitas una **API Key válida** de Google Maps.

## ✅ SOLUCIÓN TEMPORAL IMPLEMENTADA
He creado un **mapa de prueba** que se muestra mientras configuras tu API Key real.

## 🔧 CÓMO OBTENER TU API KEY REAL

### **Paso 1: Crear cuenta en Google Cloud**
1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google (Gmail)
3. Acepta los términos de servicio

### **Paso 2: Crear proyecto**
1. Haz clic en "Seleccionar proyecto" (arriba a la izquierda)
2. Haz clic en "Nuevo proyecto"
3. **Nombre:** `ZarlippRN-Maps`
4. Haz clic en "Crear"

### **Paso 3: Habilitar APIs necesarias**
1. Ve a "APIs y servicios" → "Biblioteca"
2. Busca y habilita estas APIs:
   - ✅ **Maps JavaScript API** (obligatorio)
   - ✅ **Places API** (para búsqueda de lugares)
   - ✅ **Geocoding API** (para convertir direcciones a coordenadas)

### **Paso 4: Crear API Key**
1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "Crear credenciales" → "Clave de API"
3. **Copia la API Key** que aparece (empieza con `AIzaSy...`)

### **Paso 5: Configurar restricciones (Recomendado)**
1. Haz clic en la API Key que acabas de crear
2. **Restricciones de aplicación:**
   - Selecciona "Sitios web HTTP"
   - Agrega: `http://localhost` y `file://`
3. **Restricciones de API:**
   - Selecciona "Restringir clave"
   - Marca: Maps JavaScript API, Places API, Geocoding API

### **Paso 6: Configurar facturación**
1. Ve a "Facturación" en el menú lateral
2. Vincula una cuenta de facturación (tarjeta de crédito)
3. **No te preocupes:** Google Maps tiene límites gratuitos generosos

## 🔄 ACTIVAR EL MAPA REAL

### **Una vez que tengas tu API Key:**

1. **Abre** `index.html` en tu editor
2. **Busca** la línea 10 (donde está comentado el script de Google Maps)
3. **Descomenta** la línea y reemplaza `TU_API_KEY_AQUI`:

```html
<!-- ANTES (comentado): -->
<!-- <script src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_AQUI&libraries=places&callback=initMap" async defer></script> -->

<!-- DESPUÉS (con tu API Key real): -->
<script src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_REAL_AQUI&libraries=places&callback=initMap" async defer></script>
```

4. **Comenta** o elimina el script del mapa de prueba (líneas 12-89)

## 💰 COSTOS DE GOOGLE MAPS

### **Límites gratuitos (por mes):**
- **Maps JavaScript API:** 28,000 cargas de mapa
- **Places API:** 1,000 solicitudes
- **Geocoding API:** 2,500 solicitudes

### **Para desarrollo:**
- Los límites gratuitos son más que suficientes
- No deberías tener costos durante el desarrollo

## 🚨 ERRORES COMUNES Y SOLUCIONES

### **Error: "ApiNotActivatedMapError"**
- **Causa:** API no habilitada
- **Solución:** Habilita "Maps JavaScript API" en Google Cloud Console

### **Error: "RefererNotAllowedMapError"**
- **Causa:** Restricciones de dominio
- **Solución:** Agrega `http://localhost` a las restricciones de la API Key

### **Error: "BillingNotEnabledMapError"**
- **Causa:** Facturación no habilitada
- **Solución:** Configura la facturación en Google Cloud Console

### **Error: "InvalidKeyMapError"**
- **Causa:** API Key incorrecta
- **Solución:** Verifica que la API Key sea correcta

## ✅ UNA VEZ CONFIGURADO VERÁS:

1. **Mapa de Argentina** cargado correctamente
2. **Tu ubicación** marcada con punto verde 📍
3. **6 conductores** distribuidos por el país 🚗
4. **Información detallada** al hacer clic en los marcadores
5. **Geolocalización** funcionando perfectamente

## 🎯 FUNCIONALIDADES DEL MAPA:

- **Centrado en Argentina** (zoom nivel 6)
- **Conductores en:** Buenos Aires, Córdoba, Rosario, Tucumán, Salta, Mar del Plata
- **Geolocalización automática** del usuario
- **Información detallada** de cada conductor
- **Actualización en tiempo real** cada 30 segundos
- **Controles completos** (zoom, street view, pantalla completa)

## 📞 SOPORTE

Si tienes problemas:
- **Google Maps Documentation:** https://developers.google.com/maps/documentation
- **PaatoDev:** paatodev@dev.com

---

**¡Una vez configurado, tu mapa funcionará perfectamente!** 🗺️✨
