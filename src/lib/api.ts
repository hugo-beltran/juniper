import { queryOptions } from '@tanstack/react-query'
import type { Lead } from '@/components/leads-table/leads-table'
import navTree from './nav-tree.json'

/* Mock API for the demo: shaped like a real data layer (queryOptions per
 * resource, network latency simulated) so swapping in real endpoints only
 * touches the queryFn bodies. */

export type ProductStatus = 'live' | 'beta' | 'deprecated'

export interface Product {
  id: string
  name: string
  category: string
  status: ProductStatus
  price: number
  activeUsers: number
  revenue: number
}

export interface RevenuePoint {
  month: string
  actual: number
  target: number
}

export interface Stat {
  id: string
  label: string
  value: string
  delta: number
}

const PRODUCTS: Product[] = [
  { id: 'p-01', name: 'Juniper Grove', category: 'Analytics', status: 'live', price: 49, activeUsers: 12840, revenue: 482100 },
  { id: 'p-02', name: 'Juniper Relay', category: 'Automation', status: 'live', price: 79, activeUsers: 8412, revenue: 511300 },
  { id: 'p-03', name: 'Juniper Terrace', category: 'Design', status: 'beta', price: 29, activeUsers: 3287, revenue: 74800 },
  { id: 'p-04', name: 'Juniper Bramble', category: 'Infrastructure', status: 'live', price: 129, activeUsers: 5108, revenue: 598400 },
  { id: 'p-05', name: 'Juniper Sprig', category: 'Mobile', status: 'beta', price: 19, activeUsers: 6731, revenue: 98200 },
  { id: 'p-06', name: 'Juniper Canopy', category: 'Analytics', status: 'live', price: 99, activeUsers: 4529, revenue: 402700 },
  { id: 'p-07', name: 'Juniper Thicket', category: 'Security', status: 'live', price: 149, activeUsers: 2914, revenue: 391600 },
  { id: 'p-08', name: 'Juniper Meadow', category: 'Collaboration', status: 'beta', price: 39, activeUsers: 7156, revenue: 187400 },
  { id: 'p-09', name: 'Juniper Fern', category: 'Design', status: 'deprecated', price: 25, activeUsers: 811, revenue: 16900 },
  { id: 'p-10', name: 'Juniper Root', category: 'Infrastructure', status: 'deprecated', price: 59, activeUsers: 402, revenue: 21500 },
]

const REVENUE: RevenuePoint[] = [
  { month: 'Jan', actual: 148_000, target: 152_000 },
  { month: 'Feb', actual: 156_500, target: 158_000 },
  { month: 'Mar', actual: 171_200, target: 164_000 },
  { month: 'Apr', actual: 165_800, target: 170_000 },
  { month: 'May', actual: 182_400, target: 176_000 },
  { month: 'Jun', actual: 194_100, target: 182_000 },
  { month: 'Jul', actual: 189_600, target: 189_000 },
  { month: 'Aug', actual: 205_300, target: 195_000 },
  { month: 'Sep', actual: 218_900, target: 202_000 },
  { month: 'Oct', actual: 226_400, target: 209_000 },
  { month: 'Nov', actual: 241_700, target: 216_000 },
  { month: 'Dec', actual: 255_200, target: 224_000 },
]

const STATS: Stat[] = [
  { id: 'mrr', label: 'Monthly recurring revenue', value: '$255.2k', delta: 5.6 },
  { id: 'users', label: 'Active users', value: '52,190', delta: 4.1 },
  { id: 'conversion', label: 'Trial conversion', value: '3.8%', delta: -0.4 },
  { id: 'nps', label: 'Net promoter score', value: '61', delta: 2.0 },
]

/* Demo scouting pipeline — fictional players, clubs, and figures. Stands in
 * for a CRM leads list without carrying any real business data. Eight early
 * pipeline (Scouted) players carry no grade yet: they still need analysis. */
