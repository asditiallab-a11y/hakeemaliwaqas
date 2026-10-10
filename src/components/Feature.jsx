import { buyUrl } from '../lib/whatsapp'
import React from 'react';
import { Link } from 'react-router-dom';
import { val } from '../lib/siteApi';

/*
  Images apni marzi se yahan replace kar lein (import kar ke ya public folder ka path).
  wide: true wale cards 2 column ke hote hain (video mein neeche wali row jaisa).
*/
const products = [
  {
    id: 1,
    title: 'Kushta Sona',
    text: 'Packing: 1 Gram , 2 Gram , 3 Gram KUSHTA SONA PREMIUM UNANI PREPARATION of pure gold processed by traditional methods.',
    image: '/images/kushta.jpg',
    link: '#',
  },
  {
    id: 2,
    title: 'Majoon Shadi Course',
    text: 'Packing: COMPLETE COURSE PACK Majoon Shadi Course High-quality Unani preparation for marital strength and vitality.',
    image: '/images/wedding.jpg',
    link: '#',
  },
  {
    id: 3,
    title: 'Sada Jawaan Course',
    text: 'Methi (Trigonella foenum-graecum) is a common kitchen ingredient that doubles as a powerful traditional herbal remedy.',
    image: '/images/young.jpg',
    link: '#',
  },
  {
    id: 4,
    title: 'Haldi (Turmeric)',
    text: 'Turmeric (Curcuma longa) is the most researched medicinal herb on Earth. Its active compound curcumin supports healing.',
    image: '/images/haldi.jpg',
    link: '#',
  },
  {
    id: 5,
    title: 'Shilajit (Mineral Pitch)',
    text: 'Shilajit is a sticky mineral-rich substance found in the Himalayan mountains, formed over centuries from decomposed plant matter. It contains over 84 minerals and Fulvic Acid.',
    image: '/images/shilajit.jpg',
    link: '#',
    wide: true,
  },
  {
    id: 6,
    title: 'Kalonji (Black Seed)',
    text: 'Kalonji (Nigella sativa) is one of the most revered herbs in Islamic and Unani medicine. The Prophet Muhammad (PBUH) said it is a cure for every disease except death. Rich in thymoquinone.',
    image: '/images/shilajit.jpg',
    link: '#',
    wide: true,
  },
]

const LeafIcon = () => (
  <svg
    className="fp-leaf"
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 3C11 3 4 8 4 15c0 1.6.4 3 1.2 4.2" />
    <path d="M21 3c0 9-4.5 16-13 16-1 0-1.9-.1-2.8-.4" />
    <path d="M3 21c2-5 5.5-9 11-12" />
  </svg>
)

const CartIcon = () => (
  <svg
    className="fp-cart"
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
)

// Buy Now: WhatsApp number (Admin > Settings) ho to wahan order message, warna Herbal Medicines page
const buyLink = (title, whatsapp, price) => ({
  href: buyUrl(whatsapp, { name: title, price }),
  external: true,
})

// Card ki width: har 4 ka group; aakhri group (1-3 cards) poori row bhar deta hai
const colClass = (index, total) => {
  const groupStart = Math.floor(index / 4) * 4
  const size = Math.min(4, total - groupStart)
  return { 1: 'col-lg-6', 2: 'col-lg-6', 3: 'col-lg-4', 4: 'col-lg-3' }[size]
}

// Admin > Pages > Home > "Products Section Header"; cards = Medicines jin par "Show on Home Page" on hai
const FeaturedProducts = ({ page, medicines, whatsapp }) => {
  const items = medicines
    ? medicines.map((m) => ({ id: m.id, title: m.title, text: m.description, image: m.image, price: m.price }))
    : products
  if (!items.length) return null
  const badge = val(page, 'prodBadge', '100% Natural')
  return (
    <section className="fp-section">
      <div className="container fp-container">
        {/* Heading */}
        <div className="fp-head text-center">
          <span className="fp-eyebrow">{val(page, 'prodLabel', 'Our Products')}</span>
          <h2 className="fp-title">{val(page, 'prodHeading', 'Featured Products')}</h2>
          <p className="fp-subtitle">{val(page, 'prodDesc', 'Explore our collection')}</p>
          <span className="fp-line" />
        </div>

        {/* Cards */}
        <div className="row fp-row justify-content-center">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`col-12 col-sm-6 ${colClass(i, items.length)}`}
            >
              <article className="fp-card">
                <div className="fp-img">
                  {item.image && <img src={item.image} alt={item.title} loading="lazy" />}
                </div>

                <div className="fp-body">
                  <h3 className="fp-card-title">{item.title}</h3>
                  <p className="fp-text">{item.text}</p>

                  <div className="fp-natural">
                    <LeafIcon />
                    <span>{badge}</span>
                  </div>

                  {(() => {
                    const b = buyLink(item.title, whatsapp, item.price)
                    const inner = (
                      <>
                        <CartIcon />
                        <span>Buy Now</span>
                      </>
                    )
                    return b.external ? (
                      <a href={b.href} className="fp-buy" target="_blank" rel="noreferrer">{inner}</a>
                    ) : (
                      <Link to={b.href} className="fp-buy">{inner}</Link>
                    )
                  })()}
                </div>
              </article>
            </div>
          ))}
        </div>

        {/* View all */}
        <div className="text-center fp-more">
          <Link to="/herbal-medicines" className="fp-view-all">
            <span>View All Products</span>
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
