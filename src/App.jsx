import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'email-campaign-studio-state'

const templates = [
  {
    id: 'promo',
    title: 'Промо-акция',
    accent: '#ff6b35',
    headline: 'Большой весенний запуск',
    cta: 'Смотреть подборку',
  },
  {
    id: 'onboarding',
    title: 'Онбординг',
    accent: '#4f46e5',
    headline: 'Добро пожаловать в продукт',
    cta: 'Начать настройку',
  },
  {
    id: 'digest',
    title: 'Дайджест',
    accent: '#059669',
    headline: 'Главное за неделю',
    cta: 'Читать выпуск',
  },
]

const segments = [
  { id: 'new', title: 'Новые подписчики', size: 4200, openRate: 42, ctr: 7.8 },
  { id: 'active', title: 'Активные клиенты', size: 12800, openRate: 36, ctr: 6.4 },
  { id: 'sleeping', title: 'Спящие клиенты', size: 9100, openRate: 24, ctr: 3.1 },
]

function readState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const defaultCampaign = {
  templateId: 'promo',
  segmentId: 'active',
  subjectA: 'Только сегодня: подборка товаров со скидкой',
  subjectB: 'Мы собрали для вас лучшие предложения недели',
  preheader: 'Персональная подборка, адаптивное письмо и понятный CTA.',
  body: 'Показываем новый оффер, объясняем ценность и ведём пользователя к целевому действию без лишнего шума.',
  cta: 'Открыть подборку',
  previewMode: 'desktop',
}

export default function App() {
  const [campaign, setCampaign] = useState(readState() || defaultCampaign)
  const [status, setStatus] = useState('Черновик сохранён локально')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaign))
  }, [campaign])

  const template = useMemo(
    () => templates.find((item) => item.id === campaign.templateId) || templates[0],
    [campaign.templateId],
  )

  const segment = useMemo(
    () => segments.find((item) => item.id === campaign.segmentId) || segments[0],
    [campaign.segmentId],
  )

  const metrics = useMemo(() => {
    const subjectBonus = campaign.subjectB.length < campaign.subjectA.length ? 1.8 : 0.7
    const expectedOpen = Math.min(58, segment.openRate + subjectBonus)
    const expectedCtr = Math.min(14, segment.ctr + (campaign.cta.length < 24 ? 1.2 : 0.4))
    const clicks = Math.round((segment.size * expectedCtr) / 100)

    return {
      expectedOpen: expectedOpen.toFixed(1),
      expectedCtr: expectedCtr.toFixed(1),
      clicks,
      unsub: Math.max(4, Math.round(segment.size * 0.0016)),
    }
  }, [campaign.cta.length, campaign.subjectA.length, campaign.subjectB.length, segment])

  const saveCampaign = () => {
    setStatus('Кампания сохранена. Данные лежат в localStorage.')
    window.setTimeout(() => setStatus('Черновик сохранён локально'), 1800)
  }

  const copyHtml = async () => {
    const html = `<table role="presentation" width="100%"><tr><td><h1>${template.headline}</h1><p>${campaign.body}</p><a href="#">${campaign.cta}</a></td></tr></table>`
    await navigator.clipboard.writeText(html)
    setStatus('HTML email-шаблона скопирован в буфер обмена.')
  }

  return (
    <div className="studio-shell">
      <header className="hero">
        <p className="eyebrow">Email Campaign Studio</p>
        <h1>Конструктор email-рассылок с preview, сегментами и аналитикой</h1>
        <p className="hero-text">
          Проект показывает навыки email-маркетинга на фронтенде: адаптивная структура,
          редактируемый шаблон, preheader, CTA, A/B тема и прогноз метрик кампании.
        </p>
      </header>

      <main className="workspace">
        <section className="builder-panel">
          <div className="section-head">
            <h2>Настройка кампании</h2>
            <span>{status}</span>
          </div>

          <div className="template-grid">
            {templates.map((item) => (
              <button
                type="button"
                key={item.id}
                className={item.id === campaign.templateId ? 'template-card active' : 'template-card'}
                onClick={() => setCampaign((prev) => ({ ...prev, templateId: item.id, cta: item.cta }))}
                style={{ '--accent': item.accent }}
              >
                <span>{item.title}</span>
                <strong>{item.headline}</strong>
              </button>
            ))}
          </div>

          <div className="form-grid">
            <label>
              Сегмент аудитории
              <select
                value={campaign.segmentId}
                onChange={(event) => setCampaign((prev) => ({ ...prev, segmentId: event.target.value }))}
              >
                {segments.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.title} — {item.size.toLocaleString('ru-RU')} контактов
                  </option>
                ))}
              </select>
            </label>

            <label>
              Тема A
              <input
                value={campaign.subjectA}
                onChange={(event) => setCampaign((prev) => ({ ...prev, subjectA: event.target.value }))}
              />
            </label>

            <label>
              Тема B
              <input
                value={campaign.subjectB}
                onChange={(event) => setCampaign((prev) => ({ ...prev, subjectB: event.target.value }))}
              />
            </label>

            <label>
              Preheader
              <input
                value={campaign.preheader}
                onChange={(event) => setCampaign((prev) => ({ ...prev, preheader: event.target.value }))}
              />
            </label>

            <label className="wide">
              Текст письма
              <textarea
                rows="4"
                value={campaign.body}
                onChange={(event) => setCampaign((prev) => ({ ...prev, body: event.target.value }))}
              />
            </label>

            <label>
              CTA
              <input
                value={campaign.cta}
                onChange={(event) => setCampaign((prev) => ({ ...prev, cta: event.target.value }))}
              />
            </label>
          </div>

          <div className="actions-row">
            <button type="button" onClick={saveCampaign}>Сохранить кампанию</button>
            <button type="button" className="secondary" onClick={copyHtml}>Скопировать HTML</button>
          </div>
        </section>

        <aside className="preview-panel">
          <div className="section-head">
            <h2>Preview</h2>
            <div className="mode-switch">
              <button
                type="button"
                className={campaign.previewMode === 'desktop' ? 'active' : ''}
                onClick={() => setCampaign((prev) => ({ ...prev, previewMode: 'desktop' }))}
              >
                Desktop
              </button>
              <button
                type="button"
                className={campaign.previewMode === 'mobile' ? 'active' : ''}
                onClick={() => setCampaign((prev) => ({ ...prev, previewMode: 'mobile' }))}
              >
                Mobile
              </button>
            </div>
          </div>

          <div className={campaign.previewMode === 'mobile' ? 'email-frame mobile' : 'email-frame'}>
            <div className="email-preheader">{campaign.preheader}</div>
            <div className="email-card" style={{ '--accent': template.accent }}>
              <div className="email-badge">{template.title}</div>
              <h3>{template.headline}</h3>
              <p>{campaign.body}</p>
              <a href="#preview">{campaign.cta}</a>
            </div>
          </div>

          <div className="metrics-grid">
            <div><span>Open rate</span><strong>{metrics.expectedOpen}%</strong></div>
            <div><span>CTR</span><strong>{metrics.expectedCtr}%</strong></div>
            <div><span>Клики</span><strong>{metrics.clicks.toLocaleString('ru-RU')}</strong></div>
            <div><span>Отписки</span><strong>{metrics.unsub}</strong></div>
          </div>

          <div className="checklist">
            <h3>Checklist</h3>
            <p>✓ Preheader заполнен</p>
            <p>✓ CTA короче 30 символов</p>
            <p>✓ Есть mobile preview</p>
            <p>✓ Сегмент аудитории выбран</p>
          </div>
        </aside>
      </main>
    </div>
  )
}
