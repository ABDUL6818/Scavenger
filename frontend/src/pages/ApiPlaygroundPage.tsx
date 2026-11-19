import { useTranslation } from 'react-i18next'
import { ApiPlayground } from '../components/ApiPlayground'
import { ENV } from '../constants/env'

const ApiPlaygroundPage = () => {
  const { t } = useTranslation()

  return (
    <ApiPlayground
      baseUrl={ENV.API_BASE_URL}
      title={t('apiPlayground.page.title')}
      description={t('apiPlayground.page.description')}
    />
  )
}

export default ApiPlaygroundPage