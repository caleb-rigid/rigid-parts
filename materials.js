export const MATERIAL_CATEGORIES = [
  'Wide Flange (W)',
  'S-Beam (S)',
  'Channel (C)',
  'Angle (L)',
  'HSS Square / Rect',
  'HSS Round',
  'Pipe (Sch 40)',
  'Pipe (Sch 80)',
  'Flat Bar',
  'Round Bar',
  'Plate',
  'Sheet Metal',
  'Other',
]
 
export const MATERIAL_SIZES = {
  'Wide Flange (W)': [
    'W4x13','W5x16','W5x19',
    'W6x9','W6x12','W6x15','W6x20','W6x25',
    'W8x10','W8x13','W8x15','W8x18','W8x21','W8x24','W8x28','W8x31','W8x35','W8x40','W8x48','W8x58',
    'W10x12','W10x15','W10x17','W10x19','W10x22','W10x26','W10x30','W10x33','W10x39','W10x45','W10x49','W10x54','W10x60',
    'W12x14','W12x16','W12x19','W12x22','W12x26','W12x30','W12x35','W12x40','W12x45','W12x50','W12x53','W12x58','W12x65',
    'W14x22','W14x26','W14x30','W14x34','W14x38','W14x43','W14x48','W14x53','W14x61','W14x68',
    'W16x26','W16x31','W16x36','W16x40','W16x45','W16x50',
    'W18x35','W18x40','W18x46','W18x50','W18x55','W18x60',
    'W21x44','W21x50','W21x57',
    'W24x55','W24x62','W24x68',
  ],
  'S-Beam (S)': [
    'S3x5.7','S3x7.5','S4x7.7','S4x9.5','S5x10','S5x14.75',
    'S6x12.5','S6x17.25','S8x18.4','S8x23',
    'S10x25.4','S10x35','S12x31.8','S12x35','S12x40.8',
    'S15x42.9','S15x50',
  ],
  'Channel (C)': [
    'C3x4.1','C3x5','C3x6','C4x5.4','C4x7.25',
    'C5x6.7','C5x9','C6x8.2','C6x10.5','C6x13',
    'C7x9.8','C7x12.25','C8x11.5','C8x13.75','C8x18.75',
    'C9x13.4','C9x15','C9x20','C10x15.3','C10x20','C10x25',
    'C12x20.7','C12x25','C12x30','C15x33.9','C15x40','C15x50',
  ],
  'Angle (L)': [
    'L1-1/2x1-1/2x1/8','L1-1/2x1-1/2x3/16',
    'L2x2x1/8','L2x2x3/16','L2x2x1/4','L2x2x5/16',
    'L2-1/2x2-1/2x3/16','L2-1/2x2-1/2x1/4',
    'L3x3x3/16','L3x3x1/4','L3x3x5/16','L3x3x3/8',
    'L3-1/2x3-1/2x1/4','L3-1/2x3-1/2x5/16',
    'L4x4x1/4','L4x4x5/16','L4x4x3/8','L4x4x1/2',
    'L5x5x5/16','L5x5x3/8','L5x5x1/2',
    'L6x6x3/8','L6x6x1/2','L6x6x5/8',
  ],
  'HSS Square / Rect': [
    'HSS1x1x1/8','HSS1-1/2x1-1/2x1/8',
    'HSS2x2x1/8','HSS2x2x3/16','HSS2x2x1/4',
    'HSS2-1/2x2-1/2x3/16','HSS2-1/2x2-1/2x1/4',
    'HSS3x3x3/16','HSS3x3x1/4','HSS3x3x5/16','HSS3x3x3/8',
    'HSS4x4x3/16','HSS4x4x1/4','HSS4x4x5/16','HSS4x4x3/8','HSS4x4x1/2',
    'HSS5x5x3/16','HSS5x5x1/4','HSS5x5x5/16','HSS5x5x3/8','HSS5x5x1/2',
    'HSS6x6x3/16','HSS6x6x1/4','HSS6x6x5/16','HSS6x6x3/8','HSS6x6x1/2',
    'HSS8x8x1/4','HSS8x8x3/8','HSS8x8x1/2',
    'HSS10x10x3/8','HSS10x10x1/2','HSS12x12x1/2',
    'HSS3x2x3/16','HSS3x2x1/4','HSS4x2x3/16','HSS4x2x1/4',
    'HSS4x3x1/4','HSS6x2x3/16','HSS6x2x1/4',
    'HSS6x3x1/4','HSS6x4x1/4','HSS6x4x3/8',
    'HSS8x4x1/4','HSS8x4x3/8','HSS8x6x3/8',
  ],
  'HSS Round': [
    'HSS1.315x0.133','HSS1.660x0.140','HSS1.900x0.145',
    'HSS2.375x0.154','HSS2.375x0.218',
    'HSS2.875x0.203','HSS2.875x0.276',
    'HSS3.500x0.216','HSS3.500x0.300',
    'HSS4.000x0.226','HSS4.000x0.313',
    'HSS4.500x0.237','HSS4.500x0.337',
    'HSS5.563x0.258','HSS6.625x0.280','HSS6.625x0.432',
    'HSS8.625x0.322','HSS8.625x0.500',
    'HSS10.750x0.365','HSS12.750x0.375',
  ],
  'Pipe (Sch 40)': [
    '1/2" Sch 40','3/4" Sch 40','1" Sch 40','1-1/4" Sch 40','1-1/2" Sch 40',
    '2" Sch 40','2-1/2" Sch 40','3" Sch 40','3-1/2" Sch 40',
    '4" Sch 40','5" Sch 40','6" Sch 40','8" Sch 40','10" Sch 40','12" Sch 40',
  ],
  'Pipe (Sch 80)': [
    '1/2" Sch 80','3/4" Sch 80','1" Sch 80','1-1/4" Sch 80','1-1/2" Sch 80',
    '2" Sch 80','2-1/2" Sch 80','3" Sch 80','4" Sch 80','6" Sch 80','8" Sch 80',
  ],
  'Flat Bar': [
    '1/8x1','1/8x1-1/2','1/8x2',
    '3/16x1','3/16x1-1/2','3/16x2','3/16x3',
    '1/4x1','1/4x1-1/2','1/4x2','1/4x2-1/2','1/4x3','1/4x4','1/4x6',
    '3/8x1','3/8x1-1/2','3/8x2','3/8x3','3/8x4','3/8x6',
    '1/2x1','1/2x2','1/2x3','1/2x4','1/2x6',
    '3/4x2','3/4x3','3/4x4','3/4x6',
    '1x2','1x3','1x4','1x6',
  ],
  'Round Bar': [
    '1/4"','3/8"','1/2"','5/8"','3/4"','7/8"','1"',
    '1-1/4"','1-1/2"','1-3/4"','2"','2-1/2"','3"','3-1/2"','4"',
  ],
  'Plate': null, // handled with two sub-selects
  'Sheet Metal': null, // handled with two sub-selects
  'Other': null,
}
 
export const PLATE_GRADES = ['A36','A572 Gr.50','AR400','A514 / T-1']
export const PLATE_THICKNESSES = [
  '3/16"','1/4"','5/16"','3/8"','7/16"','1/2"','5/8"','3/4"','7/8"','1"','1-1/4"','1-1/2"','2"',
]
 
export const SHEET_MATERIALS = [
  'HR Steel','CR Steel','304 Stainless','316 Stainless','6061-T6 Aluminum','5052 Aluminum',
]
export const SHEET_GAUGES = [
  '26ga','24ga','22ga','20ga','18ga','16ga','14ga','12ga','11ga','10ga','7ga','3/16"',
]
 
export function buildMaterialString(cat, size, sub1, sub2) {
  if (!cat) return ''
  if (cat === 'Plate') {
    if (sub1 && sub2) return `PL${sub2} ${sub1}`
    if (sub1) return `PL ${sub1}`
    return 'Plate'
  }
  if (cat === 'Sheet Metal') {
    if (sub1 && sub2) return `${sub2} ${sub1}`
    if (sub1) return sub1
    return 'Sheet Metal'
  }
  if (cat === 'Other') return sub1 || 'Other'
  if (size) return size
  return cat
}
