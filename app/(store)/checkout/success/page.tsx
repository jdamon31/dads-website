import { Suspense } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { SuccessContent } from './SuccessContent'

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
