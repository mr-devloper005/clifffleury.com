import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, Building2, FileText, Globe2, Image as ImageIcon, Megaphone, Search, Sparkles, UserRound } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditableCategory, getEditableExcerpt, getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Globe2,
  pdf: FileText,
  profile: UserRound,
}

const hiddenTaskKeys = new Set(['listing', 'classified'])

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'
const placeholder = '/placeholder.svg?height=900&width=1400'

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function pooledPosts(posts: SitePost[], timeSections: HomeTimeSection[]) {
  return dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
}

function cardHref(post: SitePost, primaryTask: TaskKey, primaryRoute: string) {
  return postHref(primaryTask, post, primaryRoute)
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-extrabold tracking-[-0.04em] text-[var(--slot4-accent)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--slot4-muted-text)]">{label}</div>
    </div>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = pooledPosts(posts, timeSections)
  const heroTitle = pagesContent.home.hero.title?.join(' ') || `Discover ${SITE_CONFIG.name}`

  return (
    <section className="relative overflow-hidden border-b border-[var(--editable-border)] bg-[linear-gradient(90deg,#061E29_0%,#0c3142_48%,#1D546D_100%)]">
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_top_left,rgba(95,149,152,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(29,84,109,0.18),transparent_22%)]" />
      <div className={`relative py-20 sm:py-24 lg:py-28 ${container}`}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold tracking-[0.08em] text-[var(--slot4-muted-text)]">{pagesContent.home.hero.badge || 'Find what matters'}</p>
          <h1 className="editable-display mt-6 text-balance text-5xl font-semibold leading-[0.94] text-white sm:text-6xl lg:text-[5.2rem]">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-[var(--slot4-muted-text)]">{pagesContent.home.hero.description}</p>

          <form action="/search" className="mx-auto mt-10 flex w-full max-w-[560px] overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.07)] shadow-[0_22px_72px_rgba(0,0,0,0.34)] backdrop-blur-md">
            <div className="flex flex-1 items-center gap-3 px-5">
              <Search className="h-5 w-5 text-[var(--slot4-soft-muted-text)]" />
              <input
                name="q"
                placeholder="What are you looking for?"
                className="w-full bg-transparent py-4 text-base text-white outline-none placeholder:text-[var(--slot4-soft-muted-text)]"
              />
            </div>
            <button className="min-w-[120px] bg-[var(--editable-cta-bg)] px-6 text-lg font-bold text-white transition hover:brightness-110">
              Search
            </button>
          </form>

          <div className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-10 sm:gap-14">
            <Stat value={pool.length || 0} label="Active Ads" />
            <Stat value={SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskKeys.has(task.key)).length} label="Categories" />
            <Stat value={timeSections.reduce((sum, section) => sum + section.posts.length, 0) || posts.length} label="Fresh Posts" />
          </div>
        </div>
      </div>
      <div className="absolute left-10 top-10 hidden h-28 w-28 rounded-full border border-white/10 bg-white/5 blur-3xl lg:block" />
      <div className="absolute bottom-10 right-10 hidden h-32 w-32 rounded-full border border-white/10 bg-[var(--slot4-accent)]/20 blur-3xl lg:block" />
    </section>
  )
}

export function EditableStoryRail({ primaryRoute }: HomeSectionProps) {
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenTaskKeys.has(task.key))
  if (!categories.length) return null

  return (
    <section className="bg-[var(--slot4-dark-bg)]">
      <div className={`py-14 ${container}`}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="editable-display text-3xl font-semibold text-white sm:text-[3rem]">Browse Categories</h2>
          </div>
          <Link href={primaryRoute} className="hidden items-center gap-1 text-lg font-semibold text-[var(--slot4-accent)] sm:inline-flex">
            View All <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
          {categories.map((task) => {
            const Icon = taskIcon[task.key] || FileText
            return (
              <Link
                key={task.key}
                href={task.route}
                className="group rounded-[22px] border border-white/8 bg-[var(--slot4-surface-bg)] px-4 py-8 text-center shadow-[0_16px_44px_rgba(0,0,0,0.18)] transition hover:-translate-y-1.5 hover:border-[var(--slot4-accent)]/45"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                  <Icon className="h-7 w-7" />
                </span>
                <div className="mt-5 text-lg font-bold text-white">{task.label}</div>
                <div className="mt-2 text-sm text-[var(--slot4-muted-text)]">{Math.max(0, task.key.length + categories.length - 2)} ads</div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeaturedCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-[26px] border border-white/8 bg-[var(--slot4-surface-bg)]">
      <div className="relative aspect-[1.18/1] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.82))]" />
        <span className="absolute left-4 top-4 rounded-xl bg-[var(--slot4-accent)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--slot4-page-bg)]">New</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h3 className="mt-3 line-clamp-2 text-3xl font-extrabold leading-tight text-white">{post.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/70">{getEditableExcerpt(post, 120)}</p>
      </div>
    </Link>
  )
}

function CompactCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[24px] border border-white/8 bg-[var(--slot4-surface-bg)]">
      <div className="aspect-[4/3] bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="p-5">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h3 className="mt-3 line-clamp-2 text-[1.65rem] font-extrabold leading-tight text-white">{post.title}</h3>
        <p className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[var(--slot4-accent)]">$0.00</p>
        <div className="mt-4 border-t border-white/8 pt-4 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 88) || 'Open the detail page for the full description.'}</div>
      </div>
    </Link>
  )
}

function HorizontalCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group flex overflow-hidden rounded-[24px] border border-white/8 bg-[var(--slot4-surface-bg)]">
      <div className="w-[124px] shrink-0 bg-[var(--slot4-media-bg)] sm:w-[160px]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
      </div>
      <div className="min-w-0 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-extrabold leading-tight text-white">{post.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 90) || 'View the full details and contact information.'}</p>
      </div>
    </Link>
  )
}

function EditorialCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group flex items-start gap-4 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.02)] p-5 transition hover:border-[var(--slot4-accent)]/35 hover:bg-white/[0.04]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-sm font-black text-[var(--slot4-accent)]">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-2xl font-extrabold leading-tight text-white">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 95)}</p>
      </div>
    </Link>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[24px] border border-white/8 bg-[var(--slot4-surface-bg)]">
      <div className="aspect-[1/1] bg-[var(--slot4-media-bg)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
      </div>
      <div className="p-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">
          <Sparkles className="h-3.5 w-3.5" /> {getEditableCategory(post)}
        </div>
        <h3 className="mt-3 line-clamp-2 text-2xl font-extrabold leading-tight text-white">{post.title}</h3>
      </div>
    </Link>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const feed = pooledPosts(posts, timeSections).slice(0, 8)
  if (!feed.length) return null

  const featured = feed[0]
  const compact = feed.slice(1, 4)
  const horizontal = feed.slice(4, 6)
  const imageFirst = feed[6]
  const editorial = feed.slice(6, 8)

  return (
    <section className="bg-[var(--slot4-dark-bg)]">
      <div className={`py-12 sm:py-16 ${container}`}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="editable-display text-3xl font-semibold text-white sm:text-[3rem]">Latest Ads</h2>
          <Link href={primaryRoute} className="hidden items-center gap-1 text-lg font-semibold text-[var(--slot4-accent)] sm:inline-flex">
            See All <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-6">
            {featured ? <FeaturedCard post={featured} href={cardHref(featured, primaryTask, primaryRoute)} /> : null}
            <div className="grid gap-6 md:grid-cols-2">
              {compact.map((post) => (
                <CompactCard key={post.slug || post.id || post.title} post={post} href={cardHref(post, primaryTask, primaryRoute)} />
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {imageFirst ? <ImageFirstCard post={imageFirst} href={cardHref(imageFirst, primaryTask, primaryRoute)} /> : null}
            {horizontal.map((post) => (
              <HorizontalCard key={post.slug || post.id || post.title} post={post} href={cardHref(post, primaryTask, primaryRoute)} />
            ))}
            {editorial.map((post, index) => (
              <EditorialCard key={post.slug || post.id || post.title} post={post} href={cardHref(post, primaryTask, primaryRoute)} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const fallbackSections: HomeTimeSection[] = [
    {
      key: 'spotlight',
      href: primaryRoute,
      posts: posts.slice(0, 4),
      title: 'Curated for this week',
      eyebrow: 'Fresh Picks',
      description: 'A quick starting point for the newest posts.',
      task: primaryTask,
    },
    {
      key: 'browse',
      href: primaryRoute,
      posts: posts.slice(4, 8),
      title: 'More from the archive',
      eyebrow: 'Explore More',
      description: 'A wider look at the latest posts in this section.',
      task: primaryTask,
    },
  ]

  const sections = timeSections.length > 0 ? timeSections : fallbackSections

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.slice(0, 2).map((section, sectionIndex) => (
        <section key={section.key} className={sectionIndex % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-[var(--slot4-dark-bg)]'}>
          <div className={`py-14 ${container}`}>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">{section.key === 'spotlight' ? 'Fresh Picks' : 'Explore More'}</p>
                <h2 className="editable-display mt-3 text-3xl font-semibold text-white sm:text-[2.8rem]">
                  {section.key === 'spotlight' ? 'Curated for this week' : 'More from the archive'}
                </h2>
              </div>
              <Link href={section.href || primaryRoute} className="hidden items-center gap-1 text-base font-semibold text-[var(--slot4-accent)] sm:inline-flex">
                View collection <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {section.posts.slice(0, 4).map((post, index) => (
                <article key={post.slug || post.id || post.title} className="rounded-[24px] border border-white/8 bg-[var(--slot4-surface-bg)] p-5">
                  <div className="aspect-[4/3] overflow-hidden rounded-[18px] bg-[var(--slot4-media-bg)]">
                    <img src={getEditablePostImage(post) || placeholder} alt={post.title} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">#{index + 1} {getEditableCategory(post)}</p>
                  <h3 className="mt-3 line-clamp-2 text-2xl font-extrabold leading-tight text-white">{post.title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 86)}</p>
                  <Link href={cardHref(post, primaryTask, primaryRoute)} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">
                    Open listing <ArrowRight className="h-4 w-4 text-[var(--slot4-accent)]" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section className="border-t border-[var(--editable-border)] bg-[var(--slot4-page-bg)]">
      <div className={`py-16 text-center ${container}`}>
        <div className="mx-auto max-w-3xl rounded-[32px] border border-white/8 bg-[linear-gradient(135deg,rgba(95,149,152,0.16),rgba(29,84,109,0.22))] px-6 py-12 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>
          <h2 className="editable-display mt-6 text-4xl font-semibold text-white sm:text-[3.4rem]">Ready to publish your next listing?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--slot4-muted-text)]">
            Share a service, promote a business, or post a fresh opportunity with a layout that feels polished from the first glance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/create" className="inline-flex items-center gap-2 rounded-[18px] bg-[var(--editable-cta-bg)] px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-110">
              Post Ad
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-[18px] border border-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/5">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
