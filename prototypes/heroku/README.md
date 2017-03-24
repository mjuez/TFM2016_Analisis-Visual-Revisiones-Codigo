# Prototipo Heroku

Se trata de un Hola Mundo desarrollado con TypeScript de una aplicación que devuelve
`{
  "message": "Hello World!"
}`. La finalidad de este prototipo es aprender a desplegar aplicaciones en Heroku utilizando su herramienta Heroku CLI, la aplicación desplegada se puede ver [aquí](https://p01-tfm2016mjuez.herokuapp.com/).

## Prueba localmente

En primer lugar se deben instalar las dependencias mediante:

```
npm install
```

A continuación, compilar los ficheros TypeScript a Javascript mediante:

```
tsc ./src/index.ts --outDir ./
```

Tras ello se puede ejecutar la aplicación mediante:

```
npm start
```

La aplicación es accesible desde `http://localhost:3000/`
