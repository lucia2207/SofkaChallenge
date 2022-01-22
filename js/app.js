/* Clases */
class Juego{
    constructor (){

        this.categorias = [];
        this.puntaje = 0;
        this.acumulado = 0;
        this.dificultad = 1;
        this.categoria = null;
    }

    addCategoria(nombre, dificultad, premio){

        let categoria = new Categoria(nombre, dificultad, premio);
        this.categorias.push(categoria);
        return categoria;
    }

    configurar(preguntas){
        
        // Recorro toda la estructura de preguntas y las cargo en memoria
        for(let i = 0; i < preguntas.length; i++){
            let categoria = preguntas[i]; 
            let nuevaCategoria = this.addCategoria(categoria.nombre, categoria.dificultad, categoria.premio);
            
            for(let j = 0; j < categoria.preguntas.length; j++){
                let pregunta = categoria.preguntas[j];
                nuevaCategoria.addPregunta(pregunta.pregunta, pregunta.correcta, pregunta.opciones[0], pregunta.opciones[1], pregunta.opciones[2]);
            };
        };

        // Si hay datos en la persistencia, cargarlos
        if (localStorage.getItem('jugador') == null){
            this.desdeCero();
        }

        let jugador = JSON.parse(localStorage.getItem('jugador'));

        this.acumulado = jugador.acumulado;

        // Actualizar div de puntajes
        if (this.acumulado > 0){
            let puntajes = document.getElementById('puntaje');
            puntajes.innerHTML = `Puntaje acumulado: ${ this.acumulado }`;
        }
    }

    desdeCero (){
        let nuevo = {
            acumulado: 0
        };

        localStorage.setItem('jugador', JSON.stringify(nuevo));
    }

    iniciar (){
        this.iniciarRonda(this.dificultad);
    }

    iniciarRonda (dificultad){
        // Encontrar entre las categorias la categoria que tenga la dificultad esa
        let categoria = this.categorias.find(function (elemento){
            return elemento.dificultad == dificultad;
        });

        juego.categoria = categoria;

        let pregunta = categoria.obtenerPreguntaAleatoria();

        this.mostrarPregunta(pregunta);
    }

    mostrarPregunta (pregunta){
        // Referencia a la instancia de Juego
        let juego = this;

        // Limpiar el contenedor del juego en el HTML
        this.limpiarContenedor();

        // Obtengo el contenedor del juego en el HTML
        let contenedor = document.getElementById('juego');

        // Crear un h2 para contener la pregunta
        let titulo = document.createElement('h2');
        titulo.innerHTML = pregunta.pregunta;
        contenedor.append(titulo);

        // Crear un p para contener categoria y premio
        let parrafo = document.createElement('p');
        parrafo.classList.add('puntos');
        parrafo.innerHTML = `${ juego.categoria.nombre } - Premio: ${ juego.categoria.premio }`;
        contenedor.append(parrafo);

        // Crear botones de las opciones
        let opciones = pregunta.opciones.concat([ pregunta.correcta ]);
        opciones.sort(function (a,b){
            return Math.random() - 0.5;
        });

        for (let i = 0; i < opciones.length; i++){
            // Crear un botón para el HTML
            let opcion = opciones[ i ];
            let boton = document.createElement('button');
            boton.innerHTML = opcion;
            contenedor.append(boton);

            // Evento click
            boton.addEventListener('click', function (evento){
                if (pregunta.esRespuestaCorrecta(evento.target.innerHTML)){
                    // Debemos otorgar premio
                    juego.puntaje = juego.puntaje + juego.categoria.premio;

                    if (juego.dificultad == 5){
                        // Finalizar el juego
                        juego.finalizar(false);
                    }
                    else{
                        // Aumentamos el nivel
                        juego.dificultad++;
                        juego.iniciarRonda(juego.dificultad);
                    }
                }
                else{
                    juego.finalizar(true);
                }
            });
        }
    }

    limpiarContenedor (){
        let contenedor = document.getElementById('juego');
        contenedor.innerHTML = '';

        // Actualizar div de puntajes
        let puntajes = document.getElementById('puntaje');
        puntajes.innerHTML = `Puntaje actual: ${ this.puntaje }`;
    }

    finalizar (forzado){
        this.limpiarContenedor();

        // Limpiar pie de puntajes
        document.getElementById('puntaje').innerHTML = '';

        let contenedor = document.getElementById('juego');
        let mensaje = '';
        let juego = this;

        // Sumar puntos ganados al acumulado
        juego.acumulado = juego.acumulado + juego.puntaje;

        // Actualizar persistencia
        this.actualizarPersistencia();

        if (forzado){
            // Fin forzado
            mensaje = 'Perdiste';
        }
        else{
            // Fin bueno
            mensaje = 'Ganaste';
        }
        
        let titulo = document.createElement('h2');
        titulo.innerHTML = mensaje;
        contenedor.append(titulo);

        let puntos = document.createElement('p');
        puntos.classList.add('puntos');
        puntos.innerHTML = `Ganaste ${ juego.puntaje } puntos. Tenés ${ juego.acumulado } puntos acumulados`;
        contenedor.append(puntos);

        let reiniciar = document.createElement('button');
        reiniciar.innerHTML = 'Volver a empezar';
        contenedor.append(reiniciar);

        let salir = document.createElement('button');
        salir.innerHTML = 'Salir';
        contenedor.append(salir);

        // Eventos
        reiniciar.addEventListener('click', function (evento){
            juego.reiniciarJuego();
        });

        salir.addEventListener('click', function (evento){
            juego.salir();
        });
    }

    actualizarPersistencia (){
        // Obtener la persistencia actual
        let persistencia = JSON.parse(localStorage.getItem('jugador'));

        // Actualizar valores
        persistencia.acumulado = this.acumulado;

        // Persistir nuevos datos
        localStorage.setItem('jugador', JSON.stringify(persistencia));
    }

    reiniciarJuego (){
        this.puntaje = 0;
        this.dificultad = 1;
        this.iniciar();
    }

    salir (){
        document.location.reload()
    }
}

class Categoria{
    constructor (nombre, dificultad, premio){
        this.nombre = nombre;
        this.dificultad = dificultad;
        this.premio = premio;
        this.preguntas = [];
    }

    addPregunta (pregunta, correcta, op1, op2, op3){
        let nuevaPregunta = new Pregunta(pregunta, correcta, op1, op2, op3);
        this.preguntas.push(nuevaPregunta);
        return nuevaPregunta;
    }

    obtenerPreguntaAleatoria (){
        // Esto ordena las preguntas de forma aleatoria
        this.preguntas.sort(function (a, b){
            return Math.random() - 0.5;
        });

        return this.preguntas[2]; // Devuelvo la segunda porque quiero
    }
}

class Pregunta{
    constructor (pregunta, correcta, op1, op2, op3){
        this.pregunta = pregunta;
        this.correcta = correcta;
        this.opciones = [ op1, op2, op3 ];
    }

    esRespuestaCorrecta (respuesta){
        return this.correcta == respuesta;
    }
}

let juego = new Juego();

// Configurar juego (data es una constante)
juego.configurar(data);

// Iniciar el juego
let botInicio = document.getElementById('iniciar');
botInicio.addEventListener('click', function (evento){
    juego.iniciar();
});

// Reiniciar puntaje acumulado
let botReiniciarPuntos = document.getElementById('resetear');
botReiniciarPuntos.addEventListener('click', function (evento){

    if (confirm('¿Está seguro que quiere reiniciar el puntaje?')){
        juego.desdeCero();

        document.getElementById('puntaje').innerHTML = '';
    }
});
