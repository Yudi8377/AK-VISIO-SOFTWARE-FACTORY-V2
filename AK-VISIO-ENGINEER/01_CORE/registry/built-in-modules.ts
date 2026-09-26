import type { ModuleManifest } from "../runtime/core-types.js";

export const builtInModuleCatalog: ModuleManifest[] = [
  { module_id:"software", module_name:"Software Engineer", version:"0.1.0", platform:["windows","linux","macos"], capabilities:["source-xray","build","test","security-audit"], offline_capabilities:["source-analysis","local-test"], online_capabilities:["remote-docs"], safety_profile:"software", security_profile:"least-privilege" },
  { module_id:"network", module_name:"Network Engineer", version:"0.1.0", platform:["windows","linux"], capabilities:["diagnostics","path-analysis"], offline_capabilities:["local-network-analysis"], safety_profile:"network", security_profile:"scoped-access" },
  { module_id:"cctv", module_name:"CCTV Engineer", version:"0.1.0", platform:["windows","linux"], capabilities:["ip-camera-diagnostics","onvif"], offline_capabilities:["local-discovery"], safety_profile:"controlled", security_profile:"explicit-authorization" },
  { module_id:"iot", module_name:"IoT Engineer", version:"0.1.0", platform:["windows","linux"], capabilities:["mqtt","ble","wifi"], offline_capabilities:["local-telemetry"], safety_profile:"controlled", security_profile:"scoped-access" },
  { module_id:"electronics", module_name:"Electronics Engineer", version:"0.1.0", platform:["windows","linux"], capabilities:["schematic-analysis","measurement-analysis"], offline_capabilities:["document-analysis"], safety_profile:"physical-intervention", security_profile:"least-privilege" },
  { module_id:"automotive", module_name:"Automotive Engineer", version:"0.1.0", platform:["windows","linux"], capabilities:["obd","can","dtc"], offline_capabilities:["case-analysis"], safety_profile:"vehicle-safety", security_profile:"explicit-authorization" },
  { module_id:"ev", module_name:"EV Engineer", version:"0.1.0", platform:["windows","linux"], capabilities:["bms","can","dtc"], offline_capabilities:["case-analysis"], safety_profile:"high-voltage", security_profile:"explicit-authorization" },
  { module_id:"printer", module_name:"Printer Engineer", version:"0.1.0", platform:["windows","linux"], capabilities:["spooler","network-printer"], offline_capabilities:["driver-diagnostics"], safety_profile:"controlled", security_profile:"scoped-access" },
  { module_id:"industrial", module_name:"Industrial Engineer", version:"0.1.0", platform:["windows","linux"], capabilities:["modbus","opcua","plc-diagnostics"], offline_capabilities:["protocol-analysis"], safety_profile:"industrial-high-risk", security_profile:"explicit-authorization" }
];
