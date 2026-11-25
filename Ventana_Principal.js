// EL GALEÓN DEL CALLAO Y LA RUTA DEL PACÍFICO
// Phaser 2. Partida individual o cooperativa, con un barco por jugador.
// Las funciones de movimiento se comparten entre el teclado y la voz.

var juego = new Phaser.Game(960, 540, Phaser.CANVAS, 'bloque_juego');
var fondoJuego;
var mar;
var barcos = [];
var numeroJugadores = 1;
var nombresJugadores = ['', ''];
var partidaConfigurada = false;
var enemigos;
var balasJugadores;
var balasEnemigas;
var rocas;
var suministros;
var efectos;
var teclasUno;
var teclasDos;
var disparoUno;
var disparoDos;
var nivel = 1;
var largoRuta = 2800;
var pantalla = 'portada';
var pausado = false;
var cargaInicial = [100, 100];
var sonidos = {};
var sonidoActivo = true;
var cargado = false;

// =====================================================
// 1. PORTADA Y ARCHIVOS
// =====================================================
var principal = {
    preload: function () {
        juego.load.image('cielo', 'img/cielo.png');
        juego.load.image('mar', 'img/mar.png');
        juego.load.spritesheet('barcoUno','img/barco_uno_animado.png',256, 128, 4);
        juego.load.spritesheet('barcoDos','img/barco_dos_animado.png',256, 128, 4);
        juego.load.image('enemigo', 'img/enemigo.png');
        juego.load.image('bala', 'img/bala.png');
        juego.load.image('balaEnemiga', 'img/bala_enemiga.png');
        juego.load.image('carga', 'img/carga.png');
        juego.load.image('reparacion', 'img/reparacion.png');
        juego.load.image('puerto', 'img/puerto.png');
        juego.load.image('roca', 'img/roca.png');
        juego.load.audio('disparo', 'audio/disparo.wav');
        juego.load.audio('impacto', 'audio/impacto.wav');
        juego.load.audio('recoger', 'audio/recoger.wav');
        juego.load.audio('llegada', 'audio/llegada.wav');
    },

    create: function () {
        juego.stage.disableVisibilityChange = true;
        fondoJuego = juego.add.sprite(0, 0, 'cielo');
        fondoJuego.width = 960;
        fondoJuego.height = 215;
        mar = juego.add.tileSprite(0, 215, 960, 325, 'mar');
        mar.tileScale.setTo(325 / juego.cache.getImage('mar').height);
        var muestraUno = juego.add.sprite(760, 315, 'barcoUno');
        var muestraDos = juego.add.sprite(820, 415, 'barcoDos');
        muestraUno.anchor.setTo(0.5);
        muestraDos.anchor.setTo(0.5);
        ajustarTamano(muestraUno, 212, 120);
        ajustarTamano(muestraDos, 218, 124);
        juego.input.keyboard.enabled = false;
        sonidos.disparo = juego.add.audio('disparo');
        sonidos.impacto = juego.add.audio('impacto');
        sonidos.recoger = juego.add.audio('recoger');
        sonidos.llegada = juego.add.audio('llegada');
        juego.canvas.setAttribute('tabindex', '0');
        juego.canvas.setAttribute('aria-label', 'Océano y dos barcos. Usa voz o teclado para navegar y disparar.');
        cargado = true;
        document.getElementById('iniciar').disabled = false;
    },

    update: function () {
        mar.tilePosition.x -= 0.25;
    }
};

