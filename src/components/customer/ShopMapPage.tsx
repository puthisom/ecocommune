import React, { useEffect, useState, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus
} from '@vis.gl/react-google-maps';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Search,
  Navigation,
  ExternalLink,
  Clock,
  Phone,
  ShoppingBag,
  Compass,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Brand, ShopCategory } from '../../types';

const configuredGoogleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
const GOOGLE_MAPS_API_KEY =
  configuredGoogleMapsApiKey &&
  !/^(MY_|YOUR_|REPLACE_|PLACEHOLDER)/i.test(configuredGoogleMapsApiKey)
    ? configuredGoogleMapsApiKey
    : '';

const PHNOM_PENH_CENTER = { lat: 11.5518, lng: 104.9242 };

interface ShopMarkerProps {
  shop: Brand;
  isSelected: boolean;
  isInfoOpen: boolean;
  onSelect: (shop: Brand) => void;
  onCloseInfo: () => void;
  onGetDirections: (shop: Brand) => void;
  onBrowseProducts: (shopId: string) => void;
}

const ShopMarker: React.FC<ShopMarkerProps> = ({
  shop,
  isSelected,
  isInfoOpen,
  onSelect,
  onCloseInfo,
  onGetDirections,
  onBrowseProducts
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: shop.coordinates.lat, lng: shop.coordinates.lng }}
        onClick={() => onSelect(shop)}
        title={shop.name}
        zIndex={isSelected ? 20 : 1}
      >
        <Pin
          background={isSelected ? '#286B4A' : '#FFFFFF'}
          borderColor={isSelected ? '#FFFFFF' : '#286B4A'}
          glyphColor={isSelected ? '#E6B84A' : '#286B4A'}
          scale={isSelected ? 1.25 : 1.0}
        />
      </AdvancedMarker>

      {isInfoOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={onCloseInfo} maxWidth={260}>
          <div className="p-1 space-y-2 text-[#26332B] font-sans">
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none">{shop.logo}</span>
              <div>
                <p className="font-bold text-xs text-[#26332B] leading-snug">{shop.name}</p>
                <p className="text-[11px] text-[#286B4A] font-medium">{shop.category}</p>
              </div>
            </div>
            <p className="text-[11px] text-[#718078] leading-snug">{shop.address}</p>
            <p className="text-[11px] text-[#718078]">{shop.openingHours}</p>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => onGetDirections(shop)}
                className="flex-1 bg-[#286B4A] hover:bg-[#1F543A] text-white px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
              >
                Directions
              </button>
              <button
                onClick={() => onBrowseProducts(shop.id)}
                className="flex-1 bg-[#EDF4EB] hover:bg-[#DCE4DB] text-[#286B4A] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
              >
                Products
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface MapCameraControllerProps {
  selectedShop?: Brand;
  shops: Brand[];
  fitBoundsTrigger: number;
}

const MapCameraController: React.FC<MapCameraControllerProps> = ({
  selectedShop,
  shops,
  fitBoundsTrigger
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedShop) return;
    map.panTo({
      lat: selectedShop.coordinates.lat,
      lng: selectedShop.coordinates.lng
    });
  }, [map, selectedShop]);

  useEffect(() => {
    if (!map || fitBoundsTrigger === 0 || shops.length === 0) return;
    if (shops.length === 1) {
      map.panTo({
        lat: shops[0].coordinates.lat,
        lng: shops[0].coordinates.lng
      });
      map.setZoom(15);
      return;
    }

    const lats = shops.map((s) => s.coordinates.lat);
    const lngs = shops.map((s) => s.coordinates.lng);
    map.fitBounds(
      {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs)
      },
      60
    );
  }, [map, fitBoundsTrigger, shops]);

  return null;
};

const MapStatusBanner: React.FC = () => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-3.5 py-2 text-xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
        <span>
          Unable to load interactive map tiles right now. You can still browse shop locations and open Google Maps directions below.
        </span>
      </div>
    );
  }

  return null;
};

