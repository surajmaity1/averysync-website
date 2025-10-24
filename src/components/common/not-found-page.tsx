import { Navbar } from '@/modules/home/home-navbar'
import { Button } from '../ui/button'

export const NotFoundPage = ({
  title = 'Page not found',
  description = 'Please visit valid page or click below go to Home page',
}: {
  title?: string
  description?: string
}) => {
  return (
    <>
      <Navbar />
      <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-red-200 p-6 text-center">
        <div className="mb-4 text-gray-700">
          <h5 className="text-2xl font-semibold">{title}</h5>
          <p className="text-lg">{description}</p>
        </div>
        <Button
          onClick={() => (window.location.href = '/')}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Go to Home
        </Button>
      </div>
    </>
  )
}