// =====================================================
// 2. CREAR Y ACTUALIZAR LA TRAVESÍA
// =====================================================
var estadoJuego = {
    preload: function () {
        // La portada ya cargó las imágenes y sonidos.
    },

    create: function () {
        pantalla = 'jugando';
        pausado = false;
        largoRuta = 2800;
        if (nivel == 2) {
            largoRuta = 3400;
        }
        juego.world.setBounds(0, 0, largoRuta, 540);
        juego.physics.startSystem(Phaser.Physics.ARCADE);
        juego.physics.arcade.gravity.y = 0;
        juego.physics.arcade.isPaused = false;
        fondoJuego = juego.add.sprite(0, 0, 'cielo');
        fondoJuego.width = 960;
        fondoJuego.height = 215;
        fondoJuego.fixedToCamera = true;
        mar = juego.add.tileSprite(0, 215, 960, 325, 'mar');
        mar.tileScale.setTo(325 / juego.cache.getImage('mar').height);
        mar.fixedToCamera = true;
        var puerto = juego.add.sprite(largoRuta - 220, 255, 'puerto');
        ajustarTamano(puerto, 180, 270);
        var letrero = juego.add.text(largoRuta - 205, 210, 'PUERTO DE DESTINO', {
            font: 'bold 15px Arial', fill: '#fff1b6'
        });
        letrero.resolution = 2;
        letrero.padding.setTo(4, 4);

        barcos = [];
        crearBarco(120, 295, 'barcoUno', 0);
        if (numeroJugadores == 2) {
            crearBarco(170, 385, 'barcoDos', 1);
        }
        enemigos = juego.add.group();
        enemigos.enableBody = true;
        balasJugadores = juego.add.group();
        balasJugadores.enableBody = true;
        balasEnemigas = juego.add.group();
        balasEnemigas.enableBody = true;
        rocas = juego.add.group();
        rocas.enableBody = true;
        suministros = juego.add.group();
        suministros.enableBody = true;

        crearEnemigo(700, 285);
        crearEnemigo(1050, 410);
        crearEnemigo(1470, 310);
        crearEnemigo(1800, 410);
        crearEnemigo(2220, 280);
        if (nivel == 2) {
            crearEnemigo(2450, 415);
            crearEnemigo(2750, 330);
        }
        crearRoca(920, 445);
        crearRoca(1600, 245);
        crearRoca(2060, 430);
        crearSuministro(1190, 350, 'reparacion');
        crearSuministro(1920, 330, 'carga');
        crearSuministro(largoRuta - 450, 380, 'reparacion');

        // Capa para las explosiones, por encima de los barcos.
        efectos = juego.add.group();
        prepararTeclado();
        juego.input.keyboard.enabled = true;
        document.getElementById('tablero').hidden = false;
        document.getElementById('escenarioJuego').setAttribute('data-jugadores', numeroJugadores);
        document.getElementById('panelDos').hidden = numeroJugadores == 1;
        document.getElementById('nombreUno').textContent = 'J1 · ' + nombresJugadores[0];
        document.getElementById('nombreDos').textContent = 'J2 · ' + nombresJugadores[1];
        document.getElementById('pausar').disabled = false;
        seleccionarJugador(0);
        document.getElementById('portada').hidden = true;
        document.getElementById('pausaVisible').hidden = true;
        document.getElementById('pausar').textContent = 'Pausar';
        document.getElementById('nombreRuta').textContent = 'NIVEL ' + nivel + ' · CALLAO — GUAYAQUIL';
        if (nivel == 2) {
            document.getElementById('nombreRuta').textContent = 'NIVEL 2 · GUAYAQUIL — PANAMÁ';
        }
        mostrarMensaje('Llega al puerto y protege tu mercancía.');
        if (numeroJugadores == 2) {
            mostrarMensaje('Ambos jugadores deben llegar al puerto. Protejan su mercancía.');
        }
        actualizarTablero();
        juego.canvas.focus();
    },

    update: function () {
        if (pantalla != 'jugando' || pausado) {
            return;
        }
        for (var i = 0; i < barcos.length; i++) {
            actualizarBarco(barcos[i]);
        }
        actualizarEnemigos();
        juego.physics.arcade.overlap(balasJugadores, enemigos, acertarEnemigo);
        juego.physics.arcade.overlap(balasJugadores, rocas, balaContraRoca);
        juego.physics.arcade.overlap(balasEnemigas, rocas, balaContraRoca);
        for (var j = 0; j < barcos.length; j++) {
            juego.physics.arcade.overlap(barcos[j], balasEnemigas, recibirDisparo);
            juego.physics.arcade.overlap(barcos[j], enemigos, chocarEnemigo);
            juego.physics.arcade.overlap(barcos[j], rocas, chocarRoca);
            juego.physics.arcade.overlap(barcos[j], suministros, recogerSuministro);
        }

        // La cámara acompaña al barco más retrasado, como un recorrido lateral.
        var primero = posicionDelUltimoBarco();
        juego.camera.x = Phaser.Math.clamp(primero - 160, 0, largoRuta - 960);
        mar.tilePosition.x = -juego.camera.x * 0.9 - juego.time.now * 0.015;
        actualizarTablero();
        if (todosEnPuerto() && pantalla == 'jugando') {
            terminarNivel();
        }
    }
};

