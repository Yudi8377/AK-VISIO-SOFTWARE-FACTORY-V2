import FactoryTable from '@/components/factory-table'

export default function Audit() {
  return <FactoryTable title="Audit" eyebrow="JEJAK OPERASIONAL" description="Telusuri peristiwa Factory yang terautentikasi dan jejak eksekusi untuk akuntabilitas operasional." table="factory_events" columns={["jenis_peristiwa", "nama_tahap", "pesan", "dibuat_pada"]} />
}
