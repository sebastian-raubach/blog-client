/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2026-07-21 11:03:10.

import type { LocalImageDetails } from '@/plugins/types/client'

/** Full in-memory wizard state. */
export interface BlogEntryFormState {
  id?: number
  type: PostsType
  title: string
  markdown: string
  visible: boolean // TODO
  photos: LocalImageDetails[]
  gpx?: GpxPayload
  peaks: PostHill[]
  ratings?: Hikeratings
  individuals?: number[]
  videos?: string[]
  start?: string
  end?: string
}

export interface StoryEntryFormState {
  id?: number
  title: string
  markdown: string
  posts: MiniPost[]
  start?: string
}

/** Everything derived from a GPX upload, ready to send to the server. */
export interface GpxPayload {
  /** The original file exactly as uploaded. */
  file: File
  /** A re-serialized, simplified .gpx file (same <trk>/<trkseg> structure, fewer points). */
  minifiedFile: File
  fileAsString: string
  stats: GpxStats
}

export interface GpxStats {
  distanceKm: number
  elevationGainM: number
  durationMinutes: number
  originalPointCount: number
  minifiedPointCount: number
}

export interface Hikeratings {
    postId?: number;
    weather: number;
    path: number;
    view: number;
}

export interface Hikestats {
    postId?: number;
    duration: number;
    distance: number;
    ascent: number;
    gpxPath?: string;
    elevationProfilePath?: string;
    timeDistanceProfilePath?: string;
    createdOn?: Date;
    updatedOn?: Date;
}

export interface ImageDetails {
    imageId: number;
    imagePath?: string;
    postId?: number;
    isPrimary?: boolean;
    description?: string;
}

export interface Individuals {
    id: number;
    name: string;
    userId: number;
    photo: any;
    createdOn: Date;
    updatedOn: Date;
}

export interface ViewStories {
    storyId?: number;
    storyTitle: string;
    storyContent?: string;
    storyMarkdown: string;
    storyStartDate: string;
    posts: MiniPost[];
}

export interface ViewSites {
    id?: number;
    name?: string;
    description?: string;
    sitetype: SitesSitetype;
    latitude?: number;
    longitude?: number;
    elevation?: number;
    rating: SiteRating;
    facilities: SiteFacilities;
    createdOn: string;
    updatedOn?: string;
    groundtypes: PostsitesGroundtype[];
    postIds?: number[];
}

export interface HillTypeCount {
    type: HillsType;
    count: number;
}

export const enum HillsType {
    munro = 'munro',
    corbett = 'corbett',
    graham = 'graham',
    donald = 'donald',
    sub2000 = 'sub2000',
    wainwright = 'wainwright',
    hewitt = 'hewitt',
    other = 'other',
}

export interface LoginDetails {
    username: string;
    password: string;
}

export interface PaginatedRequest {
    searchTerm?: string;
    orderBy?: string;
    ascending?: number;
    limit?: number;
    page?: number;
    prevCount?: number;
}

export interface HillRequest extends PaginatedRequest {
    postId?: number;
    hillName?: string;
}

export interface ViewHills {
    hillId: number;
    hillName: string;
    hillType: HillsType;
    hillRegion: string;
    hillUrl: string;
    hillLatitude: number;
    hillLongitude: number;
    hillElevation: number;
    posts: MiniPost[];
    people: PostPerson[];
}

export interface ViewPosts {
    postId: number;
    postType: PostsType;
    postTitle: string;
    postContent: string;
    postMarkdown: string;
    postVisible: boolean;
    postViewCount: number;
    postStartDate: string;
    postEndDate: string;
    hills: PostHill[];
    people: PostPerson[];
    hikestats: HikeStats;
    hikerating: HikeRating;
    videos: string[];
    storyIds: number[];
    images: PostImage[];
    sites: PostSite[];
}

export interface PostHill {
    hillId?: number;
    hillName: string;
    hillType: HillsType;
    hillLatitude: number;
    hillLongitude: number;
    hillElevation: number;
    hillSuccessful: 0 | 1;
}

export interface PostPerson {
    personId: number;
    personName: string;
}

export interface HikeStats {
    duration: number;
    distance: number;
    ascent: number;
    gpx: string;
    elevationProfile: string;
    timeDistanceProfile: string;
    individualStats: { [index: string]: Section[] };
}

export interface Section {
    from: number;
    to: number;
    type?: MovementType;
}

export const enum MovementType {
    BIKE = 'BIKE',
    WALK = 'WALK',
    RUN = 'RUN',
    TRAILER = 'TRAILER',
    SWIM = 'SWIM',
}

export interface HikeRating {
    weather: number;
    path: number;
    view: number;
}

export interface PostImage {
    imageId: number;
    imagePath: string;
    imageIsPrimary: 0 | 1;
    imageDescription: string;
}

export interface PostSite {
    siteId: number;
    siteName: string;
    siteDescription: string;
    siteType: SitesSitetype;
    siteLatitude: number;
    siteLongitude: number;
    siteRating: SiteRating;
    siteFacilities: SiteFacilities;
    groundType: PostsitesGroundtype;
}

export interface PostImport {
    type?: PostsType;
    title: string;
    content?: string;
    contentMarkdown?: string;
    visible: boolean;
    individuals?: number[];
    endDate?: string;
    createdOn?: string;
    updatedOn?: string;
    hills?: PostHill[];
    videos?: string[];
    stats?: Hikestats;
    rating?: Hikeratings;
}

export interface SiteFacilities {
    toilets: boolean;
    showers: boolean;
    shop: boolean;
    restaurant: boolean;
    cafe: boolean;
    electricHookup: boolean;
    localDogWalk: boolean;
    wifi: boolean;
}

export interface SiteRating {
    scenery: number;
    location: number;
    price: number;
    facilities: number;
}

export interface MiniPost {
    id: number;
    title: string;
    primaryImageId?: number;
    primaryImagePath?: string;
    type: PostsType;
}

export interface Token {
    token: string;
    imageToken: string;
    id: number;
    username: string;
    lifetime: number;
    createdOn: number;
}

export interface YearCount {
    year: number;
    count: number;
}

export interface PostRequest extends PaginatedRequest {
    year?: number;
    postType?: PostsType;
    siteId?: number;
    hillId?: number;
    storyId?: number;
    relatedPostId?: number;
}

export const enum PostsType {
    hike = 'hike',
    news = 'news',
}

export const enum PostsitesGroundtype {
    paved = 'paved',
    grass = 'grass',
    gravel = 'gravel',
    sand = 'sand',
}

export const enum SitesSitetype {
    campsite = 'campsite',
    wildcamp = 'wildcamp',
}
