## DW NOTAS
--- 

Presentacion Spring 1 y 2

---
# 1. DESCRIPCION DEL PROYECTO "DW NOTAS"

Esta aplicacion web esta orientada a la organizacion y seguimiento de las actividades tipo academicas
el objetivo principal es llevar una planificacion de las tareas, consultar materias, el progreso de las actividades 
facilitando una vision mas clara y controlada de estos compromisos academicos. 

Tambien esta orientado a facilitar las consultas de tareas por medio de un chat potencializado con IA dentro de la aplicacion

---
# 2. ARQUITECTURA 

La organizacion estructural de la agenda esta separada por responsabilidades 

frontend:
- HTML
- CSS
- JavaScript 

Backend (No integrado en este spring)

- Java
- Spring Boot

Base de datos (no integrado en este spring)

- MySql


Contruccion del Frontend: Se construyó el frondend con Html5, CSS3 con apoyo de estilos y diseños de Bootstrap para la interfaz.
los elementos CSS se separaron segun su funcionalidad, los archivos .JS se separan por cada funcionalidad de la agenda y gestionan estas
secciones ( navegacion, tareas de hoy, todas las tareas, materias y progreso).

para la interfaz se usó una tematica oscura con un color neon como principal, se crean contrastes intuitivos con los botones y tarjetas. 

Mis apuntes
index.html
-CSS (carpeta)
secciones de estilos
-JS (carpeta)
secciones de funcionalidades e integracion

---
# 3. ESTRUCTURA DE LA AGENDA 

Organizacion de la aplicacion 

- Actividades de hoy 
en esta seccion se muestran las tareas diarias, un resumen, un contador de actividades y prioridades. 
Dentro de esta seccion tambien cuenta con un boton para agregar una nueva actividad.  
se muestran las tarjetas de cada actividad y sus parametros adicionalmente se integró un boton para eliminar la actividad.

- Todas las actividades 
Aqui se muestra un listado general de todas la tareas registradas, barra de busqueda, filtro por prioridad, estado, materia y setear busqueda.
se muestran las tarjetas de cada actividad y sus parametros adicionalmente se integraron dos botones dentro de las tarjetas
un boton para pasar la actividad a completada y otro para eliminar la actividad.

- Mis materias 
En esta seccion se muestra las materias agregadas, un contador de materias, un boton para agregar nueva materia
Las tarjetas de cada materia muetran su nombre, descripcion, tareas asociadas y un boton para eliminar la materia. 

- Mi progreso 
Mi progreso es un dashboard que el usuario tiene para revisar su nivel de progreso en las actividades que tiene registrada
cuenta con cuatro tarjetas para visualizar (todas las actividades, completadas, pendientes y vencidas)
barra de porcentaje de cumplimiento
barra de progreso por materia 

- Boton nueva actividad (presente en "Actividades de hoy" y "Todas las actividades")
Este boton que registra las actividades cuenta con un formulario que debe diligenciarse bajo ciertos parametros de aceptacion para cada campo 

---
# 4. PERSISTENCIA DE DATOS (BD aun no implementada)

Se estan almacenando datos de pruebas que estan definidos en JavaScript para que se muestren en las vistas los eventos que las sincronizan son de prueba y los eventos que recibiran de la base de datos estan comentados para evitar duplicidad o erores al momento de ejecutar la version actual. 

