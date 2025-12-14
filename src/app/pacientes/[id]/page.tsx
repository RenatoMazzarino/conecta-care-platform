import { PatientPageClient } from './PatientPageClient';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = await params;
  return <PatientPageClient patientId={id} />;
}
