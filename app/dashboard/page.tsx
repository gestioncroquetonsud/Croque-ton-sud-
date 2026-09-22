'use client'

import { useEffect, useState } from 'react'
import Shell from '@/components/Shell'
import StatCard from '@/components/StatCard'
import { createClient } from '@/lib/supabase/client'
import {
  QrCode,
  FileText,
  Building2,
  House,
  Store,
  Bell,
  MapPin,
  Languages,
  ArrowUpRight
} from 'lucide-react'

export default function Dashboard() {
  const [d, setD] = useState<any>({
    active_clients: 0,
    total_properties: 0,
    active_qr_codes: 0,
    blocked_qr_codes: 0,
    scans_current_month: 0,
    open_alerts: 0
  })

  const [cities, setCities] = useState<any[]>([])

  useEffect(() => {
    const s = createClient()

    s.from('dashboard_overview')
      .select('*')
      .single()
      .then(({ data }) => data && setD(data))

    s.from('city_statistics')
      .select('*')
      .order('scans_current_month', { ascending: false })
      .then(({ data }) => setCities(data || []))
  }, [])

  const cityRows = cities.length
    ? cities.slice(0, 4)
    : [
        {
          city_id: 'toulon',
          city_name: 'Toulon',
          property_count: 0,
          scans_current_month: 0
        },
        {
          city_id: 'hyeres',
          city_name: 'Hyères',
          property_count: 0,
          scans_current_month: 0
        },
        {
          city_id: 'la-londe',
          city_name: 'La Londe-les-Maures',
          property_count: 0,
          scans_current_month: 0
        }
      ]

  return (
        <Shell
      title="Tableau de bord"
      subtitle="L’activité Croque ton Sud, en un coup d’œil."
    >
      <div className="dashWelcome">
        <div>
          <span className="dashScript">Bienvenue dans le Sud ☀</span>
          <h2>Votre réseau aujourd’hui</h2>
          <p>
            Suivez vos conciergeries, logements, QR codes et guides depuis un
            seul endroit.
          </p>
        </div>

        <div className="dashLive">
          <i />
          Données en direct
        </div>
      </div>

      <section className="stats dashStats">
        <StatCard
          label="Conciergeries actives"
          value={String(d.active_clients)}
          note="Partenaires"
          accent="yellow"
          href="/clients"
        />

        <StatCard
          label="Logements équipés"
          value={String(d.total_properties)}
          note="Dans le réseau"
          accent="blue"
          href="/logements"
        />

        <StatCard
          label="QR codes actifs"
          value={String(d.active_qr_codes)}
          note={`${d.blocked_qr_codes} suspendu(s)`}
          accent="green"
          href="/qr-codes"
        />

        <StatCard
          label="Scans ce mois"
          value={String(d.scans_current_month)}
          note="Activité voyageurs"
          accent="pink"
          href="/statistics"
        />

        <StatCard
          label="Alertes"
          value={String(d.open_alerts)}
          note="À traiter"
          accent="orange"
          href="/alerts"
        />
      </section>

      <section className="grid2 dashMain">
        <div className="panel activityPanel">
          <div className="panelhead">
            <div>
              <span className="miniEyebrow">ACTIVITÉ</span>
              <h2>Scans des guides</h2>
              <p>Évolution de l’activité voyageurs</p>
            </div>

            <select defaultValue="30">
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="90">3 mois</option>
              <option value="365">12 mois</option>
            </select>
          </div>
                    <div className="visualChart">
            <div className="chartBars">
              {[34, 52, 41, 70, 63, 82, 58, 91, 75, 88, 68, 96].map(
                (x, i) => (
                  <i key={i} style={{ height: `${x}%` }} />
                )
              )}
            </div>
          </div>

          <div className="chartLegend">
            <span>
              <i />
              Scans
            </span>

            <a href="/statistics">
              Voir toutes les statistiques
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <div className="panel cityPanel">
          <div className="panelhead">
            <div>
              <span className="miniEyebrow greenText">DESTINATIONS</span>
              <h2>Répartition par ville</h2>
              <p>Logements et scans du mois</p>
            </div>

            <MapPin size={19} />
          </div>

          {cityRows.map((c: any, i: number) => (
            <div className="city cityRich" key={c.city_id || i}>
              <i style={{ opacity: 1 - i * 0.18 }} />

              <div>
                <strong>{c.city_name}</strong>
                <span>
                  {c.property_count || 0} logement(s) ·{' '}
                  {c.scans_current_month || 0} scan(s)
                </span>
              </div>

              <b>{c.scans_current_month || 0}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="grid2 dashBottom">
        <div className="panel">
          <div className="panelhead">
            <div>
              <span className="miniEyebrow violetText">GUIDES</span>
              <h2>Guides en ligne</h2>
              <p>Publication par ville et langue</p>
            </div>

            <a href="/guides">Gérer les guides</a>
          </div>
                    {['Toulon', 'Hyères', 'La Londe-les-Maures'].map((city) => (
            <div className="guideStatus" key={city}>
              <div className="guideCity">
                <Languages size={15} />
                <strong>{city}</strong>
              </div>

              <span className="lang on">FR</span>
              <span className="lang">EN</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panelhead">
            <div>
              <span className="miniEyebrow orangeText">RACCOURCIS</span>
              <h2>Actions rapides</h2>
              <p>Accédez aux tâches les plus fréquentes</p>
            </div>
          </div>

          <div className="quickActions dashQuick">
            <a href="/clients">
              <Building2 />
              Conciergerie
            </a>

            <a href="/logements">
              <House />
              Logement
            </a>

            <a href="/qr-codes">
              <QrCode />
              QR Codes
            </a>

            <a href="/guides">
              <FileText />
              Guide PDF
            </a>

            <a href="/establishments">
              <Store />
              Établissement
            </a>

            <a href="/alerts">
              <Bell />
              Alertes
            </a>
          </div>
        </div>
      </section>
    </Shell>
  )
}
