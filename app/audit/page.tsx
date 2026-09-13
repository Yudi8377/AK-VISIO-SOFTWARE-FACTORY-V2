import FactoryTable from '@/components/factory-table'

export default function Audit() {
  return <FactoryTable title="Audit" eyebrow="OPERATIONAL TRACE" description="Follow authenticated factory events and the execution trail used for operational accountability." table="factory_events" columns={["event_type", "stage_name", "message", "created_at"]} />
}
