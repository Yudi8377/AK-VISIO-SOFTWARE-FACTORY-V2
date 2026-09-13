import FactoryTable from '@/components/factory-table'

export default function Projects() {
  return <FactoryTable title="Projects" eyebrow="PROJECT INVENTORY" description="Inspect generated factory projects owned by the authenticated operator." table="factory_projects" columns={["name", "slug", "status", "created_at", "updated_at"]} />
}
