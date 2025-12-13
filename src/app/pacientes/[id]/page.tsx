import { PatientPageClient } from './PatientPageClient';

interface PatientDetailPageProps {
  params: { id: string };
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  return <PatientPageClient patientId={params.id} />;
}
