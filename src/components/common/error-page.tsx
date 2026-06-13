import { Button } from '../ui/button'

export const ErrorPage = ({
  title = 'Failed to fetch data',
  description = 'Please reload the page',
}: {
  title?: string
  description?: string
}) => {
  return (
    <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-red-200 p-6 text-center">
      <div className="mb-4 text-gray-700">
        <h5 className="text-2xl font-semibold">{title}</h5>
        <p className="text-lg">{description}</p>
      </div>
      <Button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        Reload
      </Button>
    </div>
  )
}
