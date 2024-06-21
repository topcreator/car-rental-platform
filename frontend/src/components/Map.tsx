import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import * as UserService from '../services/UserService'
import { strings } from '../lang/map'
import * as LocationService from '../services/LocationService'
import * as helper from '../common/helper'

import 'leaflet-boundary-canvas'
import 'leaflet/dist/leaflet.css'
import '../assets/css/map.css'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
})

L.Marker.prototype.options.icon = DefaultIcon

interface Marker {
  name: string,
  position: L.LatLng
}

const position: LatLngExpression = new L.LatLng(36.966428, -95.844032)
const markers: Marker[] = [
  // { name: 'Athens (ATH)', position: new L.LatLng(37.983810, 23.727539) },
]
const zoomMarkers: Marker[] = [
  // { name: 'Athens Airport (ATH)', position: new L.LatLng(37.937225, 23.945238) },
  // { name: 'Athens Port Piraeus (ATH)', position: new L.LatLng(37.9495811, 23.6121006) },
]

interface ZoomTrackerProps {
  setZoom: Dispatch<SetStateAction<number>>
}

const ZoomTracker = ({ setZoom }: ZoomTrackerProps) => {
  const mapEvents = useMapEvents({
    zoom() {
      setZoom(mapEvents.getZoom())
    }
  })

  return null
}

interface ZoomControlledLayerProps {
  zoom: number
  minZoom: number
  children: ReactNode
}

const ZoomControlledLayer = ({ zoom, minZoom, children }: ZoomControlledLayerProps) => {
  if (zoom >= minZoom) {
    return (
      <>
        {children}
      </>
    )
  }
  return null
}

interface MapProps {
  title?: string
  initialZoom?: number,
  className?: string,
  onSelelectPickUpLocation?: (locationId: string) => void
  onSelelectDropOffLocation?: (locationId: string) => void
}

const Map = ({
  title,
  initialZoom,
  className,
  onSelelectPickUpLocation,
  onSelelectDropOffLocation,
}: MapProps) => {
  const _initialZoom = initialZoom || 5.5
  const [zoom, setZoom] = useState(_initialZoom)
  const [map, setMap] = useState<L.Map | null>(null)

  if (map) {
    map.attributionControl.setPrefix('')
  }

  //
  // Tile server
  //
  const language = UserService.getLanguage()

  let tileURL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  // if (language === 'fr') {
  //   tileURL = 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
  // }
  if (language === 'el') {
    tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }

  const getMarkers = (__markers: Marker[]) =>
    __markers.map((marker) => (
      <Marker key={marker.name} position={marker.position}>
        <Popup className="marker">
          <div className="name">{marker.name}</div>
          <div className="action">
            {!!onSelelectPickUpLocation && (
              <button
                type="button"
                className="action-btn"
                onClick={async () => {
                  try {
                    if (onSelelectPickUpLocation) {
                      const { status, data } = await LocationService.getLocationId(marker.name, 'en')

                      if (status === 200) {
                        onSelelectPickUpLocation(data)
                      } else {
                        helper.error()
                      }
                    }
                  } catch (err) {
                    helper.error(err)
                  }
                }}
              >
                {strings.SELECT_PICK_UP_LOCATION}
              </button>
            )}
            {!!onSelelectDropOffLocation && (
              <button
                type="button"
                className="action-btn"
                onClick={async () => {
                  try {
                    if (onSelelectDropOffLocation) {
                      const { status, data } = await LocationService.getLocationId(marker.name, 'en')

                      if (status === 200) {
                        onSelelectDropOffLocation(data)
                      } else {
                        helper.error()
                      }
                    }
                  } catch (err) {
                    helper.error(err)
                  }
                }}
              >
                {strings.SELECT_DROP_OFF_LOCATION}
              </button>
            )}
          </div>
        </Popup>
      </Marker>
    ))

  return (
    <>
      {title && <h1 className="title">{title}</h1>}
      <MapContainer
        center={position}
        zoom={_initialZoom}
        className={`${className ? `${className} ` : ''}map`}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileURL}
        />
        <ZoomTracker setZoom={setZoom} />
        <ZoomControlledLayer zoom={zoom} minZoom={7.5}>
          {
            getMarkers(zoomMarkers)
          }
        </ZoomControlledLayer>
        <ZoomControlledLayer zoom={zoom} minZoom={5.5}>
          {
            getMarkers(markers)
          }
        </ZoomControlledLayer>
      </MapContainer>
    </>
  )
}

export default Map
