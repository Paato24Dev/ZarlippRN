# 🗺️ Configuración de Google Maps para ZarlippRN

## 📋 Pasos para obtener Google Maps API Key

### 1. **Crear cuenta en Google Cloud Console**
- Ve a: https://console.cloud.google.com/
- Inicia sesión con tu cuenta de Google
- Acepta los términos de servicio

### 2. **Crear un nuevo proyecto**
- Haz clic en "Seleccionar proyecto" → "Nuevo proyecto"
- Nombre del proyecto: `ZarlippRN-Maps`
- Haz clic en "Crear"

### 3. **Habilitar las APIs necesarias**
Ve a "APIs y servicios" → "Biblioteca" y habilita:

#### **APIs Requeridas:**
- ✅ **Maps JavaScript API** (obligatorio)
- ✅ **Places API** (para búsqueda de lugares)
- ✅ **Geocoding API** (para convertir direcciones a coordenadas)
- ✅ **Directions API** (para rutas)

### 4. **Crear credenciales**
- Ve a "APIs y servicios" → "Credenciales"
- Haz clic en "Crear credenciales" → "Clave de API"
- Copia la API Key generada

### 5. **Configurar restricciones (Recomendado)**
- Haz clic en la API Key creada
- En "Restricciones de aplicación":
  - Selecciona "Sitios web HTTP"
  - Agrega tu dominio: `localhost:3000` (para desarrollo)
  - Agrega tu dominio de producción cuando esté listo

## 🔧 Configuración en el código

### **Paso 1: Reemplazar la API Key**
En el archivo `index.html`, línea 9:

```html
<!-- REEMPLAZAR ESTA LÍNEA: -->
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBvOkBwvFwLzJjJjJjJjJjJjJjJjJjJjJjJj&libraries=places&callback=initMap" async defer></script>

<!-- CON TU API KEY REAL: -->
<script src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_AQUI&libraries=places&callback=initMap" async defer></script>
```

### **Paso 2: Verificar que funciona**
1. Abre `index.html` en tu navegador
2. Ve a la pestaña "Mapa"
3. Deberías ver:
   - ✅ Mapa de Buenos Aires cargado
   - ✅ Solicitud de permisos de ubicación
   - ✅ Tu ubicación marcada con un punto verde
   - ✅ Conductores de prueba marcados con puntos violetas

## 🚨 Solución de problemas comunes

### **Error: "Google Maps JavaScript API error"**
- **Causa:** API Key inválida o no configurada
- **Solución:** Verifica que la API Key sea correcta

### **Error: "This page can't load Google Maps correctly"**
- **Causa:** APIs no habilitadas
- **Solución:** Habilita Maps JavaScript API en Google Cloud Console

### **Error: "Geolocation error"**
- **Causa:** Permisos de ubicación denegados
- **Solución:** Permite el acceso a la ubicación en tu navegador

### **Mapa no se carga**
- **Causa:** Restricciones de dominio
- **Solución:** Agrega `localhost:3000` a las restricciones de la API Key

## 💰 Costos de Google Maps

### **Límites gratuitos (por mes):**
- **Maps JavaScript API:** 28,000 cargas de mapa
- **Places API:** 1,000 solicitudes
- **Geocoding API:** 2,500 solicitudes

### **Para desarrollo:**
- Los límites gratuitos son más que suficientes
- No deberías tener costos durante el desarrollo

## 🔒 Seguridad

### **Recomendaciones:**
1. **Nunca** compartas tu API Key públicamente
2. **Configura restricciones** de dominio
3. **Monitorea el uso** en Google Cloud Console
4. **Usa variables de entorno** en producción

## 📞 Soporte

Si tienes problemas:
- **Google Maps Documentation:** https://developers.google.com/maps/documentation
- **PaatoDev:** paatodev@dev.com

---

**¡Una vez configurado, tu mapa funcionará perfectamente!** 🗺️✨
