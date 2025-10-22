import { ErrorPage } from '@/components/common/error-page'
import { Shimmer } from '@/components/common/shimmer'
import { useAuth } from '@/hooks/useAuth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_internal')({
  component: InternalLayout,
})

function InternalLayout() {
  return <MainContainerWrapper></MainContainerWrapper>
}

function MainContainerWrapper() {
  const { user, isLoading, isError } = useAuth()

  if (isLoading && !user) {
    return (
      <div className="px-2 md:px-4 lg:px-6">
        <div className="mt-1 flex items-center justify-between">
          <Shimmer className="h-10 w-32 rounded-full" />
          <Shimmer className="h-10 w-48 rounded-full" />
          <Shimmer className="h-14 w-14 rounded-full" />
        </div>
        <div className="mx-8 items-center py-6">
          <Shimmer className="w-full rounded-full py-12" />
        </div>

        <div className="mx-16 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <Shimmer className="h-48 xl:col-span-8 2xl:col-span-9" />
          <Shimmer className="h-48 xl:col-span-8 2xl:col-span-9" />
        </div>
      </div>
    )
  }

  // if (isError) {
  //   return <ErrorPage />
  // }

  return (
    <div className="px-2 md:px-4 lg:px-6">
      <div className="mt-1 flex items-center justify-between">
        <Shimmer className="h-10 w-32 rounded-full" />
        <Shimmer className="h-10 w-48 rounded-full" />
        <Shimmer className="h-14 w-14 rounded-full" />
      </div>
      <div className="mx-8 items-center py-6">
        <Shimmer className="w-full rounded-full py-12" />
      </div>

      <div className="mx-16 grid gap-2">
        <Shimmer className="h-30" />
        <Shimmer className="h-30" />
        <Shimmer className="h-30" />
      </div>
    </div>
  )
}