export const LEADS: Lead[] = [
  { id: "1", player: "T. Okafor", position: "SP", club: "River Hawks", stage: "Signed", ask: 32_000_000, grade: 70, scout: "K. Tanaka", lastActivity: "1d ago" },
  { id: "2", player: "D. Whitlock", position: "OF", club: "Bayside Nine", stage: "Offer", ask: 24_000_000, grade: 65, scout: "S. Whitfield", lastActivity: "5h ago" },
  { id: "3", player: "A. Sandoval", position: "SS", club: "Copper Kings", stage: "Workout", ask: 15_000_000, grade: 60, scout: "S. Whitfield", lastActivity: "6h ago" },
  { id: "4", player: "N. Petrov", position: "OF", club: "Dust Devils", stage: "Contacted", ask: 11_000_000, grade: 60, scout: "M. Arroyo", lastActivity: "4d ago" },
  { id: "5", player: "H. Okada", position: "2B", club: "Bayside Nine", stage: "Signed", ask: 9_750_000, grade: 55, scout: "K. Tanaka", lastActivity: "3w ago" },
  { id: "6", player: "R. Delgado", position: "3B", club: "Copper Kings", stage: "Offer", ask: 8_500_000, grade: 55, scout: "M. Arroyo", lastActivity: "2h ago" },
  { id: "7", player: "J. Paulino", position: "SP", club: "Dust Devils", stage: "Workout", ask: 6_000_000, grade: 50, scout: "M. Arroyo", lastActivity: "3d ago" },
  { id: "8", player: "Y. Fukuda", position: "RP", club: "Harbor Cats", stage: "Contacted", ask: 4_800_000, grade: 55, scout: "K. Tanaka", lastActivity: "2d ago" },
  { id: "9", player: "E. Marsh", position: "1B", club: "River Hawks", stage: "Scouted", ask: 3_200_000, grade: 40, scout: "L. Moreau", lastActivity: "2w ago" },
  { id: "10", player: "C. Braithwaite", position: "C", club: "Northgate Owls", stage: "Scouted", ask: 2_100_000, grade: 45, scout: "L. Moreau", lastActivity: "1w ago" },
  { id: "11", player: "S. Ferreira", position: "CF", club: "Harbor Cats", stage: "Contacted", ask: 7_400_000, grade: 50, scout: "S. Whitfield", lastActivity: "8h ago" },
  { id: "12", player: "M. Kowalski", position: "RP", club: "Northgate Owls", stage: "Scouted", ask: 950_000, scout: "L. Moreau", lastActivity: "5d ago" },
  { id: "13", player: "G. Ellison", position: "LF", club: "Ironwood Foxes", stage: "Scouted", ask: 1_800_000, grade: 45, scout: "R. Osei", lastActivity: "3d ago" },
  { id: "14", player: "V. Castellanos", position: "DH", club: "Cascade Pilots", stage: "Contacted", ask: 13_500_000, grade: 60, scout: "P. Lindqvist", lastActivity: "1d ago" },
  { id: "15", player: "O. Nakamura", position: "SS", club: "Northgate Owls", stage: "Workout", ask: 9_200_000, grade: 55, scout: "K. Tanaka", lastActivity: "12h ago" },
  { id: "16", player: "B. Kowalczyk", position: "RP", club: "River Hawks", stage: "Scouted", ask: 1_200_000, scout: "L. Moreau", lastActivity: "6d ago" },
  { id: "17", player: "F. Duarte", position: "CF", club: "Copper Kings", stage: "Offer", ask: 18_000_000, grade: 65, scout: "S. Whitfield", lastActivity: "3h ago" },
  { id: "18", player: "W. Achterberg", position: "1B", club: "Harbor Cats", stage: "Scouted", ask: 2_600_000, grade: 45, scout: "R. Osei", lastActivity: "9d ago" },
  { id: "19", player: "I. Marchetti", position: "C", club: "Dust Devils", stage: "Contacted", ask: 5_400_000, grade: 50, scout: "M. Arroyo", lastActivity: "1d ago" },
  { id: "20", player: "L. Beaumont", position: "SP", club: "Bayside Nine", stage: "Workout", ask: 21_000_000, grade: 65, scout: "P. Lindqvist", lastActivity: "7h ago" },
  { id: "21", player: "K. Adeyemi", position: "OF", club: "Ironwood Foxes", stage: "Signed", ask: 12_250_000, grade: 60, scout: "R. Osei", lastActivity: "1w ago" },
  { id: "22", player: "T. Vasquez", position: "2B", club: "Cascade Pilots", stage: "Scouted", ask: 1_500_000, scout: "L. Moreau", lastActivity: "4d ago" },
  { id: "23", player: "J. Lindgren", position: "RP", club: "Northgate Owls", stage: "Contacted", ask: 3_900_000, grade: 50, scout: "K. Tanaka", lastActivity: "2d ago" },
  { id: "24", player: "M. Okonkwo", position: "3B", club: "River Hawks", stage: "Workout", ask: 7_700_000, grade: 55, scout: "M. Arroyo", lastActivity: "1d ago" },
  { id: "25", player: "P. Aoki", position: "SS", club: "Harbor Cats", stage: "Scouted", ask: 2_300_000, grade: 45, scout: "L. Moreau", lastActivity: "2w ago" },
  { id: "26", player: "D. Ferrante", position: "SP", club: "Copper Kings", stage: "Offer", ask: 27_000_000, grade: 70, scout: "S. Whitfield", lastActivity: "1h ago" },
  { id: "27", player: "R. Silva", position: "LF", club: "Dust Devils", stage: "Contacted", ask: 6_800_000, grade: 55, scout: "P. Lindqvist", lastActivity: "3d ago" },
  { id: "28", player: "C. Mbeki", position: "RF", club: "Bayside Nine", stage: "Scouted", ask: 1_900_000, scout: "R. Osei", lastActivity: "5d ago" },
  { id: "29", player: "S. Novak", position: "C", club: "Ironwood Foxes", stage: "Workout", ask: 4_500_000, grade: 50, scout: "K. Tanaka", lastActivity: "2d ago" },
  { id: "30", player: "A. Guerrero", position: "UTL", club: "Cascade Pilots", stage: "Signed", ask: 5_500_000, grade: 55, scout: "M. Arroyo", lastActivity: "2w ago" },
  { id: "31", player: "E. Thorne", position: "RP", club: "River Hawks", stage: "Scouted", ask: 900_000, scout: "L. Moreau", lastActivity: "3w ago" },
  { id: "32", player: "H. Villanueva", position: "OF", club: "Northgate Owls", stage: "Offer", ask: 16_500_000, grade: 60, scout: "S. Whitfield", lastActivity: "4h ago" },
  { id: "33", player: "N. Baptiste", position: "CF", club: "Harbor Cats", stage: "Contacted", ask: 8_900_000, grade: 55, scout: "P. Lindqvist", lastActivity: "2d ago" },
  { id: "34", player: "G. Sorensen", position: "1B", club: "Copper Kings", stage: "Scouted", ask: 2_800_000, grade: 45, scout: "R. Osei", lastActivity: "1w ago" },
  { id: "35", player: "Y. Cho", position: "2B", club: "Dust Devils", stage: "Workout", ask: 6_200_000, grade: 55, scout: "K. Tanaka", lastActivity: "9h ago" },
  { id: "36", player: "O. Farrell", position: "SP", club: "Bayside Nine", stage: "Contacted", ask: 10_500_000, grade: 60, scout: "M. Arroyo", lastActivity: "5d ago" },
  { id: "37", player: "J. Antunes", position: "3B", club: "Ironwood Foxes", stage: "Scouted", ask: 2_000_000, scout: "L. Moreau", lastActivity: "6d ago" },
  { id: "38", player: "B. Haruki", position: "RF", club: "Cascade Pilots", stage: "Signed", ask: 14_000_000, grade: 60, scout: "P. Lindqvist", lastActivity: "3w ago" },
  { id: "39", player: "M. Delacroix", position: "SS", club: "River Hawks", stage: "Contacted", ask: 7_100_000, grade: 55, scout: "S. Whitfield", lastActivity: "1d ago" },
  { id: "40", player: "W. Bonsu", position: "DH", club: "Northgate Owls", stage: "Scouted", ask: 3_400_000, scout: "R. Osei", lastActivity: "2d ago" },
  { id: "41", player: "F. Lindström", position: "LF", club: "Harbor Cats", stage: "Workout", ask: 5_800_000, grade: 50, scout: "K. Tanaka", lastActivity: "1d ago" },
  { id: "42", player: "A. Petrakis", position: "C", club: "Copper Kings", stage: "Scouted", ask: 1_600_000, scout: "L. Moreau", lastActivity: "10d ago" },
  { id: "43", player: "T. Iwamoto", position: "RP", club: "Dust Devils", stage: "Offer", ask: 4_200_000, grade: 55, scout: "M. Arroyo", lastActivity: "8h ago" },
  { id: "44", player: "L. Cardoso", position: "CF", club: "Bayside Nine", stage: "Signed", ask: 19_500_000, grade: 65, scout: "S. Whitfield", lastActivity: "4d ago" },
];

