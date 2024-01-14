
<div align="center">



<img src="https://github.com/am2222/strapi-plugin-postgis/raw/main/images/github-logo.png?raw=true">
<img src="https://github.com/am2222/strapi-plugin-postgis/actions/workflows/npm-publish.yml/badge.svg">
<img src="https://github.com/am2222/strapi-plugin-postgis/actions/workflows/docs-publish-github.yml/badge.svg">


  
<p align="center">
  <strong>
Add native postgis support to strapi.  </strong>
<img src="https://github.com/am2222/strapi-plugin-postgis/raw/main/images/screenshot.png?raw=true">
</p>

</div>

---



## Under Development 

## How does it work?
Since Strapi does not support native database formats I convert requests before they being sent to the querybuilder and convert all the geometry objects to the `geojson`. 

## Installation

Setup your strapi app as usual

```javascript
npx create-strapi-app@latest my-project --quickstart
```

Install `pg` and `strapi-plugin-postgis` 

```javascript
npm install pg --save
npm i strapi-plugin-postgis

```

Make sure to config your strapi to use `postgrs` database as backend, Use this link in case you need any help with this step (https://strapi.io/blog/postgre-sql-and-strapi-setup)

Modify your middlewares as following to let strapi load `osm` tiles. Add `'*.tile.openstreetmap.org'` to the `img-src` as follows


```javascript
// ./config/middlewares.js
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', '*.tile.openstreetmap.org'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];


```

Now in your api folder modify `content-types` and add a new column with the following format

```javascript
{
  "kind": "collectionType",
  .
  .
  .
  "attributes": {
  .
  .
  .
    "geom": { //--> your column name. you can change to anything
      "columnType": {
        "type": "specificType",
        "args": [
          "geometry(POINT,4326)" //-> change this line according to the Supported Data Types section
        ]
      },
      "type": "json", //->don't change this
      "fieldRenderer": "postgis" //->don't change this
    }
  }
}

```




## Supported Data Types

### POINT(0 0)

![Screenshot](https://github.com/am2222/strapi-plugin-postgis/raw/main/images/points.png?raw=true)
```json
"geom": {
      "columnType": {
        "type": "specificType",
        "args": [
          "geometry(POINT,4326)"
        ]
      },
      "type": "json",
      "fieldRenderer": "postgis"
    }

```
POINT Z (0 0 0)

POINT ZM (0 0 0 0)

POINT EMPTY

### LINESTRING(0 0,1 1,1 2)
![Screenshot](https://github.com/am2222/strapi-plugin-postgis/raw/main/images/linestring.png?raw=true)

```json
    "g_line": {
      "columnType": {
        "type": "specificType",
        "args": [
          "geometry(LINESTRING,4326)"
        ]
      },
      "type": "json",
      "fieldRenderer": "postgis"
    }


```

LINESTRING EMPTY

### POLYGON((0 0,4 0,4 4,0 4,0 0),(1 1, 2 1, 2 2, 1 2,1 1))

![Screenshot](https://github.com/am2222/strapi-plugin-postgis/raw/main/images/polygon.png?raw=true)

```json
    "g_polygon": {
      "columnType": {
        "type": "specificType",
        "args": [
          "geometry(POLYGON,4326)"
        ]
      },
      "type": "json",
      "fieldRenderer": "postgis"
    }

```

MULTIPOINT((0 0),(1 2))

MULTIPOINT Z ((0 0 0),(1 2 3))

MULTIPOINT EMPTY

MULTILINESTRING((0 0,1 1,1 2),(2 3,3 2,5 4))

MULTIPOLYGON(((0 0,4 0,4 4,0 4,0 0),(1 1,2 1,2 2,1 2,1 1)), ((-1 -1,-1 -2,-2 -2,-2 -1,-1 -1)))

GEOMETRYCOLLECTION(POINT(2 3),LINESTRING(2 3,3 4))

GEOMETRYCOLLECTION EMPTY


## TODO
- Add tests
- Support all the types
- Add query options like sort by distance, overlap and etc.
- Develop dashboard
- Add cool pg queries and tilings ;)

## Thanks to
* strapi-plugin-point-list for the idea of how to add a custom components to the strapi content types
* postgis knex plugin
* leaflet editor plugin
* strapi team
* and so many other stuff 