// =====================================================
// 3. BARCOS, ENEMIGOS Y OBJETOS
// =====================================================
function crearBarco(x, y, imagen, numero) {
    var barco = juego.add.sprite(x, y, imagen);
    barco.anchor.setTo(0.5);
    // Los dos jugadores tienen cuatro fotogramas de navegación.
    barco.animations.add('navegar', [0, 1, 2, 3], 5, true);
    barco.animations.play('navegar');
    if (numero == 0) {
        ajustarTamano(barco, 194, 112);
    } else {
        ajustarTamano(barco, 200, 115);
    }
    juego.physics.arcade.enable(barco);
    barco.body.allowGravity = false;
    barco.body.collideWorldBounds = true;
    configurarCasco(barco);
    barco.numero = numero;
    barco.casco = 100;
    barco.carga = cargaInicial[numero];
    barco.direccionX = 0;
    barco.direccionY = 0;
    barco.disparoContinuo = false;
    barco.proximoDisparo = 0;
    barco.proteccionHasta = 0;
    barco.llego = false;
    var colorEtiqueta = '#f4d489';
    if (numero == 1) {
        colorEtiqueta = '#a1f4de';
    }
    barco.etiqueta = juego.add.text(x, y - 51, nombresJugadores[numero], {
        font: 'bold 14px Arial', fill: colorEtiqueta
    });
    barco.etiqueta.anchor.setTo(0.5);
    barco.etiqueta.resolution = 2;
    barco.etiqueta.padding.setTo(3, 3);
    barcos.push(barco);
}

function crearEnemigo(x, y) {
    var enemigo = enemigos.create(x, y, 'enemigo');
    enemigo.anchor.setTo(0.5);
    ajustarTamano(enemigo, 156, 90);
    enemigo.body.allowGravity = false;
    configurarCasco(enemigo);
    enemigo.health = 60;
    enemigo.alturaInicial = y;
    // Responder al entrar en alcance, sin esperar un segundo al aparecer.
    enemigo.proximoDisparo = juego.time.now;
}

function crearRoca(x, y) {
    var roca = rocas.create(x, y, 'roca');
    roca.anchor.setTo(0.5);
    ajustarTamano(roca, 96, 54);
    roca.body.setSize(roca.texture.frame.width * 0.76, roca.texture.frame.height * 0.56, roca.texture.frame.width * 0.12, roca.texture.frame.height * 0.24);
    roca.body.allowGravity = false;
    roca.body.immovable = true;
}

function crearSuministro(x, y, tipo) {
    var objeto = suministros.create(x, y, tipo);
    objeto.anchor.setTo(0.5);
    ajustarTamano(objeto, 52, 52);
    objeto.body.setSize(objeto.texture.frame.width * 0.55, objeto.texture.frame.height * 0.70, objeto.texture.frame.width * 0.25, objeto.texture.frame.height * 0.15);
    objeto.body.reset(objeto.x, objeto.y);
    objeto.tipo = tipo;
    objeto.body.allowGravity = false;
}

function actualizarBarco(barco) {
    barco.etiqueta.x = barco.x;
    barco.etiqueta.y = barco.y - 51;
    if (barco.llego) {
        barco.body.velocity.setTo(0);
        return;
    }
    var velocidadX = barco.direccionX * 120;
    if (numeroJugadores == 2) {
        var otro = barcos[1 - barco.numero];
        if (barco.x - otro.x > 580 && velocidadX > 0) {
            velocidadX = 0;
            mostrarMensaje('El barco adelantado espera a su compañero.');
        }
    }
    barco.body.velocity.x = velocidadX;
    barco.body.velocity.y = barco.direccionY * 95;
    var alturaMaxima = 445;
    barco.y = Phaser.Math.clamp(barco.y, 240, alturaMaxima);
    barco.x = Math.max(65, barco.x);
    if (barco.disparoContinuo) {
        disparar(barco.numero);
    }
    if (barco.numero == 0 && disparoUno.isDown) {
        disparar(0);
    }
    if (barco.numero == 1 && disparoDos.isDown) {
        disparar(1);
    }
    barco.alpha = 1;
    if (juego.time.now < barco.proteccionHasta) {
        barco.alpha = 0.65;
    }
    if (barco.x >= largoRuta - 150) {
        barco.llego = true;
        barco.direccionX = 0;
        barco.direccionY = 0;
        barco.disparoContinuo = false;
        barco.body.velocity.setTo(0);
        reproducirSonido('llegada');
        mostrarMensaje(nombresJugadores[barco.numero] + ' llegó al puerto.');
        if (numeroJugadores == 2 && !todosEnPuerto()) {
            mostrarMensaje(nombresJugadores[barco.numero] + ' llegó. Esperando a su compañero.');
        }
    }
}

