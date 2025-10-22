import { Button } from '../ui/button'

export const ErrorPage = ({
  title = 'Failed to fetch data',
  description = 'Please reload the page',
}: {
  title?: string
  description?: string
}) => {
  return (
    <div className="bg-red-200 rounded-2xl p-6 fixed translate-x-[-50%] translate-y-[-50%] top-[50%] left-[50%] text-center">
      <div className="mb-4 text-gray-700">
        <h5 className="text-2xl font-semibold">{title}</h5>
        <p className=" text-lg">{description}</p>
      </div>
      <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
        Reload
      </Button>
    </div>
  )
}
