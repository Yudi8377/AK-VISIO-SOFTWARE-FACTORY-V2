import {NextResponse} from 'next/server'
export async function GET(){return NextResponse.json({status:'ok',service:'ak-visio-software-factory-v2',timestamp:new Date().toISOString()})}