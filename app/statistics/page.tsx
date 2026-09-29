'use client'

import { useEffect, useMemo, useState } from 'react'
import Shell from '@/components/Shell'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart3,
  Eye,
  BookOpen,
  MousePointerClick,
  QrCode,
} from 'lucide-react'

type AnalyticsEvent = {
  id: string
  event_type: string
  created_at: string
  metadata?: {
    language?: string | null
    action_type?: string | null
    attributed?: boolean
  } | null
}

type ScanEvent = {
  id: string
  scanned_at: string
}

export default function StatisticsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [scans, setScans] = useState<ScanEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  async function load() {
    setLoading(true)

    const supabase = createClient()
    const since = new Date()

    since.setDate(since.getDate() - Number(period))

    const [
      { data: analytics, error: analyticsError },
      { data: scanRows, error: scanError },
    ] = await Promise.all([
      supabase
        .from('analytics_events')
        .select('id,event_type,created_at,metadata')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false }),

      supabase
        .from('scan_events')
        .select('id,scanned_at')
        .gte('scanned_at', since.toISOString())
        .order('scanned_at', { ascending: false }),
    ])

    if (analyticsError) {
      console.error('analytics_events:', analyticsError)
      setEvents([])
    } else {
      setEvents((analytics || []) as AnalyticsEvent[])
    }

    if (scanError) {
      console.error('scan_events:', scanError)
      setScans([])
    } else {
      setScans((scanRows || []) as ScanEvent[])
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [period])

  const stats = useMemo(() => {
    const pageViews = events.filter(
      (event) => event.event_type === 'page_view'
    ).length

    const guideOpens = events.filter(
      (event) => event.event_type === 'guide_open'
    ).length

    const externalClicks = events.filter(
      (event) => event.event_type === 'external_click'
    ).length

    const french = events.filter(
      (event) =>
        event.event_type === 'guide_open' &&
        event.metadata?.language === 'fr'
    ).length

    const english = events.filter(
      (event) =>
        event.event_type === 'guide_open' &&
        event.metadata?.language === 'en'
    ).length

    return {
      scans: scans.length,
      pageViews,
      guideOpens,
      externalClicks,
      french,
      english,
      guideOpenRate:
        pageViews > 0 ? Math.round((guideOpens / pageViews) * 100) : 0,
      interactionRate:
        guideOpens > 0
          ? Math.round((externalClicks / guideOpens) * 100)
          : 0,
    }
  }, [events, scans])

  const cards = [
    {
      label: 'Scans QR',
      value: stats.scans,
      icon: QrCode,
    },
    {
      label: 'Pages voyageur vues',
      value: stats.pageViews,
      icon: Eye,
    },
    {
      label: 'Guides ouverts',
      value: stats.guideOpens,
      icon: BookOpen,
    },
    {
      label: 'Interactions externes',
      value: stats.externalClicks,
      icon: MousePointerClick,
    },
  ]

  return (
    <Shell
      title="Statistiques"
      subtitle="Analyse des interactions réellement enregistrées par Croque ton Sud."
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <strong>Données réelles</strong>
          <div className="hint">
            Aucun volume n’est estimé ou reconstitué artificiellement.
          </div>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">3 derniers mois</option>
          <option value="365">12 derniers mois</option>
        </select>
      </div>

      <div className="kpiGrid">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div className="kpiCard" key={card.label}>
              <div>
                <span>{card.label}</span>
                <strong>{loading ? '—' : card.value}</strong>
              </div>
              <Icon size={22} />
            </div>
          )
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(280px,1fr))',
          gap: 18,
          marginTop: 20,
        }}
      >
        <div className="panel">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
            }}
          >
            <BarChart3 size={20} />
            <strong>Parcours voyageur</strong>
          </div>

          <p>
            Pages voyageur vues
            <strong style={{ float: 'right' }}>
              {loading ? '—' : stats.pageViews}
            </strong>
          </p>

          <p>
            Guides ouverts
            <strong style={{ float: 'right' }}>
              {loading ? '—' : stats.guideOpens}
            </strong>
          </p>

          <p>
            Interactions externes
            <strong style={{ float: 'right' }}>
              {loading ? '—' : stats.externalClicks}
            </strong>
          </p>
        </div>

        <div className="panel">
          <strong>Taux mesurés</strong>

          <div style={{ marginTop: 18 }}>
            <p>Ouverture du guide</p>
            <strong style={{ fontSize: 28 }}>
              {loading ? '—' : `${stats.guideOpenRate}%`}
            </strong>

            <div className="hint">
              Guides ouverts / pages voyageur vues
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <p>Interaction après ouverture</p>
            <strong style={{ fontSize: 28 }}>
              {loading ? '—' : `${stats.interactionRate}%`}
            </strong>

            <div className="hint">
              Clics externes / guides ouverts
            </div>
          </div>
        </div>

        <div className="panel">
          <strong>Langue des guides ouverts</strong>

          <p style={{ marginTop: 18 }}>
            Français
            <strong style={{ float: 'right' }}>
              {loading ? '—' : stats.french}
            </strong>
          </p>

          <p>
            English
            <strong style={{ float: 'right' }}>
              {loading ? '—' : stats.english}
            </strong>
          </p>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <strong>Principe de mesure</strong>

        <p className="hint" style={{ marginTop: 10 }}>
          Les scans proviennent de scan_events. Les pages vues,
          ouvertures de guides et interactions proviennent de
          analytics_events. Un clic vers Google Maps, Waze,
          Instagram, un site internet ou une réservation représente
          une interaction mesurée et non une visite physique ou une
          réservation confirmée.
        </p>
      </div>
    </Shell>
  )
}
