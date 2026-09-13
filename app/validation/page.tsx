import FactoryTable from '@/components/factory-table'

export default function Validation() {
  return <FactoryTable title="Validation" eyebrow="RELEASE GATES" description="Inspect validation results that determine whether a run can advance toward Go-Live." table="factory_validation_results" columns={["check_name", "status", "message", "created_at"]} />
}