/** Leads still waiting on a scouting grade — what the Scouting nav badge counts. */
export const pendingAnalysisCount = (leads: Lead[]) =>
  leads.filter((lead) => lead.grade === undefined).length

/* Navigation tree, per tenant. Mimics a server response that tells the
 * shell which tenants exist and which menu groups each one gets — there are
 * no fixed menu items; everything hangs off the selected tenant. Icons are
 * names the shell maps to components (JSON cannot carry a component). An
 * item is either an in-app route (`to`) or an external link (`href`). */

export type NavIcon =
  | 'swatch'
  | 'cube-transparent'
  | 'book-open'
  | 'lifebuoy'
  | 'rectangle-group'
  | 'arrows-right-left'
  | 'chart-pie'
  | 'cog'
  | 'cube'
  | 'users'

/* A badge the shell resolves to a live count; the tree only names the
 * source, the shell decides how to compute it. */
export type NavBadge = 'pending-analysis'

export type NavItem =
  | { label: string; to: string; icon: NavIcon; badge?: NavBadge; href?: undefined }
  | { label: string; href: string; icon: NavIcon; badge?: NavBadge; to?: undefined }

export interface NavGroup {
  label: string
  items: NavItem[]
}

export interface NavTenant {
  id: string
  name: string
  plan: string
  groups: NavGroup[]
}

