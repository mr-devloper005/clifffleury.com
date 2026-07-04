import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { Ads } from '@/lib/ads'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

const detailAdSlot: Partial<Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'>> = {
  article: 'article-bottom',
  listing: 'sidebar',
  profile: 'footer',
}
const hiddenTaskKeys = new Set<TaskKey>(['listing', 'classified'])
const displayTaskLabel = (task: TaskKey, fallback: string) => hiddenTaskKeys.has(task) ? 'posts' : fallback

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--tk-muted)] transition hover:text-white">
      <ArrowLeft className="h-4 w-4" /> Back to {displayTaskLabel(task, taskConfig?.label || 'posts')}
    </Link>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  const hero = images[0] || '/placeholder.svg?height=900&width=1400'
  return (
    <>
      <article className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <BackLink task="article" />
        <div className="mt-8 overflow-hidden rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_22px_72px_rgba(0,0,0,0.24)]">
          <div className="aspect-[16/8] bg-[var(--tk-raised)]">
            <img src={hero} alt={post.title} className="h-full w-full object-cover" />
          </div>
          <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 sm:py-12">
            <Kicker task="article">{categoryOf(post, 'Article')}</Kicker>
            <h1 className="editable-display mt-6 text-balance text-4xl font-semibold leading-[0.98] text-white sm:text-5xl lg:text-[4.25rem]">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={detailAdSlot.article || 'article-bottom'} showLabel eager className="mx-auto w-full" />
            </div>
            <EditableArticleComments slug={post.slug} comments={comments} />
          </div>
        </div>
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <BackLink task="listing" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="overflow-hidden rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_22px_72px_rgba(0,0,0,0.24)]">
          <div className="aspect-[16/8] bg-[var(--tk-raised)]">
            <img src={images[0] || '/placeholder.svg?height=900&width=1400'} alt={post.title} className="h-full w-full object-cover" />
          </div>
          <div className="p-6 sm:p-8">
            <Kicker task="listing">{categoryOf(post, 'Listing')}</Kicker>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[0.98] text-white sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-5 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="More images" />
          </div>
        </article>
        <aside className="space-y-6">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot={detailAdSlot.listing || 'sidebar'} showLabel eager className="mx-auto w-full" />
          </div>
          <ContactAction website={website} phone={phone} email={email} />
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <RelatedPanel task="listing" related={related} />
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget']) || 'Contact for Price'
  const location = getField(post, ['location', 'address', 'city']) || 'Location shared on request'
  const condition = getField(post, ['condition', 'availability', 'type']) || 'Available'
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <BackLink task="classified" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_22px_72px_rgba(0,0,0,0.24)] lg:sticky lg:top-24 lg:self-start">
            <Kicker task="classified">{categoryOf(post, 'Classified')}</Kicker>
            <h1 className="editable-display mt-5 text-3xl font-semibold leading-tight text-white">{post.title}</h1>
            <p className="mt-6 text-4xl font-extrabold tracking-[-0.04em] text-[var(--tk-accent)]">{price}</p>
            <div className="mt-6 space-y-3">
              <BadgeLine label="Condition" value={condition} />
              <BadgeLine label="Location" value={location} />
            </div>
            <div className="mt-6">
              <ContactAction website={website} phone={phone} email={email} bare />
            </div>
          </aside>
          <article className="overflow-hidden rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_22px_72px_rgba(0,0,0,0.24)]">
            <ImageStrip images={images.length ? images : ['/placeholder.svg?height=900&width=1400']} label="Offer images" large inside />
            <div className="p-6 sm:p-8">
              {leadText(post) ? <p className="text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
              <BodyContent post={post} />
            </div>
          </article>
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const gallery = getImages(post)
  const images = gallery.length ? gallery : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {images.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt={post.title} className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_22px_72px_rgba(0,0,0,0.24)] lg:sticky lg:top-24 lg:self-start">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Camera className="h-6 w-6" /></div>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[0.98] text-white sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-5 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <BackLink task="sbm" />
        <div className="mt-8 rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_22px_72px_rgba(0,0,0,0.24)] sm:p-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
          <div className="mt-6"><Kicker task="sbm">{categoryOf(post, 'Resource')}</Kicker></div>
          <h1 className="editable-display mt-5 text-4xl font-semibold leading-[0.98] text-white sm:text-5xl">{post.title}</h1>
          {leadText(post) ? <p className="mt-5 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          {website ? (
            <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-[18px] bg-[var(--editable-cta-bg)] px-5 py-3 text-sm font-bold text-white">
              Open resource <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}
          <BodyContent post={post} />
        </div>
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <BackLink task="pdf" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="overflow-hidden rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_22px_72px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-4 border-b border-[var(--tk-line)] p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-8 w-8" /></div>
            <div>
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="editable-display mt-3 text-3xl font-semibold text-white sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <BodyContent post={post} />
            {fileUrl ? (
              <div className="mt-8 overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[72vh] w-full" />
              </div>
            ) : null}
          </div>
        </article>
        <aside className="space-y-6">
          {fileUrl ? (
            <div className="rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_22px_72px_rgba(0,0,0,0.24)]">
              <p className="text-lg font-bold text-white">Get this document</p>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-[var(--editable-cta-bg)] px-5 py-3 text-sm font-bold text-white">
                Download <Download className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" related={related} />
        </aside>
      </div>
    </section>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 text-center shadow-[0_22px_72px_rgba(0,0,0,0.24)] lg:sticky lg:top-24 lg:self-start">
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
              {images[0] ? <img src={images[0]} alt={post.title} className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
            </div>
            {role ? <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{role}</p> : null}
            <h1 className="editable-display mt-3 text-3xl font-semibold text-white">{post.title}</h1>
            <ContactAction website={website} email={email} bare />
          </aside>
          <article className="rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_22px_72px_rgba(0,0,0,0.24)] sm:p-8">
            <Kicker task="profile">{categoryOf(post, 'Profile')}</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={detailAdSlot.profile || 'footer'} showLabel eager className="mx-auto w-full" />
            </div>
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.05rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[22px] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tk-accent)]"><Icon className="h-4 w-4" /> {label}</div>
          <p className="mt-2 break-words text-sm leading-6 text-white">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false, inside = false }: { images: string[]; label: string; large?: boolean; inside?: boolean }) {
  if (!images.length) return null
  return (
    <section className={inside ? '' : 'mt-10'}>
      <p className={`${inside ? 'px-6 pt-6 sm:px-8 sm:pt-8' : ''} text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]`}>{label}</p>
      <div className={`${inside ? 'p-6 pt-4 sm:p-8 sm:pt-4' : 'mt-4'} grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[22px] border border-[var(--tk-line)] object-cover" />
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_22px_72px_rgba(0,0,0,0.24)]">
      <div className="flex items-center gap-2 border-b border-[var(--tk-line)] p-5 text-base font-bold text-white"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-3 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[18px] bg-[var(--editable-cta-bg)] px-4 py-3 text-sm font-bold text-white">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-[18px] border border-[var(--tk-line)] px-4 py-3 text-sm font-bold text-white"><Phone className="h-4 w-4 text-[var(--tk-accent)]" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-[18px] border border-[var(--tk-line)] px-4 py-3 text-sm font-bold text-white"><Mail className="h-4 w-4 text-[var(--tk-accent)]" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_22px_72px_rgba(0,0,0,0.24)]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-bold uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  const label = displayTaskLabel(task, taskConfig?.label || task)
  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_22px_72px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">About this section</p>
        <div className="mt-4 grid gap-3 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
        </div>
      </div>
      {related.length ? (
        <div className="rounded-[30px] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_22px_72px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-2xl font-semibold text-white">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="text-sm font-semibold text-[var(--tk-accent)]">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  const label = displayTaskLabel(task, (taskConfig?.label || 'posts').toLowerCase())
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="editable-display text-3xl font-semibold text-white">More {label}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_54px_rgba(0,0,0,0.24)] transition hover:-translate-y-1">
        <div className="aspect-[16/10] bg-[var(--tk-raised)]">
          {image ? <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 text-xl font-extrabold leading-tight text-white">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post)) || 'Open for details.'}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-[20px] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-3 transition hover:border-[var(--tk-accent)]/35">
      {image && task !== 'sbm' ? <img src={image} alt={post.title} className="h-16 w-16 shrink-0 rounded-[16px] object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] bg-[var(--tk-surface)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-bold leading-6 text-white">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post)) || 'Open for details.'}</p>
      </div>
    </Link>
  )
}
