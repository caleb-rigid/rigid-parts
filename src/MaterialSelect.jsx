import { useState, useEffect } from 'react'
import {
  MATERIAL_CATEGORIES, MATERIAL_SIZES,
  PLATE_GRADES, PLATE_THICKNESSES,
  SHEET_MATERIALS, SHEET_GAUGES,
  buildMaterialString,
} from './materials'

export default function MaterialSelect({ value, onChange }) {
  const [cat, setCat] = useState('')
  const [size, setSize] = useState('')
  const [sub1, setSub1] = useState('')
  const [sub2, setSub2] = useState('')

  useEffect(() => {
    onChange(buildMaterialString(cat, size, sub1, sub2))
  }, [cat, size, sub1, sub2])

  const handleCat = (v) => { setCat(v); setSize(''); setSub1(''); setSub2('') }
  const handleSub1 = (v) => { setSub1(v); setSub2('') }

  const sizes = cat ? MATERIAL_SIZES[cat] : null
  const isPlate = cat === 'Plate'
  const isSheet = cat === 'Sheet Metal'
  const isOther = cat === 'Other'

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
      <select className="fi" value={cat} onChange={e=>handleCat(e.target.value)}>
        <option value="">Select category…</option>
        {MATERIAL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
      </select>

      {sizes && sizes.length > 0 && (
        <select className="fi" value={size} onChange={e=>setSize(e.target.value)}>
          <option value="">Select size…</option>
          {sizes.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      )}

      {isPlate && (
        <>
          <select className="fi" value={sub1} onChange={e=>handleSub1(e.target.value)}>
            <option value="">Select grade…</option>
            {PLATE_GRADES.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
          <select className="fi" value={sub2} onChange={e=>setSub2(e.target.value)}>
            <option value="">Select thickness…</option>
            {PLATE_THICKNESSES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </>
      )}

      {isSheet && (
        <>
          <select className="fi" value={sub1} onChange={e=>handleSub1(e.target.value)}>
            <option value="">Select material…</option>
            {SHEET_MATERIALS.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
          <select className="fi" value={sub2} onChange={e=>setSub2(e.target.value)}>
            <option value="">Select gauge / thickness…</option>
            {SHEET_GAUGES.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </>
      )}

      {isOther && (
        <input className="fi" type="text" placeholder="Describe material…"
          value={sub1} onChange={e=>setSub1(e.target.value)} />
      )}

      {value && (
        <div style={{
          fontFamily:'Courier New,monospace', fontSize:'12px',
          color:'#f97316', background:'#111', border:'1px solid #1e1e1e',
          borderLeft:'3px solid #f97316', padding:'6px 10px', borderRadius:'4px'
        }}>
          {value}
        </div>
      )}
    </div>
  )
}
