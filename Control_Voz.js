// VOZ COMPARTIDA POR LOS DOS JUGADORES.
// Decir «uno», «dos» o «ambos» selecciona los barcos de la siguiente orden.
var reconocimiento;
var microfonoEncendido = false;
var jugadorSeleccionado = 0;
var ordenesProcesadas = [];
var esperaMicrofono;

function reconocerOrden(palabra) {
    if (palabra == 'avanzar' || palabra == 'avanzando' || palabra == 'avanza') {
        return 'avanzar';
    }
    if (palabra == 'retroceder' || palabra == 'retrocede' || palabra == 'retrocediendo') {
        return 'retroceder';
    }
    if (palabra == 'arriba' || palabra == 'subir') {
        return 'arriba';
    }
    if (palabra == 'abajo' || palabra == 'bajar') {
        return 'abajo';
    }
    if (palabra == 'alto' || palabra == 'parar' || palabra == 'para' || palabra == 'detener' || palabra == 'stop') {
        return 'parar';
    }
    if (palabra == 'disparar' || palabra == 'dispara' || palabra == 'fuego') {
        return 'disparar';
    }
    if (palabra == 'cesar' || palabra == 'silencio') {
        return 'cesar';
    }
    if (palabra == 'continuar' || palabra == 'reintentar' || palabra == 'zarpar') {
        return 'continuar';
    }
    return '';
}

function seleccionarJugador(numero) {
    jugadorSeleccionado = numero;
    var mensaje = 'Órdenes para ' + nombresJugadores[0];
    if (numero == 1) {
        mensaje = 'Órdenes para ' + nombresJugadores[1];
        if (numeroJugadores == 1) {
            mensaje = 'El jugador 2 no participa en esta partida';
        }
    }
    if (numero == 2 && numeroJugadores == 2) {
        mensaje = 'Órdenes para ambos jugadores';
    }
    document.getElementById('destinatario').textContent = mensaje;
}

function ejecutarOrden(numero, orden) {
    if (orden == 'continuar' && pantalla != 'jugando') {
        iniciarJuego();
        return;
    }
    if (!puedeJugar()) {
        return;
    }
    if (numero == 2) {
        for (var i = 0; i < barcos.length; i++) {
            moverBarco(i, orden);
        }
    } else if (numero < barcos.length) {
        moverBarco(numero, orden);
    } else {
        mostrarMensaje('En modo individual, da la orden directamente o di uno.');
    }
}

function recibirVoz(evento) {
    if (!microfonoEncendido) {
        return;
    }
    for (var i = evento.resultIndex; i < evento.results.length; i++) {
        var resultado = evento.results[i];
        var frase = resultado[0].transcript;
        document.getElementById('escuchado').textContent = 'Escuchado · ' + frase;
        frase = frase.toLowerCase();
        frase = frase.normalize('NFD');
        frase = frase.replace(/[\u0300-\u036f]/g, '');
        frase = frase.trim();
        var palabras = frase.split(/[^a-z0-9]+/);
        if (!ordenesProcesadas[i]) {
            ordenesProcesadas[i] = [];
        }
        for (var j = 0; j < palabras.length; j++) {
            var palabra = palabras[j];
            if (palabra == 'uno' || palabra == '1' || palabra == 'primero') {
                seleccionarJugador(0);
            }
            if (palabra == 'dos' || palabra == '2' || palabra == 'segundo') {
                seleccionarJugador(1);
            }
            if (palabra == 'ambos' || palabra == 'todos') {
                seleccionarJugador(2);
            }
            var orden = reconocerOrden(palabra);
            if (orden == '') {
                continue;
            }
            if (orden == 'continuar' && !resultado.isFinal) {
                continue;
            }
            var clave = j + ':' + jugadorSeleccionado + ':' + orden;
            if (ordenesProcesadas[i].indexOf(clave) == -1) {
                ordenesProcesadas[i].push(clave);
                ejecutarOrden(jugadorSeleccionado, orden);
            }
        }
    }
}

function activarMicrofono() {
    var ServicioVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!ServicioVoz) {
        mostrarMensaje('Prueba el micrófono en Chrome o Edge. También puedes usar el teclado.');
        return;
    }
    reconocimiento = new ServicioVoz();
    reconocimiento.lang = 'es-PE';
    reconocimiento.continuous = true;
    reconocimiento.interimResults = true;
    microfonoEncendido = true;
    ordenesProcesadas = [];
    reconocimiento.onstart = function () {
        document.getElementById('estadoMicrofono').textContent = 'Escuchando';
        if (partidaConfigurada) {
            document.getElementById('estadoMicrofono').textContent = 'Escuchando a ' + nombresJugadores[0];
            if (numeroJugadores == 2) {
                document.getElementById('estadoMicrofono').textContent = 'Escuchando a ambos jugadores';
            }
        }
        document.getElementById('microfono').textContent = 'Apagar micrófono';
    };
    reconocimiento.onresult = recibirVoz;
    reconocimiento.onerror = function (evento) {
        if (evento.error == 'not-allowed' || evento.error == 'service-not-allowed' || evento.error == 'audio-capture') {
            apagarMicrofono();
            mostrarMensaje('Revisa el permiso y la conexión del micrófono.');
        } else if (evento.error == 'network') {
            apagarMicrofono();
            mostrarMensaje('Falló la conexión del servicio de voz. Vuelve a activar el micrófono.');
        }
    };
    reconocimiento.onend = function () {
        ordenesProcesadas = [];
        if (microfonoEncendido) {
            document.getElementById('estadoMicrofono').textContent = 'Reconectando escucha…';
            esperaMicrofono = setTimeout(function () {
                if (microfonoEncendido) {
                    iniciarEscucha();
                }
            }, 300);
        }
    };
    iniciarEscucha();
    juego.canvas.focus();
}

function iniciarEscucha() {
    try {
        reconocimiento.start();
    } catch (error) {
        apagarMicrofono();
        mostrarMensaje('No se pudo iniciar el micrófono. Puedes volver a intentarlo.');
    }
}

function apagarMicrofono() {
    microfonoEncendido = false;
    clearTimeout(esperaMicrofono);
    if (reconocimiento) {
        reconocimiento.onend = null;
        reconocimiento.abort();
    }
    ordenesProcesadas = [];
    detenerTodos();
    document.getElementById('microfono').textContent = 'Activar micrófono';
    document.getElementById('estadoMicrofono').textContent = 'Voz desactivada';
}

document.getElementById('microfono').onclick = function () {
    if (microfonoEncendido) {
        apagarMicrofono();
    } else {
        activarMicrofono();
    }
};
