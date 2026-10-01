"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChefHat,
  Clock3,
  Heart,
  Leaf,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

type MenuItem = {
  id: number | string;
  nama: string;
  kategori: string;
  harga: number;
  deskripsi: string;
  status: string;
  gambar: string;
};

const fallbackMenu: MenuItem[] = [
  {
    id: 1,
    nama: "Nasi Goreng Spesial Royal",
    kategori: "Makanan Utama",
    harga: 38000,
    deskripsi: "Nasi goreng aromatik, udang segar, ayam kampung, dan telur mata sapi.",
    status: "tersedia",
    gambar: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    nama: "Rendang Daging Minang",
    kategori: "Makanan Utama",
    harga: 48000,
    deskripsi: "Daging sapi pilihan dimasak perlahan dengan rempah dan santan kelapa.",
    status: "tersedia",
    gambar: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    nama: "Sate Ayam Madura",
    kategori: "Makanan Utama",
    harga: 35000,
    deskripsi: "Sate bakar arang kelapa dengan saus kacang gurih dan lontong pulen.",
    status: "tersedia",
    gambar: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    nama: "Ayam Bakar Taliwang",
    kategori: "Makanan Utama",
    harga: 42000,
    deskripsi: "Ayam muda berbumbu cabai khas Lombok, jeruk limau, dan terasi bakar.",
    status: "tersedia",
    gambar: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    nama: "Gurame Bakar Madu",
    kategori: "Seafood",
    harga: 65000,
    deskripsi: "Gurame segar dibakar dengan madu alami dan bumbu rempah pilihan.",
    status: "tersedia",
    gambar: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    nama: "Gado-Gado Penganten",
    kategori: "Makanan Utama",
    harga: 32000,
    deskripsi: "Sayuran segar, tahu, tempe, dan telur dengan saus kacang mete.",
    status: "tersedia",
    gambar: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 7,
    nama: "Es Cendol Nusa",
    kategori: "Minuman",
    harga: 18000,
    deskripsi: "Cendol pandan, gula aren cair, dan santan dingin yang lembut.",
    status: "tersedia",
    gambar: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 8,
    nama: "Pisang Goreng Madu",
    kategori: "Dessert",
    harga: 22000,
    deskripsi: "Pisang raja renyah berlapis madu, disajikan hangat dengan gula aren.",
    status: "tersedia",
    gambar: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",
  },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(fallbackMenu);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Array<number | string>>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

    fetch(`${apiUrl}/api/menu?limit=0`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Menu API is unavailable");
        return response.json();
      })
      .then((payload: { data?: MenuItem[] }) => {
        if (Array.isArray(payload.data) && payload.data.length > 0) {
          setMenuItems(payload.data);
          setApiConnected(true);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => ["Semua", ...new Set(menuItems.map((item) => item.kategori))],
    [menuItems],
  );

  const visibleMenu = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("id-ID");
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "Semua" || item.kategori === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        `${item.nama} ${item.deskripsi} ${item.kategori}`
          .toLocaleLowerCase("id-ID")
          .includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, search, selectedCategory]);

  const cartItems = useMemo(
    () => menuItems.filter((item) => cart[String(item.id)]),
    [cart, menuItems],
  );
  const cartCount = Object.values(cart).reduce((total, count) => total + count, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.harga * cart[String(item.id)],
    0,
  );

  function changeQuantity(item: MenuItem, amount: number) {
    const itemId = String(item.id);
    setCart((current) => {
      const nextCount = (current[itemId] ?? 0) + amount;
      const next = { ...current };
      if (nextCount <= 0) delete next[itemId];
      else next[itemId] = nextCount;
      return next;
    });
  }

  function toggleFavorite(itemId: number | string) {
    setFavorites((current) =>
      current.includes(itemId)
        ? current.filter((favoriteId) => favoriteId !== itemId)
        : [...current, itemId],
    );
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#beranda" aria-label="Rasa Nusantara, beranda">
          <span className="brand-mark"><Leaf size={20} strokeWidth={1.8} /></span>
          <span className="brand-copy"><strong>rasa nusa</strong><small>DAPUR NUSANTARA</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          <a className="nav-active" href="#menu">Menu</a>
          <a href="#cerita">Cerita kami</a>
          <a href="#kunjungi">Kunjungi</a>
        </nav>
        <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Buka keranjang, ${cartCount} item`}>
          <ShoppingBag size={18} strokeWidth={1.8} />
          <span className="cart-label">Pesanan</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      </header>

      <section className="hero" id="beranda">
        <div className="hero-image" role="img" aria-label="Hidangan Nusantara tersaji hangat di atas meja" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow"><span /> DARI DAPUR, DENGAN CERITA</p>
          <h1>Rasa yang selalu<br />ingin <em>pulang.</em></h1>
          <div className="hero-bottom">
            <p>Resep warisan, bahan pilihan, dan waktu yang cukup untuk membuat semuanya terasa istimewa.</p>
            <a className="hero-link" href="#menu">Jelajahi menu <ArrowDown size={16} /></a>
          </div>
        </div>
        <div className="hero-note"><Sparkles size={15} /><span>Masakan rumahan, dirayakan setiap hari</span></div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span /> MENU HARI INI</p>
            <h2>Yang hangat dari <em>dapur kami.</em></h2>
          </div>
          <p className="menu-caption">Dimasak segar setelah dipesan.<br />Dibuat untuk dinikmati bersama.</p>
        </div>

        <div className="menu-toolbar">
          <div className="category-list" role="group" aria-label="Filter kategori menu">
            {categories.map((category) => (
              <button
                className={`category-button${selectedCategory === category ? " selected" : ""}`}
                key={category}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="search-box">
            <Search size={17} strokeWidth={1.8} />
            <input
              type="search"
              placeholder="Cari hidangan..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Cari hidangan"
            />
            {search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Hapus pencarian"><X size={14} /></button>}
          </label>
        </div>

        <div className="menu-meta">
          <span>{visibleMenu.length} hidangan</span>
          <span className="availability"><span className={apiConnected ? "status-dot live" : "status-dot"} />{apiConnected ? "Menu diperbarui" : "Pilihan dapur hari ini"}</span>
        </div>

        {visibleMenu.length > 0 ? (
          <div className="menu-grid">
            {visibleMenu.map((item, index) => {
              const unavailable = item.status.toLowerCase() === "habis";
              const quantity = cart[String(item.id)] ?? 0;
              const isFavorite = favorites.includes(item.id);
              return (
                <article className="menu-card" key={item.id} style={{ "--card-index": index } as React.CSSProperties}>
                  <div
                    className="dish-image"
                    style={{ backgroundImage: `url("${item.gambar}")` }}
                  >
                    <span className="dish-category">{item.kategori}</span>
                    <button
                      className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
                      onClick={() => toggleFavorite(item.id)}
                      aria-label={isFavorite ? `Hapus ${item.nama} dari favorit` : `Simpan ${item.nama} ke favorit`}
                      aria-pressed={isFavorite}
                    >
                      <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    {unavailable && <span className="sold-out">Habis hari ini</span>}
                  </div>
                  <div className="dish-details">
                    <div className="dish-title-row">
                      <h3>{item.nama}</h3>
                      {index === 0 && <span className="staff-pick"><Sparkles size={12} /> Favorit</span>}
                    </div>
                    <p>{item.deskripsi}</p>
                    <div className="dish-footer">
                      <strong>{formatRupiah(item.harga)}</strong>
                      {quantity > 0 ? (
                        <div className="quantity-control" aria-label={`Jumlah ${item.nama}`}>
                          <button onClick={() => changeQuantity(item, -1)} aria-label={`Kurangi ${item.nama}`}><Minus size={14} /></button>
                          <span>{quantity}</span>
                          <button onClick={() => changeQuantity(item, 1)} aria-label={`Tambah ${item.nama}`}><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button className="add-button" disabled={unavailable} onClick={() => changeQuantity(item, 1)} aria-label={`Tambah ${item.nama} ke pesanan`}>
                          <Plus size={15} /> <span>Tambah</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={24} />
            <h3>Belum menemukan yang dicari.</h3>
            <p>Coba kata kunci lain atau pilih kategori berbeda.</p>
            <button onClick={() => { setSearch(""); setSelectedCategory("Semua"); }}>Lihat semua menu <ArrowRight size={15} /></button>
          </div>
        )}
      </section>

      <section className="story-strip" id="cerita">
        <div className="story-icon"><ChefHat size={24} strokeWidth={1.6} /></div>
        <p><span>Di balik setiap hidangan</span> ada resep keluarga, bahan dari petani lokal, dan dapur yang tak pernah terburu-buru.</p>
        <a href="#kunjungi">Kenali dapur kami <ArrowRight size={15} /></a>
      </section>

      <footer className="site-footer" id="kunjungi">
        <a className="brand footer-brand" href="#beranda">
          <span className="brand-mark"><Leaf size={19} strokeWidth={1.8} /></span>
          <span className="brand-copy"><strong>rasa nusa</strong><small>DAPUR NUSANTARA</small></span>
        </a>
        <p>Rasa rumahan, untuk setiap hari.</p>
        <div className="footer-hours"><Clock3 size={15} /><span>Setiap hari, 10.00–22.00</span></div>
        <span className="copyright">© 2026 Rasa Nusantara</span>
      </footer>

      {cartOpen && (
        <div className="cart-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="cart-panel" aria-label="Keranjang pesanan">
            <div className="cart-panel-header">
              <div><p className="eyebrow">PILIHANMU</p><h2>Keranjang <em>pesanan.</em></h2></div>
              <button className="close-cart" onClick={() => setCartOpen(false)} aria-label="Tutup keranjang"><X size={20} /></button>
            </div>
            {cartItems.length ? (
              <>
                <div className="cart-lines">
                  {cartItems.map((item) => (
                    <div className="cart-line" key={item.id}>
                      <div className="cart-line-image" style={{ backgroundImage: `url("${item.gambar}")` }} />
                      <div className="cart-line-copy"><strong>{item.nama}</strong><span>{formatRupiah(item.harga)}</span></div>
                      <div className="quantity-control compact">
                        <button onClick={() => changeQuantity(item, -1)} aria-label={`Kurangi ${item.nama}`}><Minus size={13} /></button>
                        <span>{cart[String(item.id)]}</span>
                        <button onClick={() => changeQuantity(item, 1)} aria-label={`Tambah ${item.nama}`}><Plus size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-summary"><span>Subtotal</span><strong>{formatRupiah(cartTotal)}</strong></div>
                <button className="checkout-button" onClick={() => setCartOpen(false)}>Lanjutkan pesanan <ArrowRight size={17} /></button>
                <p className="cart-note"><Check size={14} /> Dimasak segar setelah pesanan dikonfirmasi</p>
              </>
            ) : (
              <div className="cart-empty"><ShoppingBag size={29} /><p>Keranjangmu masih kosong.</p><span>Temukan hidangan yang ingin kamu nikmati hari ini.</span><button onClick={() => setCartOpen(false)}>Jelajahi menu <ArrowRight size={15} /></button></div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
