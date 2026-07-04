import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, MapPin, Phone, Search, Sparkles, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { Ads } from '@/lib/ads'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) =>
  stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body)) || 'Open the detail page for more information.'
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-6 xl:grid-cols-[1.15fr_0.85fr]',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const cardBase = 'group block overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_18px_54px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1.5 hover:border-[var(--tk-accent)]/35'
const hiddenTaskKeys = new Set<TaskKey>(['listing', 'classified'])
const displayTaskLabel = (task: TaskKey, fallback: string) => hiddenTaskKeys.has(task) ? 'Posts' : fallback

const archiveAdSlot: Partial<Record<TaskKey, 'header' | 'sidebar' | 'in-feed' | 'article-bottom' | 'footer'>> = {
  article: 'header',
  listing: 'sidebar',
  profile: 'in-feed',
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = displayTaskLabel(task, taskConfig?.label || task)
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const adSlot = archiveAdSlot[task]

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden border-b border-[var(--tk-line)] bg-[linear-gradient(180deg,rgba(95,149,152,0.06),rgba(6,30,41,0))]">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(55%_60%_at_50%_0%,var(--tk-glow),transparent_72%)]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--tk-accent)]">
                <Sparkles className="h-3.5 w-3.5" /> {theme.kicker}
              </div>
              <h1 className="editable-display mt-6 text-balance text-5xl font-semibold leading-[0.96] text-white sm:text-6xl">{voice?.headline || `Browse ${label}`}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>
            </div>

            <div className="mt-10 grid gap-4 rounded-[28px] border border-[var(--tk-line)] bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.24)] lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-center gap-3 rounded-[20px] border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm text-[var(--tk-muted)]">
                <Search className="h-4 w-4 text-[var(--tk-accent)]" />
                <span><span className="font-semibold text-white">{posts.length}</span> posts in {categoryLabel}</span>
              </div>
              <form action={basePath} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-12 min-w-[220px] appearance-none rounded-[18px] border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm font-medium text-white outline-none"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="inline-flex h-12 items-center justify-center rounded-[18px] bg-[var(--editable-cta-bg)] px-5 text-sm font-bold text-white transition hover:brightness-110">Apply</button>
              </form>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {adSlot ? (
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
            </div>
          ) : null}
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />)}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[28px] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-3xl font-semibold text-white">Nothing here yet</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Try another category, or check back after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-14 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-semibold text-white transition hover:border-[var(--tk-accent)]">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-semibold text-white transition hover:border-[var(--tk-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
      <Link href={href} className={`${cardBase} xl:col-span-2 xl:grid xl:grid-cols-[260px_minmax(0,1fr)]`}>
        <div className="aspect-[4/3] overflow-hidden bg-[var(--tk-raised)] xl:h-full xl:aspect-auto">
          <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        </div>
        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Article')} #{String(index + 1).padStart(2, '0')}</p>
          <h2 className="editable-display mt-3 text-3xl font-semibold leading-tight text-white">{post.title}</h2>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">Read article <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" /></span>
        </div>
      </Link>
    </div>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex gap-5 p-5`}>
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt={post.title} className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-9 w-9 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Listing')}</p>
        <h2 className="editable-display mt-2 text-2xl font-semibold text-white">{post.title}</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {cleanDomain(website)}</span> : null}
        </div>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const image = getImage(post)
  const price = getField(post, ['price', 'amount', 'budget']) || 'Contact for Price'
  const location = getField(post, ['location', 'address', 'city']) || 'Location shared on request'
  return (
    <Link href={href} className={cardBase}>
      <div className="aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Classified')}</p>
        <h2 className="mt-3 line-clamp-2 text-2xl font-extrabold leading-tight text-white">{post.title}</h2>
        <p className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[var(--tk-accent)]">{price}</p>
        <div className="mt-4 border-t border-[var(--tk-line)] pt-4 text-sm leading-6 text-[var(--tk-muted)]">{location}</div>
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden rounded-[24px] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(0,0,0,0.82))]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Image')}</p>
          <h2 className="mt-2 line-clamp-2 text-2xl font-extrabold text-white">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} p-6`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">Saved #{String(index + 1).padStart(2, '0')}</p>
      <h2 className="editable-display mt-2 text-2xl font-semibold text-white">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      {website ? <p className="mt-4 truncate text-sm font-semibold text-white">{cleanDomain(website)}</p> : null}
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className={`${cardBase} p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><FileText className="h-7 w-7" /></div>
        <Download className="h-5 w-5 text-[var(--tk-muted)]" />
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{getCategory(post, 'Document')}</p>
      <h2 className="editable-display mt-2 text-2xl font-semibold text-white">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} p-6 text-center`}>
      <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt={post.title} className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      {role ? <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{role}</p> : null}
      <h2 className="editable-display mt-2 text-2xl font-semibold text-white">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
