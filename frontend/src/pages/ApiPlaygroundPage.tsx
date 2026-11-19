import { useTranslation } from 'react-i18next'
import { ApiPlayground } from '../components/ApiPlayground'

const ApiPlaygroundPage = () => {
  const { t } = useTranslation()

  return (
    <ApiPlayground
      baseUrl={import.meta.env.VITE_API_BASE_URL ?? ''}
      title={t('apiPlayground.page.title')}
      description={t('apiPlayground.page.description')}
    />
  )
}

export default ApiPlaygroundPage