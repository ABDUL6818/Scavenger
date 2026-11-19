import { ApiPlayground } from '../components/ApiPlayground'
import { ENV } from '../constants/env'

const ApiPlaygroundPage = () => (
  <ApiPlayground baseUrl={ENV.API_BASE_URL} />
)

export default ApiPlaygroundPage