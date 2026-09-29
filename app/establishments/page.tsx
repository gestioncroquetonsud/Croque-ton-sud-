'use client'

import { useEffect, useState } from 'react'
import Shell from '@/components/Shell'
import EmptyState from '@/components/EmptyState'
import { createClient } from '@/lib/supabase/client'
import {
  Copy,
  Check,
  ExternalLink,
  Store,
  MapPin,
} from 'lucide-react'

export default function Establishments() {
  const [rows, setRows] = useState<any[]>([])
  const [links, setLinks] = useState<any[]>([])
  const [copied, setCopied] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)

    const supabase = createClient()

    const [{ data: establishments, error: establishmentError }, { data: establishmentLinks, error: linkError }] =
      await Promise.all([
        supabase
          .from('establishments')
          .select('id,name,category,address,status,city_id,cities(name)')
          .order('name'),
        supabase
          .from('establishment_links')
          .select(
            'id,establishment_id,action_type,destination_url,tracking_token,active'
          )
          .order('action_type'),
      ])

    if (establishmentError) {
      console.error(establishmentError)
    }

    if (linkError) {
      console.error(linkError)
    }

    setRows(establishments || [])
    setLinks(establishmentLinks || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function linksFor(establishmentId: string) {
    return links.filter(
      (link) =>
        link.establishment_id === establishmentId &&
        link.active &&
        link.tracking_token
    )
  }

  function trackingUrl(link: any) {
    if (typeof window === 'undefined') return ''

    return `${window.location.origin}/r/${link.tracking_token}`
  }

  async function copyTrackingLink(link: any) {
    const url = trackingUrl(link)

    if (!url) return

    try {
      await navigator.clipboard.writeText(url)
      setCopied(link.id)

      window.setTimeout(() => {
        setCopied('')
      }, 1500)
    } catch (error) {
      console.error(error)
      alert('Impossible de copier le lien.')
    }
  }

  function actionLabel(action: string) {
    const labels: Record<string, string> = {
      website: 'Site internet',
      instagram: 'Instagram',
      maps: 'Google Maps',
      waze: 'Waze',
      reservation: 'Réservation',
      phone: 'Téléphone',
    }

    return labels[action] || action
  }

  return (
    <Shell
      title="Établissements"
      subtitle="Gérez les établissements et leurs liens de suivi permanents."
    >
      <div className="guidecallout">
        <div>
          <Store size={26} />

          <div>
            <strong>Liens de suivi Croque ton Sud</strong>
            <span>
              Copiez ces liens dans les guides PDF plutôt que les adresses
              externes directes.
            </span>
          </div>
        </div>
      </div>

      <div className="panel tablepanel">
        {loading ? (
          <p>Chargement…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Aucun établissement"
            text="Les établissements partenaires apparaîtront ici."
          />
        ) : (
          rows.map((establishment) => {
            const establishmentLinks = linksFor(establishment.id)

            return (
              <div
                className="establishmentCard"
                key={establishment.id}
                style={{
                  padding: '20px 0',
                  borderBottom: '1px solid rgba(0,0,0,.08)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 20,
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 17 }}>
                      {establishment.name}
                    </strong>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        marginTop: 5,
                      }}
                    >
                      <MapPin size={14} />

                      <span>
                        {establishment.cities?.name || 'Ville non renseignée'}
                      </span>
                    </div>

                    {establishment.category && (
                      <small>{establishment.category}</small>
                    )}
                  </div>

                  <span
                    className={
                      'status ' +
                      (establishment.status === 'active' ? 'active' : '')
                    }
                  >
                    {establishment.status === 'active'
                      ? 'Actif'
                      : 'Suspendu'}
                  </span>
                </div>

                {establishmentLinks.length === 0 ? (
                  <p className="hint">
                    Aucun lien de suivi actif pour cet établissement.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {establishmentLinks.map((link) => (
                      <div
                        key={link.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <div>
                          <strong>{actionLabel(link.action_type)}</strong>

                          <div className="hint">
                            /r/{link.tracking_token}
                          </div>
                        </div>

                        <div className="rowactions">
                          <button
                            type="button"
                            onClick={() => copyTrackingLink(link)}
                          >
                            {copied === link.id ? (
                              <>
                                <Check size={14} />
                                Copié
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                Copier
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                trackingUrl(link),
                                '_blank',
                                'noopener,noreferrer'
                              )
                            }
                          >
                            <ExternalLink size={14} />
                            Tester
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </Shell>
  )
}