export const ShopMapPage: React.FC = () => {
  const {
    brands,
    setActiveShopModal,
    selectedMapShopId,
    setSelectedMapShopId,
    setBrandCollectionId,
    setCustomerTab
  } = useApp();

  const activeBrands = brands.filter((b) => b.status !== 'deactivated');

  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string>(
    selectedMapShopId || activeBrands[0]?.id || ''
  );
  const [infoWindowShopId, setInfoWindowShopId] = useState<string | null>(
    selectedMapShopId || activeBrands[0]?.id || null
  );
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);

  useEffect(() => {
    if (selectedMapShopId) {
      setSelectedShopId(selectedMapShopId);
      setInfoWindowShopId(selectedMapShopId);
      setSelectedMapShopId(null);
    }
  }, [selectedMapShopId, setSelectedMapShopId]);

  const categories: (ShopCategory | 'All')[] = [
    'All',
    'Refill Shops',
    'Reusable Product Shops',
    'Recycled Product Businesses',
    'Sustainable Lifestyle Stores'
  ];

  // Filter shops
  const filteredShops = activeBrands.filter((shop) => {
    if (selectedCategory !== 'All' && shop.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = shop.name.toLowerCase().includes(q);
      const matchAddress = shop.address.toLowerCase().includes(q);
      const matchDistrict = shop.district.toLowerCase().includes(q);
      if (!matchName && !matchAddress && !matchDistrict) return false;
    }
    return true;
  });

  const currentShop =
    filteredShops.find((b) => b.id === selectedShopId) ||
    activeBrands.find((b) => b.id === selectedShopId) ||
    filteredShops[0] ||
    activeBrands[0];

  const handleShopSelect = useCallback((shop: Brand) => {
    setSelectedShopId(shop.id);
    setInfoWindowShopId(shop.id);
  }, []);

  const handleOpenGoogleMaps = useCallback((shop: Brand) => {
    const query = encodeURIComponent(`${shop.name}, ${shop.address}, Phnom Penh, Cambodia`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.coordinates.lat},${shop.coordinates.lng}&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleBrowseShopProducts = useCallback(
    (shopId: string) => {
      setBrandCollectionId(shopId);
      setCustomerTab('marketplace');
    },
    [setBrandCollectionId, setCustomerTab]
  );

  return (
    <div className="container mx-auto px-4 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#286B4A] uppercase tracking-wider">
              Physical Green Directory
            </span>
            <span className="text-xs text-[#718078]">·</span>
            <span className="text-xs bg-[#EDF4EB] text-[#286B4A] px-2 py-0.5 rounded font-medium">
              Phnom Penh, Cambodia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#26332B] font-heading">
            Sustainable Shop Map
          </h1>
          <p className="text-xs sm:text-sm text-[#718078] mt-0.5">
            Explore participating zero-waste refill stations and local eco stores across Phnom Penh
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#718078] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop or district..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#DCE4DB] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#286B4A] text-[#26332B]"
          />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#286B4A] text-white shadow-xs'
                : 'bg-[#FFFFFF] border border-[#DCE4DB] text-[#26332B] hover:bg-[#F7F8F2]'
            }`}
          >
            {cat === 'All' ? 'All Sustainable Shops' : cat}
          </button>
        ))}
      </div>

      {/* Main Map & Side Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Google Map (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded-2xl border border-[#DCE4DB] overflow-hidden eco-shadow-sm flex flex-col">
          {/* Map Top Bar */}
          <div className="p-3.5 bg-[#F7F8F2] border-b border-[#DCE4DB] flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#286B4A]" />
              <span className="font-semibold text-[#26332B]">Phnom Penh Store Locator</span>
              <span className="text-[#718078] hidden sm:inline">· {filteredShops.length} locations</span>
            </div>
            <button
              onClick={() => setFitBoundsTrigger((n) => n + 1)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#286B4A] hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Fit All Shops</span>
            </button>
          </div>

          {/* Interactive Google Map Canvas */}
          <div className="w-full h-[420px] sm:h-[520px] relative bg-[#EDF4EB]">
            {GOOGLE_MAPS_API_KEY ? (
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker']} language="en" region="KH">
                <MapStatusBanner />
                <div className="w-full h-full">
                  <GoogleMap
                    mapId="DEMO_MAP_ID"
                    defaultCenter={
                      currentShop
                        ? { lat: currentShop.coordinates.lat, lng: currentShop.coordinates.lng }
                        : PHNOM_PENH_CENTER
                    }
                    defaultZoom={14}
                    gestureHandling="greedy"
                    mapTypeControl={true}
                    streetViewControl={true}
                    fullscreenControl={true}
                    zoomControl={true}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <MapCameraController
                      selectedShop={currentShop}
                      shops={filteredShops}
                      fitBoundsTrigger={fitBoundsTrigger}
                    />
                    {filteredShops.map((shop) => (
                      <ShopMarker
                        key={shop.id}
                        shop={shop}
                        isSelected={shop.id === currentShop?.id}
                        isInfoOpen={infoWindowShopId === shop.id}
                        onSelect={handleShopSelect}
                        onCloseInfo={() => setInfoWindowShopId(null)}
                        onGetDirections={handleOpenGoogleMaps}
                        onBrowseProducts={handleBrowseShopProducts}
                      />
                    ))}
                  </GoogleMap>
                </div>
              </APIProvider>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#F7F8F2]">
                <MapPin className="w-10 h-10 text-[#286B4A]" />
                <h3 className="text-base font-bold text-[#26332B] font-heading">
                  Google Maps API Key Required
                </h3>
                <p className="text-xs text-[#718078] max-w-md leading-relaxed">
                  Configure <code className="bg-white px-1.5 py-0.5 rounded border border-[#DCE4DB]">VITE_GOOGLE_MAPS_API_KEY</code> in your environment to render the interactive Google Map. You can still select shops on the right and open Google Maps directions directly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Shop Spotlight Card & Directory List (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Selected Shop Detailed Spotlight */}
          {currentShop && (
            <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#286B4A] p-5 eco-shadow-modal space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#EDF4EB] text-2xl flex items-center justify-center border border-[#DCE4DB] shrink-0">
                    {currentShop.logo}
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#286B4A] bg-[#EDF4EB] px-2 py-0.5 rounded uppercase">
                      {currentShop.category}
                    </span>
                    <h2 className="text-lg font-bold text-[#26332B] font-heading mt-0.5">
                      {currentShop.name}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setActiveShopModal(currentShop)}
                  className="text-xs text-[#286B4A] font-semibold hover:underline shrink-0"
                >
                  Full Profile
                </button>
              </div>

              <p className="text-xs text-[#718078] leading-relaxed">
                {currentShop.fullDescription}
              </p>

              {/* Location info */}
              <div className="bg-[#F7F8F2] p-3 rounded-xl border border-[#DCE4DB] text-xs space-y-2">
                <div className="flex items-start gap-2 text-[#26332B]">
                  <MapPin className="w-4 h-4 text-[#286B4A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{currentShop.address}</span>
                    <span className="text-[#718078] text-[11px]">{currentShop.district}, Phnom Penh</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#26332B] text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[#286B4A] shrink-0" />
                  <span>{currentShop.openingHours}</span>
                </div>

                <div className="flex items-center gap-2 text-[#26332B] text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-[#286B4A] shrink-0" />
                  <span>{currentShop.phone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  onClick={() => handleOpenGoogleMaps(currentShop)}
                  className="flex-1 bg-[#286B4A] hover:bg-[#1F543A] text-white py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions (Google Maps)</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </button>

                <button
                  onClick={() => handleBrowseShopProducts(currentShop.id)}
                  className="flex-1 bg-[#EDF4EB] hover:bg-[#DCE4DB] text-[#286B4A] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#A8C5A0]/60"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Products</span>
                </button>
              </div>
            </div>
          )}

          {/* List of All Participating Shops */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#718078] uppercase tracking-wider px-1">
              All Participating Locations ({filteredShops.length})
            </h3>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredShops.map((shop) => {
                const isSelected = shop.id === currentShop?.id;
                return (
                  <div
                    key={shop.id}
                    onClick={() => handleShopSelect(shop)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#286B4A] bg-[#EDF4EB]/30 eco-shadow-sm'
                        : 'border-[#DCE4DB] bg-[#FFFFFF] hover:border-[#A8C5A0]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#F7F8F2] text-xl flex items-center justify-center border border-[#DCE4DB] shrink-0">
                        {shop.logo}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#26332B] truncate font-heading">
                          {shop.name}
                        </h4>
                        <p className="text-[11px] text-[#718078] truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#286B4A] shrink-0" />
                          <span>{shop.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-semibold text-[#286B4A] bg-[#EDF4EB] px-2 py-0.5 rounded">
                        {shop.district.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
