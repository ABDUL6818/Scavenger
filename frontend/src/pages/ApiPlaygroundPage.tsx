import { ApiPlayground } from '../components/ApiPlayground'

const ApiPlaygroundPage = () => (
  <div className="w-full min-w-0 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 md:py-6 bg-background text-foreground">
    <div className="mx-auto w-full max-w-full md:max-w-5xl min-w-0">
      <ApiPlayground baseUrl={import.meta.env.VITE_API_BASE_URL ?? ''} />
    </div>
  </div>
)

export default ApiPlaygroundPage