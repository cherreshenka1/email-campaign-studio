import OpenContext from './OpenContext.jsx'
import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'email-campaign-studio-state'

const templates = [
  {
    id: 'promo',
    title: 'Промо-акция',
    accent: '#8c6f48',
    headline: 'Осенние вещи для вашего дома',
    cta: 'Смотреть подборку',
  },
  {
    id: 'onboarding',
    title: 'Онбординг',
    accent: '#536b7c',
    headline: 'Добро пожаловать в продукт',
    cta: 'Начать настройку',
  },
  {
    id: 'digest',
    title: 'Дайджест',
    accent: '#617b64',
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
  preheader: 'Тёплый свет, удобные детали и новая коллекция.',
  body: 'Собрали вещи для спокойных вечеров дома: настольные лампы, текстиль и небольшие предметы, которые приятно держать под рукой.',
  cta: 'Открыть подборку',
  previewMode: 'desktop',
  url: 'https://cherreshenka1.github.io/optimized-ecommerce-store/',
}

export default function App() {
  const [campaign, setCampaign] = useState({...defaultCampaign, ...(readState() || {})})
  const [status, setStatus] = useState('Черновик сохранён локально')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(campaign)) } catch { setStatus('Хранилище недоступно. Скачайте HTML, чтобы сохранить письмо.') }
  }, [campaign])

  const template = useMemo(
    () => templates.find((item) => item.id === campaign.templateId) || templates[0],
    [campaign.templateId],
  )

  const segment = useMemo(
    () => segments.find((item) => item.id === campaign.segmentId) || segments[0],
    [campaign.segmentId],
  )


  const saveCampaign = () => {
    setStatus('Черновик сохранён в этом браузере.')
    window.setTimeout(() => setStatus('Черновик сохранён локально'), 1800)
  }

  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
  const validUrl = (() => { try { const url = new URL(campaign.url); return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password } catch { return false } })()
  const checks = [
    ['Тема A заполнена', Boolean(campaign.subjectA.trim())],
    ['Текст письма заполнен', Boolean(campaign.body.trim())],
    ['Текст кнопки: 1–30 символов', campaign.cta.trim().length > 0 && campaign.cta.length <= 30],
    ['Корректная HTTPS-ссылка кнопки', validUrl],
    ['Прехедер заполнен', Boolean(campaign.preheader.trim())],
  ]
  const getHtml = () => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f4f2;font-family:Arial,sans-serif"><table role="presentation" width="100%"><tr><td style="padding:32px"><table role="presentation" width="100%" style="max-width:600px;margin:auto;background:white"><tr><td style="padding:32px"><p>${escapeHtml(campaign.preheader)}</p><img src="https://cherreshenka1.github.io/email-campaign-studio/photos/lamp.jpg" alt="Настольная лампа в интерьере" width="536" style="display:block;width:100%;max-height:230px;object-fit:cover"><h1>${escapeHtml(template.headline)}</h1><p style="line-height:1.7">${escapeHtml(campaign.body)}</p><a href="${escapeHtml(campaign.url)}" style="display:inline-block;padding:14px 20px;background:${template.accent};color:white">${escapeHtml(campaign.cta)}</a></td></tr></table></td></tr></table></body></html>`
  const copyHtml = async () => {
    if (checks.some(([, ok]) => !ok)) {setStatus('Исправьте отмеченные пункты перед экспортом.'); return}
    try {await navigator.clipboard.writeText(getHtml()); setStatus('HTML скопирован. Можно вставить в сервис рассылок.')}
    catch {setStatus('Не удалось скопировать. Используйте «Скачать HTML».')}
  }
  const downloadHtml = () => {
    if (checks.some(([, ok]) => !ok)) {setStatus('Исправьте отмеченные пункты перед экспортом.'); return}
    const url = URL.createObjectURL(new Blob([getHtml()], {type:'text/html;charset=utf-8'}))
    const link = document.createElement('a'); link.href=url; link.download='campaign.html'; link.click()
    setTimeout(() => URL.revokeObjectURL(url),1000); setStatus('HTML-файл подготовлен. Письма не отправлялись.')
  }

  return (
    <div className="studio-shell">
      <header className="product-topbar"><a href="#workspace">Письма / Редактор</a><nav><a href="#workspace">Рабочая область</a><a href="#open-data">Справочник</a><a href="https://cherreshenka1.github.io/portfolio/">Портфолио ↗</a></nav><span className="monogram">АБ</span></header>
      <header className="hero">
        <p className="eyebrow">Email Campaign Studio</p>
        <h1>Письмо перед отправкой</h1>
        <p className="hero-text">Соберите содержание, проверьте тему и посмотрите, как письмо выглядит на телефоне. Черновик сохраняется автоматически.</p>
      </header>

      <main id="workspace" className="workspace">
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
              Текст кнопки
              <input
                value={campaign.cta}
                onChange={(event) => setCampaign((prev) => ({ ...prev, cta: event.target.value }))}
              />
            </label>
          </div>

          <label>Ссылка кнопки<input type="url" value={campaign.url} onChange={event => setCampaign(prev => ({...prev,url:event.target.value}))}/></label><p className="demo-note">Демо-редактор. Аудитории условные; письма не отправляются.</p><div className="actions-row">
            <button type="button" onClick={saveCampaign}>Сохранить кампанию</button>
            <button type="button" className="secondary" onClick={copyHtml}>Скопировать HTML</button><button type="button" className="secondary" onClick={downloadHtml}>Скачать HTML</button>
          </div>
        </section>

        <aside className="preview-panel">
          <div className="section-head">
            <h2>Предпросмотр</h2>
            <div className="mode-switch">
              <button
                type="button"
                className={campaign.previewMode === 'desktop' ? 'active' : ''}
                onClick={() => setCampaign((prev) => ({ ...prev, previewMode: 'desktop' }))}
              >
                Компьютер
              </button>
              <button
                type="button"
                className={campaign.previewMode === 'mobile' ? 'active' : ''}
                onClick={() => setCampaign((prev) => ({ ...prev, previewMode: 'mobile' }))}
              >
                Телефон
              </button>
            </div>
          </div>

          <div className={campaign.previewMode === 'mobile' ? 'email-frame mobile' : 'email-frame'}>
            <div className="email-preheader">{campaign.preheader}</div>
            <div className="email-card" style={{ '--accent': template.accent }}>
              <img className="email-photo" src="./photos/lamp.jpg" alt="Настольная лампа в интерьере"/><div className="email-badge">{template.title}</div>
              <h3>{template.headline}</h3>
              <p>{campaign.body}</p>
              <a href={validUrl ? campaign.url : undefined} target="_blank" rel="noreferrer">{campaign.cta}</a>
            </div>
          </div>

          <div className="metrics-grid">
            <div><span>Тема A</span><strong>{campaign.subjectA.length} знаков</strong></div>
            <div><span>Тема B</span><strong>{campaign.subjectB.length} знаков</strong></div>
            <div><span>Текст письма</span><strong>{campaign.body.length}</strong></div>
            <div><span>Проверки</span><strong>{checks.filter(([,ok])=>ok).length} / {checks.length}</strong></div>
          </div>
          <div className="checklist"><h3>Перед экспортом</h3>{checks.map(([label, ok]) => <p key={label} className={ok ? '' : 'check-fail'}>{ok ? '✓' : '○'} {label}</p>)}</div>

        </aside>
      </main>
      <OpenContext/>
    </div>
  )
}