export interface NavTree {
  /** id of the tenant selected when the URL belongs to no tenant. */
  defaultTenant: string
  tenants: NavTenant[]
}

export const defaultTenant = (tree: NavTree) =>
  tree.tenants.find((tenant) => tenant.id === tree.defaultTenant) ?? tree.tenants[0]

/** First in-app route of a tenant's menu — where switching to it lands. */
export const firstRoute = (tenant: NavTenant) =>
  tenant.groups.flatMap((group) => group.items).find((item) => item.to)?.to

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const productsQuery = queryOptions({
  queryKey: ['products'],
  queryFn: async () => {
    await delay(600)
    return PRODUCTS
  },
})

export const revenueQuery = queryOptions({
  queryKey: ['revenue'],
  queryFn: async () => {
    await delay(450)
    return REVENUE
  },
})

export const statsQuery = queryOptions({
  queryKey: ['stats'],
  queryFn: async () => {
    await delay(300)
    return STATS
  },
})

export const navigationQuery = queryOptions({
  queryKey: ['navigation'],
  queryFn: async () => {
    await delay(200)
    return navTree as NavTree
  },
})

export const leadsQuery = queryOptions({
  queryKey: ['leads'],
  queryFn: async () => {
    await delay(350)
    return LEADS
  },
})