function actualizarEnemigos() {
    enemigos.forEachAlive(function (enemigo) {
        var objetivo = null;
        var distanciaMenor = Infinity;
        for (var i = 0; i < barcos.length; i++) {
            var distancia = Phaser.Math.distance(enemigo.x, enemigo.y, barcos[i].x, barcos[i].y);
            if (!barcos[i].llego && distancia < 600 && distancia < distanciaMenor) {
                objetivo = barcos[i];
                distanciaMenor = distancia;
            }
        }
        if (!objetivo) {
            return;
        }
        enemigo.y = enemigo.alturaInicial + Math.sin(juego.time.now / 1100 + enemigo.x) * 14;
        if (!objetivo.llego) {
            if (juego.time.now >= enemigo.proximoDisparo) {
                // Apuntar al jugador más cercano que esté dentro del alcance.
                var salidaX = enemigo.x - 42;
                if (objetivo.x > enemigo.x) {
                    salidaX = enemigo.x + 42;
                }
                var bala = balasEnemigas.create(salidaX, enemigo.y + 22, 'balaEnemiga');
                bala.anchor.setTo(0.5);
                configurarBala(bala, true);
                bala.body.allowGravity = false;
                juego.physics.arcade.moveToXY(bala, objetivo.body.center.x, objetivo.body.center.y, 155);
                bala.lifespan = 4200;
                enemigo.proximoDisparo = juego.time.now + 1900;
                if (nivel == 2) {
                    enemigo.proximoDisparo = juego.time.now + 1550;
                }
            }
        }
    });
}

// =====================================================
// 4. MOVIMIENTO Y CAÑONES
// =====================================================
function puedeJugar() {
    return pantalla == 'jugando' && !pausado;
}

function moverBarco(numero, orden) {
    if (!puedeJugar() || !barcos[numero] || barcos[numero].llego) {
        return;
    }
    var barco = barcos[numero];
    if (orden == 'avanzar') {
        barco.direccionX = 1;
    } else if (orden == 'retroceder') {
        barco.direccionX = -1;
    } else if (orden == 'arriba') {
        barco.direccionY = -1;
    } else if (orden == 'abajo') {
        barco.direccionY = 1;
    } else if (orden == 'parar') {
        barco.direccionX = 0;
        barco.direccionY = 0;
        barco.body.velocity.setTo(0);
    } else if (orden == 'disparar') {
        barco.disparoContinuo = true;
        disparar(numero);
    } else if (orden == 'cesar') {
        barco.disparoContinuo = false;
    }
}

function disparar(numero) {
    if (!puedeJugar() || !barcos[numero]) {
        return;
    }
    var barco = barcos[numero];
    if (barco.llego || juego.time.now < barco.proximoDisparo) {
        return;
    }
    var bala = balasJugadores.create(barco.x + 46, barco.y + 22, 'bala');
    bala.anchor.setTo(0.5);
    configurarBala(bala, false);
    bala.body.allowGravity = false;
    bala.body.velocity.x = 440;
    bala.lifespan = 1900;
    barco.proximoDisparo = juego.time.now + 380;
    reproducirSonido('disparo');
}

function detenerTodos() {
    for (var i = 0; i < barcos.length; i++) {
        barcos[i].direccionX = 0;
        barcos[i].direccionY = 0;
        barcos[i].disparoContinuo = false;
        barcos[i].body.velocity.setTo(0);
    }
}

// =====================================================
// 5. IMPACTOS, CARGA Y SATISFACCIÓN
// =====================================================
function acertarEnemigo(bala, enemigo) {
    if (!bala.alive || !enemigo.alive || !puedeJugar()) {
        return;
    }
    bala.kill();
    enemigo.damage(34);
    explotar(enemigo.x, enemigo.y + 20, !enemigo.alive);
    if (!enemigo.alive) {
        crearSuministro(enemigo.x, enemigo.y + 30, 'carga');
    }
    reproducirSonido('impacto');
}

