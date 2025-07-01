"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// import { ChevronDown } from 'lucide-react' // Removed ChevronDown import
import { useAppStore } from "@/lib/store"

export default function MyListings() {
  const { products, updateProductStatus } = useAppStore()
  const [categoryFilter, setCategoryFilter] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [priceFilter, setPriceFilter] = useState("")
  const [conditionFilter, setConditionFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Real filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (categoryFilter && product.category !== categoryFilter) return false
      if (brandFilter && product.brand !== brandFilter) return false
      if (statusFilter && product.status !== statusFilter) return false
      if (conditionFilter && product.condition !== conditionFilter) return false

      if (priceFilter) {
        const price = product.price
        switch (priceFilter) {
          case "0-1000":
            if (price > 1000) return false
            break
          case "1000-5000":
            if (price <= 1000 || price > 5000) return false
            break
          case "5000+":
            if (price <= 5000) return false
            break
        }
      }

      return true
    })
  }, [products, categoryFilter, brandFilter, priceFilter, conditionFilter, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Top Pick":
        return "bg-blue-100 text-blue-800"
      case "Premium":
        return "bg-purple-100 text-purple-800"
      case "Needs Update":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleStatusChange = (productId: string, newStatus: "Live" | "Pending" | "Rejected") => {
    updateProductStatus(productId, newStatus)
  }

  const clearFilters = () => {
    setCategoryFilter("")
    setBrandFilter("")
    setPriceFilter("")
    setConditionFilter("")
    setDateFilter("")
    setStatusFilter("")
  }

  // Get unique values for filter options
  const categories = [...new Set(products.map((p) => p.category))]
  const brands = [...new Set(products.map((p) => p.brand))]
  const conditions = [...new Set(products.map((p) => p.condition))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-black">My Listings</h1>
        <p className="text-gray-600 text-sm">View, edit, details, and manage all your listings in one place.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-1000">0 - 1,000 MAD</SelectItem>
            <SelectItem value="1000-5000">1,000 - 5,000 MAD</SelectItem>
            <SelectItem value="5000+">5,000+ MAD</SelectItem>
          </SelectContent>
        </Select>

        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((condition) => (
              <SelectItem key={condition} value={condition}>
                {condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Live">Live</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {(categoryFilter || brandFilter || priceFilter || conditionFilter || statusFilter) && (
          <Button variant="outline" onClick={clearFilters} size="sm">
            Clear Filters
          </Button>
        )}

        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} listings
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((listing) => (
          <Card key={listing.id} className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-200 relative">
              <div className="w-full h-full bg-gray-200"></div>
              <Badge className={`absolute top-2 right-2 ${getStatusColor(listing.status)}`}>{listing.status}</Badge>
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-black text-sm">{listing.brand}</h3>
              <p className="text-sm text-gray-600">{listing.title}</p>
              <p className="text-lg font-bold text-black">{listing.price.toLocaleString()} MAD</p>
              <p className="text-xs text-gray-500">{listing.condition}</p>

              {/* Tags */}
              {listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {listing.tags.map((tag, index) => (
                    <Badge key={index} className={`text-xs ${getTagColor(tag)}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Status Actions */}
              <div className="flex gap-2 pt-2">
                {listing.status !== "Live" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(listing.id, "Live")}
                    className="text-xs"
                  >
                    Make Live
                  </Button>
                )}
                {listing.status !== "Pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(listing.id, "Pending")}
                    className="text-xs"
                  >
                    Set Pending
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No listings match your current filters.</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4 bg-transparent">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
