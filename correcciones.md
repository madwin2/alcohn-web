En http://localhost:3000/buy?mode=custom cuando me da las opciones de medida, deebria tener una logica especifica la eleccion de la medida chica, mediana y grande.

Ademas, la medida que define si es un sello chico es la siguiente (medidas en centimetros)		
		
1X1	2X2	2,5x2,5
2X1	3X2	3x2,5
3X1	4X2	
4X1		
5x1		
6x1		
7x1		
8x1

Sellos Medianos

(cm)	
			
9x1	5x2	4x2,5	3X3
	6x2	5x2,5	4X3
	7x2	6x2,5	5x3
	8x2	7x2,5	6x3
			4X4
			5x4

Sellos Grandes		
		
(cm)

9x2	7x3	6x4
8x2,5	8x3	7x4
9x2,5		8x4
10x2,5		9x3	9x4	5x5
		6x5
		7x5

La idea seria ofrecer la medida mas grande posible de un sello chico (en proporcion), una medida cercana al 4x4 o 5x3 en el mediano (lo mas similar dependiendo la proporcion obvio) y la medida mas chica de un sello grande.

En la eleccion de la medida preseleccionada, no me deja escribir los numeros. Lo ideal seria que a tiempo real te vaya dando la medida segun la escala. si pones el ancho te da el alto proporcional. o visebersa. Ademas, te determina de manera automatica si es Chico, Mediano o Grande y el valor.

Tambien, con respecto al precio, deberia aparecer el precio con 3 cuotas sin interes y ademas el precio promocional por pagar con transferencia.

Tambien, en el camina que figura que te va marcando los pasos y en que paso estas, como la barra de progreso que hicimos, esta un paso atrasado. o parece eso. los que ya hiciste los marca como completados (todo en negro), y los que no en gris clarito. Pero el paso en el que estas lo marca como gris clarito tambien. Entonces ocnfunde. Deberia marcarlo con una linea negra y gris clarito el relleno, un intermedio entre ambos seria. 

En cuanto al pago, en la ultima pagina tenemos que ofrecer ambas opciones: Pagar con tarjeta 3 cuotas sin interes o descuento por transferencia. Lo de la transferencia esta ok como se ve ahora. Y para el pago con tarjeta tenemos que integrar OPEN PAY de BBVA (argentina).

Tambien, lo del comprobante, podriamos aceptar que lo carguen directo a la pagina. Dar esa opcion tambien, por si les queda mas comodo. Aunque capaz que whatsapp tambien. Dar esas dos opciones en transferencia.

