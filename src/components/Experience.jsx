import React from 'react'
import { Link } from 'react-router-dom'
import { val, pageHref } from '../lib/siteApi'
/*
  Apni 3 images yahan lagayein (import kar ke ya public folder ka path).
  Links bhi apne hisaab se badal lein.
*/
const panels = [
  {
    id: 1,
    label: 'Our Treatments',
    image: '/images/s1.jpg',
    link: '/treatments',
  },
  {
    id: 2,
    label: 'Herbal Medicines',
    image: '/images/s2.jpg',
    link: '/medicines',
  },
  {
    id: 3,
    label: 'Book Consultation',
    image: '/images/s3.jpg',
    link: '/contact',
  },
]

// Admin > Pages > Home > "Experience Slider Section" (heading + 3 panels: label, link, image)
const ArtOfHealing = ({ page }) => {
  const items = panels.map((d) => ({
    id: d.id,
    label: val(page, `p${d.id}Label`, d.label),
    image: val(page, `p${d.id}Image`, d.image),
    link: pageHref(page?.[`p${d.id}Link`], d.link),
  }))
  return (
    <section className="art-section">
      {/* Heading (Bootstrap container) */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 text-center art-head">
            <span className="art-eyebrow">{val(page, 'expLabel', 'Discover Our Craft')}</span>
            <h2 className="art-title">{val(page, 'expHeading', 'Experience the Art of Natural Healing')}</h2>
          </div>
        </div>
      </div>

      {/* Full width accordion panels */}
      <div className="art-panels">
        {items.map((item) => (
          <Link to={item.link} className="art-panel" key={item.id}>
            <img
              className="art-img"
              src={item.image}
              alt={item.label}
              loading="lazy"
            />
            <div className="art-label">
              <span className="art-label-text">{item.label}</span>
              <span className="art-line" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default ArtOfHealing