function balaContraRoca(bala) {
    bala.kill();
    reproducirSonido('impacto');
}

function recibirDisparo(barco, bala) {
    if (bala.alive) {
        bala.kill();
        aplicarDano(barco, 18, 6);
    }
}

function chocarEnemigo(barco, enemigo) {
    enemigo.kill();
    aplicarDano(barco, 26, 10);
}

function chocarRoca(barco) {
    aplicarDano(barco, 20, 8);
}

function aplicarDano(barco, danoCasco, danoCarga) {
    if (!puedeJugar() || barco.llego || juego.time.now < barco.proteccionHasta) {
        return;
    }
    barco.casco = Math.max(0, barco.casco - danoCasco);
    barco.carga = Math.max(0, barco.carga - danoCarga);
    barco.proteccionHasta = juego.time.now + 950;
    explotar(barco.x, barco.y + 20, barco.casco == 0);
    reproducirSonido('impacto');
    juego.camera.shake(0.004, 130);
    mostrarMensaje('J' + (barco.numero + 1) + ' recibió un impacto. Protejan la mercancía y busquen suministros.');
    if (barco.casco == 0) {
        finalizarPartida(false, 'Un barco se ha hundido. Puedes reintentar este tramo con los mismos jugadores.');
    }
}

function recogerSuministro(barco, objeto) {
    if (!objeto.alive || !puedeJugar() || barco.llego) {
        return;
    }
    objeto.kill();
    if (objeto.tipo == 'carga') {
        barco.carga = Math.min(100, barco.carga + 8);
        mostrarMensaje('J' + (barco.numero + 1) + ' recuperó mercancía.');
    } else {
        barco.casco = Math.min(100, barco.casco + 24);
        mostrarMensaje('J' + (barco.numero + 1) + ' reparó parte del casco.');
    }
    reproducirSonido('recoger');
}

function calcularSatisfaccion() {
    var cargaTotal = 0;
    for (var i = 0; i < barcos.length; i++) {
        cargaTotal = cargaTotal + barcos[i].carga;
    }
    return Math.round(cargaTotal / barcos.length);
}

function posicionDelUltimoBarco() {
    var posicion = barcos[0].x;
    for (var i = 1; i < barcos.length; i++) {
        posicion = Math.min(posicion, barcos[i].x);
    }
    return posicion;
}

function todosEnPuerto() {
    for (var i = 0; i < barcos.length; i++) {
        if (!barcos[i].llego) {
            return false;
        }
    }
    return barcos.length > 0;
}

function terminarNivel() {
    detenerTodos();
    juego.physics.arcade.isPaused = true;
    reproducirSonido('llegada');
    if (nivel == 1) {
        pantalla = 'cambioNivel';
        mostrarPortada('PRIMER TRAMO COMPLETADO', 'Puerto de Guayaquil',
            'Entrega completada. La mercancía conservada pasa al siguiente tramo.', 'Continuar a Panamá');
    } else if (calcularSatisfaccion() >= 60) {
        finalizarPartida(true, 'Ruta completada. Satisfacción de la entrega ' + calcularSatisfaccion() + '%.');
    } else {
        finalizarPartida(false, 'Llegaron los barcos, pero se requiere al menos 60% de mercancía conservada. Pueden repetir el segundo tramo.');
    }
}

function finalizarPartida(victoria, mensaje) {
    pantalla = 'derrota';
    detenerTodos();
    juego.physics.arcade.isPaused = true;
    if (victoria) {
        pantalla = 'victoria';
        mostrarPortada('MISIÓN COMPLETADA', 'La carga llegó a puerto', mensaje, 'Navegar de nuevo');
    } else {
        mostrarPortada('TRAVESÍA INTERRUMPIDA', 'Reúnan de nuevo al convoy', mensaje, 'Reintentar tramo');
    }
    mostrarMensaje('Satisfacción de entrega ' + calcularSatisfaccion() + '%. Di «continuar» o pulsa el botón.');
    actualizarTablero();
}

