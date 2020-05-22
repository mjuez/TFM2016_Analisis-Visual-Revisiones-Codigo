<p align="center">
<img src="http://i.imgur.com/ajtCabT.png" alt="Anvireco"/> <br />
<a href="../../blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT license" /></a>
<a href="https://travis-ci.org/mjuez/TFM2016_Analisis-Visual-Revisiones-Codigo"><img src="https://travis-ci.org/mjuez/TFM2016_Analisis-Visual-Revisiones-Codigo.svg?branch=master" alt="Travis build" /></a>
<a href="https://codebeat.co/projects/github-com-mjuez-tfm2016_analisis-visual-revisiones-codigo-master"><img src="https://codebeat.co/badges/07bbfa7d-f5dd-4c96-a20e-a48517dfa89e" alt="Codebeat GPA" /></a>
<a href="https://zenodo.org/badge/latestdoi/69180490"><img src="https://zenodo.org/badge/69180490.svg" alt="DOI"></a>
</p>
<p align="center">
    🏆 <a href="https://www.sistedes.es/premios/premios-sistedes-accenture-technology-tfg-tfm-2018" target="_BLANK">1er Premio nacional SISTEDES ACCENTURE 2018 a Mejor Trabajo Fin de Máster</a>
</p>

## Descripción

Anvireco es una herramienta para la extracción y visualización de datos sobre revisiones de código realizadas en repositorios de código alojados en GitHub.

### Autor

- Mario Juez - [mariojg@ubu.es](mailto:mariojg@ubu.es)

### Tutores

- Carlos López Nozal - [clopezno@ubu.es](mailto:clopezno@ubu.es)
- Raúl Marticorena Sánchez - [rmartico@ubu.es](mailto:rmartico@ubu.es)

## Wiki

En la [wiki](../../wiki) se pueden encontrar los manuales de usuario tanto de la API como del cliente.

## Requisitos

### Requisitos mínimos

