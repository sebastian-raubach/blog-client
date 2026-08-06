import { mdiBeach, mdiElevationRise, mdiFlagTriangle, mdiForest, mdiGrain, mdiGrass, mdiHiking, mdiImageFilterHdr, mdiMapMarker, mdiNewBox, mdiRoad, mdiRvTruck, mdiTerrain } from "@mdi/js"

export interface PostTypeConfig {
  color: string
  title: string
  icon: string
}

export interface HillConfig {
  color: string
  title: string
  totalCount?: number
  icon: string
  description: string
}

export interface SiteTypeConfig {
  value: string
  title: string
  color: string
  icon: string
}

export interface GroundTypeConfig {
  value: string
  title: string
  color: string
  icon: string
}

const postTypeConfigs: { [key: string]: PostTypeConfig } = {}
postTypeConfigs['hike'] = {
  color: 'info',
  title: 'Wanderung',
  icon: mdiHiking,
}
postTypeConfigs['news'] = {
  color: 'success',
  title: 'Neuigkeiten',
  icon: mdiNewBox,
}

const siteTypeConfigs: { [key: string]: SiteTypeConfig } = {}
siteTypeConfigs['campsite'] = {
  value: 'campsite',
  color: '#2980b9',
  title: 'Campingplatz',
  icon: mdiRvTruck,
}
siteTypeConfigs['wildcamp'] = {
  value: 'wildcamp',
  color: '#27ae60',
  title: 'Wild-Zelten',
  icon: mdiForest,
}

const groundTypeConfigs: { [key: string]: GroundTypeConfig } = {}
groundTypeConfigs['gravel'] = {
  value: 'gravel',
  color: 'info',
  title: 'Kies',
  icon: mdiGrain,
}
groundTypeConfigs['grass'] = {
  value: 'grass',
  color: 'success',
  title: 'Gras',
  icon: mdiGrass,
}
groundTypeConfigs['paved'] = {
  value: 'paved',
  color: 'success',
  title: 'Befestigt',
  icon: mdiRoad,
}
groundTypeConfigs['sand'] = {
  value: 'sand',
  color: 'success',
  title: 'Sand',
  icon: mdiBeach,
}

const hillConfigs: { [key: string]: HillConfig } = {}
hillConfigs['munro'] = {
  title: 'Munro',
  color: '#bd0026',
  totalCount: 282,
  icon: mdiImageFilterHdr,
  description: 'Schottische Gipfel über 914.4 Meter (3000 feet)',
}
hillConfigs['corbett'] = {
  title: 'Corbett',
  color: '#f03b20',
  totalCount: 222,
  icon: mdiTerrain,
  description: 'Schottische Gipfel zwischen 762 - 914.4 Metern (2500 - 3000 feet)',
}
hillConfigs['graham'] = {
  title: 'Graham',
  color: '#fd8d3c',
  totalCount: 219,
  icon: mdiElevationRise,
  description: 'Schottische Gipfel zwischen 610 - 762 Metern (2000 - 2500 feet)',
}
hillConfigs['donald'] = {
  title: 'Donald',
  color: '#feb24c',
  totalCount: 89,
  icon: mdiHiking,
  description: 'Schottische Gipfel über 610 Meter (2000 feet)',
}
hillConfigs['sub2000'] = {
  title: 'Sub-2000',
  color: '#fed976',
  totalCount: 573,
  icon: mdiElevationRise,
  description: 'Schottische Gipfel unter 610 Meter (2000 feet)',
}
hillConfigs['hewitt'] = {
  title: 'Hewitt',
  color: '#fed976',
  totalCount: 316,
  icon: mdiFlagTriangle,
  description: 'Englische, Walisische oder Irische Gipfel über 610 Meter (2000 feet)',
}
hillConfigs['other'] = {
  title: 'Sonstige',
  color: '#fed976',
  totalCount: undefined,
  icon: mdiMapMarker,
  description: 'Alles was nicht in eine andere Kategorie gehört',
} 

export {
  postTypeConfigs,
  hillConfigs,
  siteTypeConfigs,
  groundTypeConfigs,
}
