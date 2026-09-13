import FactoryTable from '@/components/factory-table'

export default function Repairs() {
  return <FactoryTable title="Repairs" eyebrow="SELF-HEALING HISTORY" description="Review bounded self-healing actions and their resulting state for your authenticated runs." table="factory_repairs" columns={["repair_order", "issue", "action", "status", "created_at"]} />
}
