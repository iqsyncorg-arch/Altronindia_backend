export type ProductLink = {
  /** MongoDB category id (when catalog is loaded from your API) */
  id?: string
  label: string
  /** URL slug for this category segment */
  slug: string
  /** WooCommerce term id — static fallback when MongoDB has no products yet */
  categoryId?: number
  children?: ProductLink[]
}

/** Nested product menu — paths are local `/products/...` routes. */
export const productCategories: ProductLink[] = [
  {
    label: 'CCTV Surveillance',
    slug: 'cctv-surveillance',
    categoryId: 28,
    children: [
      {
        label: 'Analouge Solutions',
        slug: 'analouge-solutions',
        categoryId: 29,
        children: [
          { label: 'American Accuracy Series', slug: 'american-accuracy-series', categoryId: 37 },
          { label: 'IR HIGH SPEED DOME PTZ', slug: 'ir-high-speed-dome-ptz', categoryId: 38 },
          { label: 'Key Board', slug: 'key-board', categoryId: 39 },
        ],
      },
      {
        label: 'AHD Solution',
        slug: 'ahd-solution',
        categoryId: 30,
        children: [
          { label: '1.3-mp', slug: '1-3-mp', categoryId: 40 },
          { label: '2.4-mp', slug: '2-4-mp', categoryId: 41 },
          { label: '5 MP', slug: '5-mp', categoryId: 42 },
          { label: '5 MP Color Gaurd', slug: '5-mp-color-gaurd', categoryId: 43 },
        ],
      },
      {
        label: 'Network Solutions',
        slug: 'network-solutions',
        categoryId: 31,
        children: [
          { label: '2 Mega Pixels', slug: '2-mega-pixels', categoryId: 44 },
          { label: '3 Mega Pixels', slug: '3-mega-pixels', categoryId: 45 },
          { label: '4 Mega Pixels', slug: '4-mega-pixels', categoryId: 46 },
          { label: '5 Mega Pixels', slug: '5-mega-pixels', categoryId: 47 },
          { label: 'IP IR PTZ Series', slug: 'ip-ir-ptz-series', categoryId: 48 },
        ],
      },
      {
        label: 'WIFI Solutions',
        slug: 'wifi-solutions',
        categoryId: 32,
        children: [
          { label: 'AXI IPC B20W 1820', slug: 'axi-ipc-b20w-1820', categoryId: 49 },
          { label: 'AXI WIFI FC 1820', slug: 'axi-wifi-fc-1820', categoryId: 50 },
          { label: 'AXI WIFI S1920 PT', slug: 'axi-wifi-s1920-pt', categoryId: 51 },
        ],
      },
      {
        label: 'Thermal Imaging Solutions',
        slug: 'thermal-imaging-solutions',
        categoryId: 33,
        children: [
          { label: 'AX IPC THERMAL', slug: 'ax-ipc-thermal', categoryId: 52 },
          { label: 'AX IPC THERMAL1', slug: 'ax-ipc-thermal1', categoryId: 53 },
        ],
      },
      {
        label: 'Digital Video Recorders',
        slug: 'digital-video-recorders',
        categoryId: 34,
        children: [
          { label: '2MP DVR', slug: '2mp-dvr', categoryId: 95 },
          { label: '5MP XVR', slug: '5mp-xvr', categoryId: 96 },
        ],
      },
      {
        label: 'Network Video Recorders',
        slug: 'network-video-recorders',
        categoryId: 35,
        children: [
          { label: '2MP NVR', slug: '2mp-nvr', categoryId: 97 },
          { label: '5MP NVR', slug: '5mp-nvr', categoryId: 98 },
        ],
      },
      {
        label: 'Accessories',
        slug: 'accessories',
        categoryId: 36,
        children: [
          { label: 'AXI IPS 5A', slug: 'axi-ips-5a', categoryId: 99 },
          { label: 'AXI IPS 10A', slug: 'axi-ips-10a', categoryId: 100 },
          { label: 'AX V3FC', slug: 'ax-v3fc', categoryId: 101 },
          { label: 'AX BNC P1', slug: 'ax-bnc-p1', categoryId: 102 },
        ],
      },
    ],
  },
  {
    label: 'Fire Alarm Systems',
    slug: 'fire-alarm-systems',
    categoryId: 54,
    children: [
      {
        label: 'Conventional',
        slug: 'conventional',
        categoryId: 85,
        children: [
          { label: 'Conventional Panel', slug: 'conventional-panel', categoryId: 85 },
          { label: 'Smoke Detector', slug: 'smoke-detector', categoryId: 86 },
          { label: 'MCP', slug: 'mcp', categoryId: 87 },
          { label: 'Hooter', slug: 'hooter', categoryId: 88 },
          { label: 'RI', slug: 'ri', categoryId: 89 },
        ],
      },
      {
        label: 'Addressable',
        slug: 'addressable',
        categoryId: 84,
        children: [
          { label: 'Addressable Panel', slug: 'addressable-panel', categoryId: 90 },
          { label: 'Smoke Detector', slug: 'smoke-detector-addressable-panel', categoryId: 91 },
          { label: 'Heat Detector', slug: 'heat-detector', categoryId: 92 },
          { label: 'Isolator Module', slug: 'isolator-module', categoryId: 93 },
          { label: 'MCP', slug: 'mcp-addressable-panel', categoryId: 94 },
        ],
      },
    ],
  },
  {
    label: 'Access Control Systems',
    slug: 'access-control-systems',
    categoryId: 55,
    children: [
      { label: 'Boom Barrier', slug: 'boom-barrier', categoryId: 75 },
      { label: 'Proximity Attendance', slug: 'proximity-attendance', categoryId: 76 },
      { label: 'Proximity Access Control', slug: 'proximity-access-control', categoryId: 77 },
      { label: 'Biometric Systems', slug: 'biometric-systems', categoryId: 78 },
      { label: 'iFace Recognize', slug: 'iface-recognize', categoryId: 79 },
      { label: 'Time Management System', slug: 'time-management-system', categoryId: 80 },
      { label: 'Security Tour Guard', slug: 'security-tour-guard', categoryId: 81 },
      { label: 'Hotel Lock', slug: 'hotel-lock', categoryId: 82 },
    ],
  },
  { label: 'Public Address Systems', slug: 'public-address-systems', categoryId: 61 },
  { label: 'Smart Lighting Systems', slug: 'smart-lighting-systems', categoryId: 56 },
  {
    label: 'Smart Home Solutions – BMS',
    slug: 'smart-home-solutions-bms',
    categoryId: 57,
    children: [
      { label: 'VIDEO DOOR PHONE', slug: 'video-door-phone', categoryId: 70 },
      {
        label: 'Burglar Alarm System',
        slug: 'burglar-alarm-system',
        categoryId: 71,
        children: [
          { label: 'Intrusion Alarm', slug: 'intrusion-alarm', categoryId: 73 },
          { label: 'IP Intrusion Alarm', slug: 'ip-intrusion-alarm', categoryId: 74 },
        ],
      },
      { label: 'Apartment System', slug: 'apartment-system', categoryId: 72 },
    ],
  },
  {
    label: 'Altron Medi Range',
    slug: 'altron-medi-range',
    categoryId: 58,
    children: [
      { label: 'Black Body Thermal Camera', slug: 'black-body-thermal-camera', categoryId: 64 },
      { label: 'Thermographic Turret Camera', slug: 'thermographic-turret-camera', categoryId: 65 },
      {
        label: 'Body Temperature Measurement Camera',
        slug: 'body-temperature-measurement-camera',
        categoryId: 66,
      },
      {
        label: 'Facial Recognition & Access Control',
        slug: 'facial-recognition-access-control',
        categoryId: 67,
      },
      { label: 'Infrared Digital Thermometer', slug: 'infrared-digital-thermometer', categoryId: 68 },
      { label: 'Oximeter', slug: 'oximeter', categoryId: 69 },
    ],
  },
  { label: 'Solar Street Light', slug: 'solar-street-light', categoryId: 59 },
  {
    label: 'Office Automation',
    slug: 'office-automation',
    categoryId: 60,
    children: [
      {
        label: 'MONOCHROME MULTI FUNCTIONAL PRINTERS',
        slug: 'monochrome-multi-functional-printers',
        categoryId: 62,
      },
      {
        label: 'COLOUR MULTI FUNCTIONAL PRINTERS',
        slug: 'colour-multi-functional-printers',
        categoryId: 63,
      },
    ],
  },
]

export { resolveCategoryPath, type ResolvedCategory } from '../lib/resolveCategoryPath'

export function categoryPath(slugs: string[]) {
  return `/products/${slugs.join('/')}`
}

/** Build absolute path for a node given ancestor slug chain. */
export function buildChildPath(parentPath: string, childSlug: string) {
  return `${parentPath.replace(/\/$/, '')}/${childSlug}`
}