// =====================================================
// 6. INTERFAZ Y CAMBIOS DE PANTALLA
// =====================================================
function iniciarJuego() {
    if (!cargado || pantalla == 'jugando') {
        return;
    }
    if (!partidaConfigurada && !guardarConfiguracion()) {
        return;
    }
    if (juego.sound.context && juego.sound.context.state == 'suspended') {
        juego.sound.context.resume();
    }
    if (pantalla == 'cambioNivel') {
        nivel = 2;
        cargaInicial = [];
        for (var i = 0; i < barcos.length; i++) {
            cargaInicial.push(barcos[i].carga);
        }
    } else if (pantalla != 'derrota') {
        nivel = 1;
        cargaInicial = [100, 100];
    }
    juego.state.start('partida');
}

function actualizarTablero() {
    var nombres = ['Uno', 'Dos'];
    for (var i = 0; i < barcos.length; i++) {
        var barco = barcos[i];
        document.getElementById('casco' + nombres[i]).value = barco.casco;
        document.getElementById('carga' + nombres[i]).value = barco.carga;
        document.getElementById('valorCasco' + nombres[i]).textContent = barco.casco + '%';
        document.getElementById('valorCarga' + nombres[i]).textContent = barco.carga + '%';
        document.getElementById('estado' + nombres[i]).textContent = 'Navegando';
        if (barco.llego) {
            document.getElementById('estado' + nombres[i]).textContent = 'En puerto';
        }
        if (barco.casco == 0) {
            document.getElementById('estado' + nombres[i]).textContent = 'Hundido';
        }
    }
    document.getElementById('satisfaccion').innerHTML = calcularSatisfaccion() + '% <small>satisfacción de entrega</small>';
    var avance = (posicionDelUltimoBarco() - 120) / (largoRuta - 270);
    avance = Math.round(Phaser.Math.clamp(avance, 0, 1) * 100);
    document.getElementById('barraRuta').style.width = avance + '%';
    document.getElementById('avanceRuta').textContent = 'Avance de la ruta ' + avance + '%';
    if (numeroJugadores == 2) {
        document.getElementById('avanceRuta').textContent = 'Convoy ' + avance + '% · deben llegar ambos';
    }
}

function mostrarPortada(etiqueta, titulo, descripcion, boton) {
    document.getElementById('etiqueta').textContent = etiqueta;
    document.getElementById('titulo').textContent = titulo;
    document.getElementById('subtitulo').textContent = 'El Galeón del Callao y la Ruta del Pacífico';
    document.getElementById('descripcion').textContent = descripcion;
    document.getElementById('iniciar').textContent = boton;
    document.getElementById('portada').hidden = false;
    document.getElementById('configuracionPartida').hidden = true;
    document.getElementById('configuracionPartida').disabled = true;
    document.getElementById('cambiarJugadores').hidden = false;
    document.getElementById('tablero').hidden = true;
    document.getElementById('pausar').disabled = true;
    juego.input.keyboard.enabled = false;
}

function mostrarMensaje(mensaje) {
    document.getElementById('mensaje').textContent = mensaje;
}

// El navegador habilita el audio al hacer clic o pulsar una tecla.
function activarAudio() {
    if (juego.sound.context && juego.sound.context.state == 'suspended') {
        juego.sound.context.resume();
    }
}
document.addEventListener('pointerdown', activarAudio);
document.addEventListener('keydown', activarAudio);

function reproducirSonido(nombre) {
    if (sonidoActivo && sonidos[nombre]) {
        activarAudio();
        sonidos[nombre].play('', 0, 0.75, false, true);
    }
}

