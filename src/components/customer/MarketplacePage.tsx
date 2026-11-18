import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Heart,
  ShoppingBag,
  X,
  MapPin,
  Store,
  ArrowUpDown,
  RefreshCw,
  Layers,
  Leaf,
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ProductCategory } from '../../types';

export const MarketplacePage: React.FC = () => {
  const {
    products,
    brands,
    selectedCategory,
    setSelectedCategory,
    selectedBrandFilter,
    setSelectedBrandFilter,
    brandCollectionId,
    setBrandCollectionId,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    setActiveProductModal,
    setActiveShopModal,
    setSelectedMapShopId,
    addToCart,
    user,
    toggleFavoriteProduct,
    setCustomerTab
  } = useApp();

  const activeBrands = brands.filter((b) => b.status !== 'deactivated');

  const categoryCards: {
    name: ProductCategory | 'All';
    label: string;
    desc: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      name: 'All',
      label: 'All Products',
      desc: 'Full sustainable catalog',
      icon: <Store className="w-5 h-5" />,
      count: products.length
    },
    {
      name: 'Reusable Products',
      label: 'Reusable Products',
      desc: 'Bottles, lunch boxes & totes',
      icon: <RefreshCw className="w-5 h-5" />,
      count: products.filter((p) => p.category === 'Reusable Products').length
    },
    {
      name: 'Refill Products',
      label: 'Refill Products',
      desc: 'Bulk soaps & home care',
      icon: <Layers className="w-5 h-5" />,
      count: products.filter((p) => p.category === 'Refill Products').length
    },
    {
      name: 'Recycled Products',
      label: 'Recycled Products',
      desc: 'Upcycled sacks & paper',
      icon: <Leaf className="w-5 h-5" />,
      count: products.filter((p) => p.category === 'Recycled Products').length
    },
    {
      name: 'Plastic-Free Alternatives',
      label: 'Plastic-Free',
      desc: 'Bamboo & solid bars',
      icon: <ShieldCheck className="w-5 h-5" />,
      count: products.filter((p) => p.category === 'Plastic-Free Alternatives').length
    }
  ];

  // If a brand collection is active, find that brand
  const activeBrandCollection = activeBrands.find((b) => b.id === brandCollectionId);

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (brandCollectionId && product.brandId !== brandCollectionId) {
      return false;
    }

    if (selectedBrandFilter !== 'All' && product.brandId !== selectedBrandFilter) {
      return false;
    }

    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brandName.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc && !matchCat) {
        return false;
      }
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const handleSelectShop = (brandId: string) => {
    if (brandCollectionId === brandId) {
      setBrandCollectionId(null);
    } else {
      setBrandCollectionId(brandId);
      setSelectedBrandFilter('All');
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Main Marketplace Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#DCE4DB]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#26332B] font-heading">
            Cambodia Sustainable Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-[#718078] mt-1">
            Browse eco-friendly categories and local Cambodian sustainable shops.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#718078] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or shops..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FFFFFF] border border-[#DCE4DB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#286B4A] text-[#26332B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#718078] hover:text-[#26332B]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setCustomerTab('map')}
            className="px-4 py-2.5 rounded-xl bg-[#EDF4EB] hover:bg-[#DCE4DB] text-[#286B4A] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#A8C5A0]/60 transition-colors shrink-0"
          >
            <MapPin className="w-4 h-4" />
            <span>View Shop Map</span>
          </button>
        </div>
      </div>

      {/* Section 1: Product Categories */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#26332B] font-heading">
              Product Categories
            </h2>
            <p className="text-xs text-[#718078]">
              Select a sustainability category to filter products
            </p>
          </div>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-[#286B4A] hover:underline"
            >
              Show all categories
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categoryCards.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#286B4A] text-white border-[#286B4A] eco-shadow-sm'
                    : 'bg-[#FFFFFF] text-[#26332B] border-[#DCE4DB] hover:border-[#286B4A]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/15 text-white' : 'bg-[#EDF4EB] text-[#286B4A]'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      isActive ? 'text-[#E6B84A]' : 'text-[#286B4A]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm font-heading leading-snug">
                    {cat.label}
                  </h3>
                  <p
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      isActive ? 'text-white/80' : 'text-[#718078]'
                    }`}
                  >
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2: Cambodian Sustainable Shops List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#26332B] font-heading">
              Cambodian Sustainable Shops
            </h2>
            <p className="text-xs text-[#718078]">
              Local refill stations, plastic-free boutiques, and upcycled makers in Phnom Penh
            </p>
          </div>
          {brandCollectionId && (
            <button
              onClick={() => setBrandCollectionId(null)}
              className="text-xs font-semibold text-[#286B4A] hover:underline"
            >
              Show products from all shops
            </button>
          )}
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] divide-y divide-[#DCE4DB] eco-shadow-sm overflow-hidden">
          {activeBrands.map((shop) => {
            const isSelected = brandCollectionId === shop.id;
            const shopProductCount = products.filter((p) => p.brandId === shop.id).length;

            return (
              <div
                key={shop.id}
                className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  isSelected ? 'bg-[#EDF4EB]/50' : 'hover:bg-[#F7F8F2]/60'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[#EDF4EB] text-2xl flex items-center justify-center border border-[#DCE4DB] shrink-0">
                    {shop.logo}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-[#26332B] font-heading">
                        {shop.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-[#286B4A] bg-[#EDF4EB] px-2 py-0.5 rounded">
                        {shop.category}
                      </span>
                      <span className="text-[11px] text-[#718078] tabular-nums">
                        · {shopProductCount} products
                      </span>
                    </div>
                    <p className="text-xs text-[#718078] line-clamp-2 max-w-2xl">
                      {shop.shortDescription}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#718078] pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#286B4A] shrink-0" />
                        {shop.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#286B4A] shrink-0" />
                        {shop.openingHours}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 lg:justify-end">
                  <button
                    onClick={() => setActiveShopModal(shop)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[#26332B] bg-[#F7F8F2] hover:bg-[#DCE4DB] border border-[#DCE4DB] transition-colors"
                  >
                    Shop Info
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMapShopId(shop.id);
                      setCustomerTab('map');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[#286B4A] bg-[#EDF4EB] hover:bg-[#DCE4DB] transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>On Map</span>
                  </button>
                  <button
                    onClick={() => handleSelectShop(shop.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-[#26332B] text-white hover:bg-[#286B4A]'
                        : 'bg-[#286B4A] text-white hover:bg-[#1F543A]'
                    }`}
                  >
                    <span>{isSelected ? 'Showing Shop Products' : 'View Products'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Brand Collection Banner (When browsing a specific shop) */}
      {activeBrandCollection && (
        <div className="bg-[#FFFFFF] border border-[#286B4A]/30 rounded-2xl p-5 eco-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#EDF4EB] text-2xl flex items-center justify-center border border-[#DCE4DB] shrink-0">
              {activeBrandCollection.logo}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#286B4A] uppercase tracking-wider">
                Filtered by Shop · {activeBrandCollection.district}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#26332B] font-heading">
                Products by {activeBrandCollection.name}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setBrandCollectionId(null)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#F7F8F2] hover:bg-[#DCE4DB] text-[#26332B] border border-[#DCE4DB] flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear Shop Filter</span>
          </button>
        </div>
      )}

      {/* Section 3: Product Catalog & Sorting */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#26332B] font-heading">
              {activeBrandCollection
                ? `${activeBrandCollection.name} Catalog`
                : selectedCategory === 'All'
                ? 'All Sustainable Products'
                : selectedCategory}
            </h2>
            <p className="text-xs text-[#718078]">
              Showing {sortedProducts.length} verified eco-friendly products in Cambodia
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {!brandCollectionId && (
              <select
                value={selectedBrandFilter}
                onChange={(e) => setSelectedBrandFilter(e.target.value)}
                className="bg-[#FFFFFF] border border-[#DCE4DB] text-[#26332B] rounded-lg px-3 py-2 focus:outline-none focus:border-[#286B4A] text-xs font-medium"
              >
                <option value="All">All Shops</option>
                {activeBrands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#DCE4DB] rounded-lg px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#718078]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recommended' | 'price-asc' | 'price-desc' | 'newest')}
                className="bg-transparent text-[#26332B] focus:outline-none text-xs font-medium"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {(selectedCategory !== 'All' || selectedBrandFilter !== 'All' || searchQuery || brandCollectionId) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#718078]">
            <span>Active filters:</span>
            {selectedCategory !== 'All' && (
              <span className="bg-[#EDF4EB] text-[#286B4A] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')}>
                  <X className="w-3 h-3 hover:text-[#26332B]" />
                </button>
              </span>
            )}
            {(selectedBrandFilter !== 'All' || brandCollectionId) && (
              <span className="bg-[#EDF4EB] text-[#286B4A] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                Shop: {brands.find((b) => b.id === (brandCollectionId || selectedBrandFilter))?.name}
                <button
                  onClick={() => {
                    setSelectedBrandFilter('All');
                    setBrandCollectionId(null);
                  }}
                >
                  <X className="w-3 h-3 hover:text-[#26332B]" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-[#EDF4EB] text-[#286B4A] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-3 h-3 hover:text-[#26332B]" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedBrandFilter('All');
                setBrandCollectionId(null);
                setSearchQuery('');
              }}
              className="text-xs text-[#286B4A] font-semibold hover:underline ml-1"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] p-12 text-center text-[#718078] space-y-3">
            <Store className="w-12 h-12 text-[#A8C5A0] mx-auto" />
            <h3 className="text-base font-bold text-[#26332B] font-heading">
              No products found
            </h3>
            <p className="text-xs max-w-sm mx-auto">
              Try adjusting your search terms or selecting a different category or shop filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedBrandFilter('All');
                setSearchQuery('');
                setBrandCollectionId(null);
              }}
              className="bg-[#286B4A] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#1F543A] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sortedProducts.map((prod) => {
              const isFav = user.favoriteProductIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] overflow-hidden hover:eco-shadow-sm transition-all flex flex-col justify-between group"
                >
                  <div className="relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-48 object-cover bg-[#F7F8F2] group-hover:scale-102 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/product_bamboo_goods_1794475239108.jpg';
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteProduct(prod.id);
                      }}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-colors shadow-xs ${
                        isFav
                          ? 'bg-white text-[#D9534F]'
                          : 'bg-white/80 text-[#718078] hover:text-[#26332B]'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-white/95 text-[#286B4A] px-2 py-0.5 rounded backdrop-blur-xs">
                      {prod.category}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <button
                        onClick={() => setBrandCollectionId(prod.brandId)}
                        className="text-[11px] text-[#718078] hover:text-[#286B4A] truncate mb-0.5 text-left block"
                      >
                        {prod.brandName}
                      </button>
                      <h3
                        onClick={() => setActiveProductModal(prod)}
                        className="font-semibold text-sm text-[#26332B] line-clamp-1 hover:text-[#286B4A] cursor-pointer"
                      >
                        {prod.name}
                      </h3>
                      <p className="text-xs text-[#718078] line-clamp-2 mt-1 leading-snug">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#DCE4DB] flex items-center justify-between">
                      <div>
                        <span className="text-base font-bold text-[#286B4A] font-heading tabular-nums">
                          ${prod.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveProductModal(prod)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#286B4A] hover:bg-[#EDF4EB] transition-colors"
                        >
                          Details
                        </button>
                        <button
                          disabled={!prod.inStock}
                          onClick={() => addToCart(prod, 1)}
                          className={`p-2 rounded-lg transition-colors shadow-xs ${
                            prod.inStock
                              ? 'bg-[#286B4A] hover:bg-[#1F543A] text-white'
                              : 'bg-[#DCE4DB] text-[#718078] cursor-not-allowed'
                          }`}
                          title={prod.inStock ? 'Add to Bag' : 'Out of stock'}
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
