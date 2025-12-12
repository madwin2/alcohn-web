# Cotización, calculadora y subida de logo

## Objetivo
Que el usuario pueda avanzar SIN hablar con un vendedor.

## Flujo
1. Usuario sube el logo (png/jpg/svg).
2. El sistema le pide material a marcar: cuero / madera / alimento / otro.
3. El sistema le sugiere 3 medidas típicas basadas en tu Excel (en proporcion con la proporcion del diseño del cliente).
4. El sistema muestra el valor del sello según medidas.
5. El sistema muestra el costo de envío (domicilio/sucursal).
6. El sistema ofrece 2 caminos:
   - Comprar (checkout / pagar seña).
   - Hablar por WhatsApp con toda la info precargada.

## Datos a guardar/enviar
- Nombre del cliente
- Teléfono / WhatsApp
- Email
- Logo subido (link)
- Material a marcar
- Medida elegida
- Precio mostrado

Esto se puede mandar por webhook o email interno para que el equipo lo siga.

## Notas para el dev
- Esta página es la que más valor tiene.
- Tiene que estar pensada para ampliarse después con lógica de IA (app de mockups de Julián).
- El formulario debe generar un resumen legible para WhatsApp.