- [**Node.js y npm**](https://nodejs.org/en/): La aplicación está desarrollada en Node.js y hace uso del gestor de paquetes npm.
- [**MongoDB**](https://www.mongodb.com/): La aplicación está preparada para trabajar con bases de datos NoSQL MongoDB. No es imprescindible tener una instancia local de MongoDB, como alternativa se pueden utilizar servicios en la nube como [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) o [mLab](https://mlab.com/).

### Requisitos recomendados

- [**GitHub Developer application**](https://github.com/settings/developers): Permite aumentar el límite de peticiones/hora a la API de GitHub de 60 a 5000.

## Dependencias

### Dependencias de la API (backend)

| Nombre | Licencia | Imprescindible |
|--------|----------| -------------- |
| [express](https://github.com/expressjs/express) | MIT | Sí |
| [body-parser](https://github.com/expressjs/body-parser) | MIT | Sí |
| [node-github](https://github.com/mikedeboer/node-github) | MIT | Sí |
| [mongoose](https://github.com/Automattic/mongoose) | MIT | Sí |
| [TypeScript](https://github.com/Microsoft/TypeScript) | Apache-2.0 | Sí |
| [ts-node](https://github.com/TypeStrong/ts-node) | MIT | Sí |
| [tslint](https://github.com/palantir/tslint) | Apache-2.0 | Sí |
| [bluebird](https://github.com/petkaantonov/bluebird) | MIT | Sí |
| [gulp](https://github.com/gulpjs/gulp) | MIT | Sí |
| [gulp-sourcemaps](https://github.com/gulp-sourcemaps/gulp-sourcemaps) | ISC | Sí |
| [gulp-typescript](https://github.com/ivogabe/gulp-typescript) | MIT | Sí |
| [request](https://github.com/request/request) | Apache-2.0 | Sí |
| [request-promise](https://github.com/request/request-promise) | ISC | Sí |
| [twix](https://github.com/icambron/twix.js) | MIT | Sí |
| [moment](https://github.com/moment/moment) | MIT | Sí |
| [json2csv](https://github.com/zemirco/json2csv) | MIT | Sí |
| [cheerio](https://github.com/cheeriojs/cheerio) | MIT | Sí |
| [gulp-typedoc](https://github.com/rogierschouten/gulp-typedoc) | ISC | No |
| [chai](https://github.com/chaijs/chai) | MIT | No |
| [chai-as-promised](https://github.com/domenic/chai-as-promised) | WTFPL | No |
| [chai-http](https://github.com/chaijs/chai-http) | MIT | No |
| [sinon](https://github.com/sinonjs/sinon) | BSD | No |
| [mocha](https://github.com/mochajs/mocha) | MIT | No |
| [typedoc](https://github.com/TypeStrong/typedoc) | Apache-2.0 | No |

### Dependencias del cliente (frontend)

| Nombre | Licencia | Imprescindible |
|--------|----------| -------------- |
| [jQuery](https://github.com/jquery/jquery) | MIT | Sí |
| [sammy](https://github.com/quirkey/sammy) | MIT | Sí |
| [semantic-ui](https://github.com/Semantic-Org/Semantic-UI) | MIT | Sí |
| [d3](https://github.com/d3/d3) | BSD-3-Clause | Sí |
| [c3](https://github.com/c3js/c3) | MIT | Sí |

## Instalación

A continuación se muestran los pasos necesarios para la instalación y despliegue de la aplicación (manual de programador) en una máquina local. Las tecnologías utilizadas también son compatibles con sistemas operativos Windows, Linux y Mac OS X.

### Descarga de la aplicación

En primer lugar se debe descargar la aplicación. Bien el fichero .zip generado por GitHub, o clonando el repositorio:
```
git clone https://github.com/mjuez/TFM2016_Analisis-Visual-Revisiones-Codigo.git
```

Una vez descargada y descomprimida, es necesario situarse dentro de la carpeta que contiene el fichero `package.json`.

### Variables de entorno

Las variables de configuración de la aplicación se deben definir como variables de entorno y son las siguientes:

- **MONGO_CONNSTRING**: Cadena de conexión a la base de datos MongoDB ([formato](https://docs.mongodb.com/manual/reference/connection-string/)).
  - Ejemplo: `mongodb://admin:1234@127.0.0.1:27017/anvireco`.
- **ANVIRECO_APPNAME** (opcional): Nombre de una aplicación [GitHub Developer application](https://github.com/settings/developers).
  - Ejemplo: `Anvireco`.
- **ANVIRECO_ID** (opcional): Client ID de una aplicación [GitHub Developer application](https://github.com/settings/developers).
  - Ejemplo: `00x000x00xxx0x0x0xx0`.
- **ANVIRECO_SECRET** (opcional): Client Secret de una aplicación [GitHub Developer application](https://github.com/settings/developers).
  - Ejemplo: `00x000x00xxx0x0x0xx000x000x00xxx0x0x0xx0`.
- **PORT** (opcional): Puerto donde se va a ejecutar el servidor node.js.
  - Ejemplo: `3000`.

**Nota:** La definición de variables de entorno depende del sistema operativo utilizado y no se detalla en este manual.

### Instalación de dependencias

Existen dos formas de instalar las dependencias de la aplicación utilizando el gestor de paquetes npm:

- **Entorno de producción**: Instala únicamente las dependencias imprescindibles para la ejecución de la aplicación.
  ```
  npm install --only=production
  ```
- **Entorno de desarrollo**: Instala todas las dependencias, incluyendo aquellas opcionales como por ejemplo las de testing.
  ```
  npm install
  ```

### Compilación de ficheros TypeScript

Los ficheros TypeScript (.ts) dentro del directorio `src` son compilados a JavaScript (.js) y guardados en el directorio `release`.
La compilación se realiza mediante un objetivo de gulp llamado `compile`.

```
gulp compile
```

### Ejecución de pruebas unitarias

La ejecución de las pruebas unitarias solo se puede llevar a cabo si se han instalado todas las dependencias.
Mediante el comando `npm test` se ejecutan las pruebas.

**Nota:** Para la ejecución de las pruebas no es necesario compilar los ficheros TypeScript.

### Ejecución de la aplicación

La aplicación se ejecuta mediante el comando `npm start`. La aplicación es accesible desde http://localhost:puerto donde `puerto` es el valor de la variable de entorno `PORT`.

**Nota 1:** Si no se ha definido la variable de entorno `PORT`, la aplicación se desplegará por defecto en el puerto `3000` y será accesible a través de [http://localhost:3000/](http://localhost:3000/).

**Nota 2:** Para la ejecución de la aplicación es imprescindible la compilación previa de los ficheros TypeScript.

## Demo

- Producción: http://anvireco.herokuapp.com/
- Desarrollo: http://anvireco-dev.herokuapp.com/
- Machine learning reviewers data processing: https://anvireco-reviews-preprocessor.duckduck.mjuez.com/

## Licencia

Copyright (c) 2017 Mario Juez Gil - Licenciado bajo [licencia MIT](../../blob/master/LICENSE)

## Un proyecto para:

![Admirable y Digit](http://i.imgur.com/EFLu1oQ.jpg)
