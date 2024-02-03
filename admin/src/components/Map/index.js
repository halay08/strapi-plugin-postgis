import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import * as turf from "@turf/turf";
import { Stack } from "@strapi/design-system/Stack";
import { Box } from "@strapi/design-system/Box";
import { Typography } from "@strapi/design-system/Typography";
import { useRouteMatch } from "react-router-dom";
import InputJSON from "./../InputJSON";
import { useIntl } from "react-intl";
import * as L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { useFetchPgMetadata } from "../../hooks/";
import "./leaflet.css";
const Map = ({
  name,
  onChange,
  value,
  intlLabel,
  disabled,
  error,
  description,
  required,
}) => {
  const { formatMessage } = useIntl();
  const pgTables = useFetchPgMetadata();
  const [renderMap, setRenderMap] = useState(undefined);
  const [tableSettings, setTableSettings] = useState(undefined);
  const contentTypeMatch = useRouteMatch(`/content-manager/:kind/:uid`);

  const getGeoms = (collection) => {
    let geojsonGeometries = [];
    turf.geomEach(collection, function (currentGeometry) {
      // currentGeometry.coordinates = L.GeoJSON.latLngToCoords(currentGeometry.coordinates)
      geojsonGeometries.push(currentGeometry);
    });
    return geojsonGeometries;
  };

  const sanitizeGeojson = (geojson, fieldType) => {
    let inputType = turf.getType(geojson);
    geojson = getGeoms(geojson);
    switch (fieldType) {
      case "POINT":
        if (geojson[0] && turf.getType(geojson[0]).toUpperCase() === "POINT") {
          return geojson[0];
        }

        break;
      case "LINESTRING":
        if (
          geojson[0] &&
          turf.getType(geojson[0]).toUpperCase() === "LINESTRING"
        ) {
          return geojson[0];
        }

        break;
      case "POLYGON":
        if (
          geojson[0] &&
          turf.getType(geojson[0]).toUpperCase() === "POLYGON"
        ) {
          return geojson[0];
        }

        break;
      default:
        break;
    }
    return {};
  };

  const updateGeoJSON = (geoJSON) => {
    let sanitized = sanitizeGeojson(geoJSON, tableSettings["geoType"]);
    value = JSON.stringify(sanitized);
    /* The `onChange` function is being called with an object as its argument. This object has a
    `target` property, which is another object. The `target` object has three properties: `name`,
    `value`, and `type`. */
    onChange({
      target: {
        name,
        value,
        type: "json",
      },
    });
  };

  useEffect(() => {
    if (pgTables.spatialTables && contentTypeMatch) {
      let uid = contentTypeMatch.params.uid || "";
      if (pgTables.spatialTables[uid] && pgTables.spatialTables[uid][name]) {
        setRenderMap(true);
        setTableSettings(pgTables.spatialTables[uid][name]);
      }
    }
  }, [pgTables, contentTypeMatch]);
  useEffect(() => {
    if (renderMap && tableSettings) {
      let map = L.map(`map_${name}`, {
        center: [16.047079, 108.20623],
        zoom: 18,
        maxZoom: 22,
        // pmIgnore: false
      });

      // let editLayer = L.layerGroup([],{id: 'inputData'}).addTo(map)

      let geojsonFeature;
      try {
        geojsonFeature = JSON.parse(value);
      } catch (error) {
        console.log("error parsing value");
        error = "error parsing value";
      }

      let geojsonLayer = L.geoJSON(geojsonFeature, {
        id: "inputData",
        pointToLayer: (geoJsonPoint, latlng) => {
          return L.circleMarker(latlng);
        },
      }).addTo(map);

      let bounds = geojsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds);
      }
      map.pm.setGlobalOptions({ layerGroup: geojsonLayer });

      // let mapDiv = document.getElementById("map");
      // let resizeObserver = new ResizeObserver(() => {
      //     map.invalidateSize();
      // });
      // resizeObserver.observe(mapDiv);

      let osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      let osmAttrib =
        '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      let osm = L.tileLayer(osmUrl, {
        maxZoom: 22,
        attribution: osmAttrib,
      }).addTo(map);
      // L.control.layers({
      //     'OSM': osm.addTo(map),
      //     "Google": L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
      //         attribution: 'google'
      //     })
      // }, undefined, { position: 'topright', collapsed: false }).addTo(map);

      if (!disabled) {
        let pmSettings = {
          position: "topleft",
          drawCircle: false,
          drawMarker: false,
          drawCircleMarker: false,
          drawPolyline: false,
          drawRectangle: false,
          drawPolygon: false,
          editControls: true,
          drawControls: true,
        };

        //its draw mode
        pmSettings["editControls"] = true;
        switch (tableSettings["geoType"]) {
          case "POINT":
            pmSettings["drawCircleMarker"] = true;
            pmSettings["isMluti"] = false;
            break;
          case "LINESTRING":
            pmSettings["drawPolyline"] = true;
            pmSettings["isMluti"] = false;
            break;
          case "POLYGON":
            pmSettings["drawPolygon"] = true;
            pmSettings["isMluti"] = false;
            break;

          default:
            break;
        }

        if (!pmSettings["isMluti"]) {
          map.on("pm:drawstart", ({ workingLayer }) => {
            map.eachLayer(function (layer) {
              geojsonLayer.clearLayers();
            });
          });

          map.on("pm:create", ({ shape, layer }) => {
            map.pm.disableDraw();
          });
        }

        geojsonLayer.on("layeradd", () => {
          updateGeoJSON(geojsonLayer.toGeoJSON());
        });
        geojsonLayer.on("layerremove", () => {
          updateGeoJSON(geojsonLayer.toGeoJSON());
        });

        geojsonLayer.on("pm:change", () => {
          updateGeoJSON(geojsonLayer.toGeoJSON());
        });
        //                 coord_dimension: 2
        // exists: true
        // f_table_schema: "public"
        // geoType: "POINT"
        // isSpatial: true
        // pluginOptions: {i18n: {…}, postgis: {…}}
        // spType: "geometry"
        // srid: 4326

        map.pm.addControls(pmSettings);
      }
    }

    return () => {
      //   resizeObserver && resizeObserver.unobserve(mapDiv);
    };
  }, [renderMap, tableSettings]);

  return (
    <>
      {renderMap ? (
        <Stack size={1}>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              {formatMessage(intlLabel)}
            </Typography>
            {required && (
              <Typography variant="pi" fontWeight="bold" textColor="danger600">
                *
              </Typography>
            )}
          </Box>
          {error && (
            <Typography variant="pi" textColor="danger600">
              {formatMessage({ id: error, defaultMessage: error })}
            </Typography>
          )}
          {description && (
            <Typography variant="pi">{formatMessage(description)}</Typography>
          )}
          <div id={`map_${name}`} style={{ height: "500px" }}></div>
          <InputJSON
            name={`${name}- Geojson`}
            onChange={onChange}
            value={value}
            intlLabel={intlLabel}
            disabled={disabled}
          ></InputJSON>
        </Stack>
      ) : (
        <InputJSON
          name={name}
          onChange={onChange}
          value={value}
          intlLabel={intlLabel}
          disabled={disabled}
          error={error}
          description={description}
          required={required}
        ></InputJSON>
      )}
    </>
  );
};

Map.defaultProps = {
  description: "",
  disabled: false,
  error: undefined,
  intlLabel: "",
  required: false,
  value: "",
};

Map.propTypes = {
  description: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
  }),
  disabled: PropTypes.bool,
  error: PropTypes.string,
  intlLabel: PropTypes.shape({
    id: PropTypes.string,
    defaultMessage: PropTypes.string,
  }),
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  value: PropTypes.string,
};

export default Map;