// Fuego que se expande, destello y humo que sube y desaparece.
// grande diferencia la destrucción de un barco de un impacto normal.
function explotar(x, y, grande) {
    var explosion = juego.add.group(efectos);
    explosion.name = 'explosion';
    explosion.x = x;
    explosion.y = y;
    if (grande) {
        explosion.scale.setTo(1.6);
    }

    var humo = juego.add.graphics(0, 0, explosion);
    humo.beginFill(0x64717a, 0.8);
    humo.drawCircle(-15, -8, 36);
    humo.drawCircle(15, -12, 40);
    humo.drawCircle(0, -24, 36);
    humo.endFill();
    humo.scale.setTo(0.3);
    juego.add.tween(humo.scale).to({x: 1.4, y: 1.4}, 950, Phaser.Easing.Quadratic.Out, true);
    juego.add.tween(humo).to({y: -38, alpha: 0}, 950, Phaser.Easing.Linear.None, true, 120).onComplete.add(function () {
        explosion.destroy();
    });

    var fuego = juego.add.graphics(0, 0, explosion);
    fuego.beginFill(0xd85b28);
    fuego.drawCircle(0, 0, 62);
    fuego.drawCircle(-22, -8, 30);
    fuego.drawCircle(20, -14, 34);
    fuego.drawCircle(8, 20, 30);
    fuego.endFill();
    fuego.beginFill(0xffb52e);
    fuego.drawCircle(0, 0, 45);
    fuego.drawCircle(-12, -9, 28);
    fuego.drawCircle(12, 6, 28);
    fuego.endFill();
    fuego.beginFill(0xffed8a);
    fuego.drawCircle(0, -2, 25);
    fuego.endFill();
    fuego.scale.setTo(0.2);
    juego.add.tween(fuego.scale).to({x: 1.1, y: 1.1}, 180, Phaser.Easing.Quadratic.Out, true);
    juego.add.tween(fuego).to({alpha: 0}, 350, Phaser.Easing.Linear.None, true, 160);

    var destello = juego.add.graphics(0, 0, explosion);
    destello.lineStyle(3, 0xffd76b, 0.9);
    destello.drawCircle(0, 0, 34);
    juego.add.tween(destello.scale).to({x: 2.5, y: 2.5}, 420, Phaser.Easing.Quadratic.Out, true);
    juego.add.tween(destello).to({alpha: 0}, 420, Phaser.Easing.Linear.None, true);
}

function pausarJuego() {
    if (pantalla != 'jugando') {
        return;
    }
    pausado = !pausado;
    detenerTodos();
    juego.physics.arcade.isPaused = pausado;
    if (pausado) {
        juego.tweens.pauseAll();
    } else {
        juego.tweens.resumeAll();
    }
    document.getElementById('pausaVisible').hidden = !pausado;
    document.getElementById('pausar').textContent = 'Reanudar';
    if (!pausado) {
        document.getElementById('pausar').textContent = 'Pausar';
        juego.canvas.focus();
    }
}

// =====================================================
// 7. TECLADO. FLECHAS PARA J1, WASD PARA J2
// =====================================================
function prepararTeclado() {
    juego.input.keyboard.destroy();
    juego.input.keyboard.start();
    teclasUno = juego.input.keyboard.createCursorKeys();
    teclasDos = {
        up: juego.input.keyboard.addKey(Phaser.Keyboard.W),
        down: juego.input.keyboard.addKey(Phaser.Keyboard.S),
        left: juego.input.keyboard.addKey(Phaser.Keyboard.A),
        right: juego.input.keyboard.addKey(Phaser.Keyboard.D)
    };
    disparoUno = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    disparoDos = juego.input.keyboard.addKey(Phaser.Keyboard.F);
    // Disparar también al pulsar una vez, sin esperar al siguiente update.
    disparoUno.onDown.add(function () {
        disparar(0);
    });
    disparoDos.onDown.add(function () {
        if (numeroJugadores == 2) {
            disparar(1);
        }
    });
    conectarTeclas(teclasUno, 0);
    if (numeroJugadores == 2) {
        conectarTeclas(teclasDos, 1);
    }
    juego.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(pausarJuego);
}

function conectarTeclas(teclas, numero) {
    teclas.right.onDown.add(function () {
        moverBarco(numero, 'avanzar');
    });
    teclas.left.onDown.add(function () {
        moverBarco(numero, 'retroceder');
    });
    teclas.up.onDown.add(function () {
        moverBarco(numero, 'arriba');
    });
    teclas.down.onDown.add(function () {
        moverBarco(numero, 'abajo');
    });
    teclas.right.onUp.add(function () {
        barcos[numero].direccionX = 0;
    });
    teclas.left.onUp.add(function () {
        barcos[numero].direccionX = 0;
    });
    teclas.up.onUp.add(function () {
        barcos[numero].direccionY = 0;
    });
    teclas.down.onUp.add(function () {
        barcos[numero].direccionY = 0;
    });
}

