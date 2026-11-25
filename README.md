# Proyecto_Final_Carlos_Manrique_Alvarez_U25219625
# El Galeón del Callao y la Ruta del Pacífico

Videojuego de navegación y combate naval inspirado en las rutas comerciales del Pacífico colonial. La travesía y los combates son una representación ficticia con fines educativos.

**Autor:** Carlos Manrique Alvarez  
**Código de estudiante:** U25219625  
**Curso:** Diseño y Desarrollo de Juegos Interactivos I

## Jugar

[Abrir el videojuego]- https://carussocma-lab.github.io/Proyecto_Final_Carlos_Manrique_Alvarez_U25219625/

## Objetivo

Transportar mercancía por la ruta Callao — Guayaquil — Panamá, protegiendo los barcos de enemigos y obstáculos.

El juego tiene dos niveles. En modo cooperativo, ambos jugadores deben llegar al puerto. Para completar la misión se debe conservar al menos el 60 % de la mercancía conjunta.

## Características

- Modo individual y cooperativo local para dos jugadores.
- Control mediante voz y teclado.
- Dos niveles.
- Disparos, colisiones y explosiones animadas.
- Sonidos de disparo, impacto, recolección y llegada.
- Recolección de mercancía y suministros de reparación.
- Animaciones de los barcos mediante SpriteSheet.

## Controles de teclado

| Acción | Jugador 1 | Jugador 2 |
|---|---|---|
| Navegar | Flechas del teclado | W, A, S y D |
| Disparar | Barra espaciadora | F |
| Pausar o reanudar | Esc | Esc |

## Control por voz

Activa el micrófono desde el botón del juego y permite su uso en el navegador.

En modo cooperativo, indica el destinatario: **uno**, **dos** o **ambos**. Los jugadores comparten computadora y micrófono.

Ejemplos:

- «Uno avanzar».
- «Dos arriba».
- «Ambos disparar».
- «Ambos parar».
- «Uno cesar».

Órdenes disponibles: **avanzar, retroceder, arriba, abajo, disparar, cesar y parar**. La orden **continuar** permite iniciar o avanzar desde las pantallas correspondientes.

**Parar** detiene la navegación. **Cesar** detiene el disparo continuo.

Para probar el reconocimiento de voz, utiliza Chrome o Edge con conexión a Internet.

## Tecnologías

- HTML, CSS y JavaScript.
- Phaser CE.
- Reconocimiento de voz mediante la API disponible en el navegador.
- Pyxel Edit para la preparación de editables y animaciones.

## Archivos del proyecto

- `index.html`: página principal.
- `Ventana_Principal.js`: lógica del juego.
- `Control_Voz.js`: reconocimiento de comandos.
- `style.css`: presentación visual.
- `phaser.js`: biblioteca del motor.
- `img/`: imágenes y SpriteSheet.
- `audio/`: sonidos.
- `Archivos Pixel edit/`: archivos editables de arte y animaciones.

## Pantallazos

Pendientes de incorporar.

## Video demostrativo

Pendiente de incorporar.

## Ejecución local

Descarga el repositorio y abre `index.html` mediante un servidor local, por ejemplo Live Server de Visual Studio Code.

## Contexto histórico

El proyecto toma como referencia la navegación mercantil del Pacífico durante el periodo virreinal. No reproduce una batalla ni un viaje histórico específico.

Referencias del contexto:

- [Marina de Guerra del Perú: El Perú virreinal](https://www.gob.pe/26624-marina-de-guerra-del-peru-el-peru-virreinal)
- [Banco Central de Reserva del Perú: Economía colonial tardía](https://www.bcrp.gob.pe/docs/Publicaciones/libros/historia/economia/3-economia-colonial-tardio.pdf)
