import BiaDetailView from '@/components/bia/BiaDetailView'
import { biaReports, getProcessById } from '@/lib/bia-data'

export default async function BiaDetailPage({ params }) {
  const { id } = await params
  const bia = biaReports.find((report) => report.id === id) ?? biaReports[0]
  const process = getProcessById(bia.processId)

  return <BiaDetailView bia={bia} process={process} />
}
