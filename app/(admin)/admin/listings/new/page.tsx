import { ListingForm } from '@/components/admin/ListingForm'

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Listing</h1>
      <ListingForm />
    </div>
  )
}
