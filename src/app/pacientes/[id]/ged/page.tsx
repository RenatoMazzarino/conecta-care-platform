import { PatientGedPageClient } from './PatientGedPageClient';

interface PatientGedPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientGedPage({ params }: PatientGedPageProps) {
  const { id } = await params;
  return <PatientGedPageClient patientId={id} />;
}
