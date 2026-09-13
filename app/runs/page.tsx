import FactoryTable from '@/components/factory-table'

export default function Runs() {
  return <FactoryTable title="Factory Runs" eyebrow="EXECUTION PIPELINE" description="Track authenticated runs across Planner, Generator, Test, Self-Healing, Re-Test, Validator and Go-Live." table="factory_runs" columns={["run_id", "status", "current_stage", "started_at", "completed_at"]} />
}
