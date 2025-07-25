import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

interface ValidationRequest {
  documentoId: string
  status: 'valido' | 'invalido'
  motivo?: string
  secret_key: string
}

export async function POST(req: NextRequest) {
  const { documentoId, status, motivo, secret_key } = (await req.json()) as ValidationRequest
  const secret = process.env.NEXT_PUBLIC_ADMIN_KEY
  if (!documentoId || !status) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
  if (secret_key !== secret){ 
    return NextResponse.json({ error: 'Token de Administrador inválido!' }, { status: 400 })
  }

  try {
    // Enviar dados para webhook do n8n
    const webhookResponse = await axios.post('https://webhook.fazag.edu.br:8443/webhook/contratos', {
        documentoId, status, motivo
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Falha interna' }, { status: 500 })
  }
}