document.getElementById('formularioInicio').onsubmit = function (evento) {
    evento.preventDefault();
    iniciarJuego();
};
document.getElementById('modoSolo').onchange = actualizarFormulario;
document.getElementById('modoDuo').onchange = actualizarFormulario;
document.getElementById('cambiarJugadores').onclick = cambiarJugadores;
document.getElementById('pausar').onclick = pausarJuego;
document.getElementById('sonido').onclick = function () {
    sonidoActivo = !sonidoActivo;
    document.getElementById('sonido').textContent = 'Sonido desactivado';
    if (sonidoActivo) {
        activarAudio();
        document.getElementById('sonido').textContent = 'Sonido activo';
    }
    juego.canvas.focus();
};
window.addEventListener('blur', detenerTodos);
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        detenerTodos();
        if (pantalla == 'jugando' && !pausado) {
            pausarJuego();
        }
        apagarMicrofono();
    }
});
// Ajustar las imágenes nuevas sin modificar sus archivos originales.
function ajustarTamano(objeto, anchoMaximo, altoMaximo) {
    var escala = Math.min(anchoMaximo / objeto.width, altoMaximo / objeto.height);
    objeto.scale.setTo(escala);
}

function configurarCasco(barco) {
    var ancho = barco.texture.frame.width;
    var alto = barco.texture.frame.height;
    barco.body.setSize(ancho * 0.64, alto * 0.16, ancho * 0.18, alto * 0.74);
    barco.body.reset(barco.x, barco.y);
}

function configurarBala(bala, enemiga) {
    ajustarTamano(bala, 42, 22);
    var ancho = bala.texture.frame.width;
    var alto = bala.texture.frame.height;
    bala.body.setSize(ancho * 0.28, alto * 0.54, ancho * 0.50, alto * 0.24);
    if (enemiga) {
        bala.scale.setTo(Math.min(64 / ancho, 34 / alto));
        bala.body.setSize(ancho * 0.23, alto * 0.44, ancho * 0.29, alto * 0.28);
    }
    // Sincronizar tamaño y posición antes de comprobar colisiones en este frame.
    bala.body.reset(bala.x, bala.y);
}

// Configuración antes de crear los barcos.
function actualizarFormulario() {
    var conCompanero = document.getElementById('modoDuo').checked;
    document.getElementById('campoJugadorDos').hidden = !conCompanero;
    document.getElementById('nombreJugadorDos').disabled = !conCompanero;
    document.getElementById('nombreJugadorDos').required = conCompanero;
    document.getElementById('controlesDos').hidden = !conCompanero;
}

function guardarConfiguracion() {
    var formulario = document.getElementById('formularioInicio');
    var entradaUno = document.getElementById('nombreJugadorUno');
    var entradaDos = document.getElementById('nombreJugadorDos');
    entradaUno.value = entradaUno.value.trim();
    entradaDos.value = entradaDos.value.trim();
    if (!formulario.reportValidity()) {
        return false;
    }
    numeroJugadores = 1;
    if (document.getElementById('modoDuo').checked) {
        numeroJugadores = 2;
    }
    nombresJugadores = [entradaUno.value, entradaDos.value];
    partidaConfigurada = true;
    document.getElementById('configuracionPartida').hidden = true;
    document.getElementById('configuracionPartida').disabled = true;
    document.getElementById('modoActual').textContent = '1 JUGADOR · ' + nombresJugadores[0];
    document.getElementById('escuchado').textContent = 'Di avanzar, disparar o parar.';
    if (numeroJugadores == 2) {
        document.getElementById('modoActual').textContent = '2 JUGADORES · COOPERATIVO LOCAL';
        document.getElementById('escuchado').textContent = 'Di uno avanzar, dos disparar o ambos parar.';
    }
    return true;
}

function cambiarJugadores() {
    detenerTodos();
    apagarMicrofono();
    pantalla = 'portada';
    partidaConfigurada = false;
    document.getElementById('configuracionPartida').hidden = false;
    document.getElementById('configuracionPartida').disabled = false;
    document.getElementById('cambiarJugadores').hidden = true;
    document.getElementById('titulo').textContent = 'El Galeón del Callao';
    document.getElementById('etiqueta').textContent = 'PREPARA TU TRAVESÍA';
    document.getElementById('subtitulo').textContent = 'Elige cómo deseas jugar y escribe los nombres.';
    document.getElementById('descripcion').textContent = 'Navega, protege la mercancía y llega al puerto.';
    document.getElementById('iniciar').textContent = 'Comenzar travesía';
    document.getElementById('modoActual').textContent = 'PREPARAR PARTIDA';
    actualizarFormulario();
    document.getElementById('nombreJugadorUno').focus();
}

juego.state.add('principal', principal);
juego.state.add('partida', estadoJuego);
juego.state.start('principal');






