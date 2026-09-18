import { queryOptions } from '@tanstack/react-query'
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

export type NavItem =
  | { label: string; to: string; icon: NavIcon; href?: undefined }
  | { label: string; href: string; icon: NavIcon; to?: undefined }

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
