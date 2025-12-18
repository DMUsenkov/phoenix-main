import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Share2,
  Copy,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Star,
  BookOpen,
  Clock,
  Heart,
  Quote,
} from 'lucide-react';
import { usePublicPage, usePublicPageMedia, usePublicPageContent } from '@/lib/hooks';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { CosmicBackground, RichTextRenderer, BurialMap } from '@/components/memorial';
import type { LifeStatus } from '@/lib/api';
import type { PublicMediaDTO } from '@/lib/api/pages';

const lifeStatusLabels: Record<LifeStatus, string> = {
  alive: ' Жизнь продолжается',
  deceased: 'Memory Память жива',
  unknown: '',
};

function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

function formatYear(dateString: string | null): string | null {
  if (!dateString) return null;
  return new Date(dateString).getFullYear().toString();
}

function formatLifeDates(birthDate: string | null, deathDate: string | null): string | null {
  const birthYear = formatYear(birthDate);
  const deathYear = formatYear(deathDate);

  if (birthYear && deathYear) {
    return `${birthYear} — ${deathYear}`;
  }
  if (birthYear) {
    return `${birthYear} — н.в.`;
  }
  return null;
}

function calculateAge(birthDate: string | null, deathDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}


interface PhotoItem {
  url: string;
  isPrimary: boolean;
  isBurial: boolean;
}

function PhotoGallery({
  media,
  primaryPhoto,
}: {
  media: PublicMediaDTO[];
  primaryPhoto: PublicMediaDTO | null;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allPhotos = useMemo(() => {
    const photos: PhotoItem[] = [];

    if (primaryPhoto?.original_url) {
      photos.push({ url: primaryPhoto.original_url, isPrimary: true, isBurial: false });
    }

    media.forEach(m => {
      if (m.type === 'image' && m.original_url && (!primaryPhoto || m.id !== primaryPhoto.id)) {
        photos.push({ url: m.original_url, isPrimary: false, isBurial: false });
      }
    });

    return photos;
  }, [media, primaryPhoto]);

  if (allPhotos.length === 0) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => setLightboxIndex(prev => prev !== null ? (prev + 1) % allPhotos.length : null);
  const prevPhoto = () => setLightboxIndex(prev => prev !== null ? (prev - 1 + allPhotos.length) % allPhotos.length : null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allPhotos.map((photo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group ${
              photo.isPrimary ? 'col-span-2 row-span-2' : ''
            }`}
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {photo.isPrimary && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-phoenix-500/80 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                Главное фото
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {allPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                  className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                  className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {lightboxIndex !== null && allPhotos[lightboxIndex] && (
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                src={allPhotos[lightboxIndex].url}
                alt=""
                className="max-w-[90vw] max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightboxIndex + 1} / {allPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


function SectionWrapper({
  children,
  title,
  icon: Icon,
  delay = 0,
  gradient = 'from-phoenix-500 to-phoenix-600',
}: {
  children: React.ReactNode;
  title: string;
  icon: LucideIcon;
  delay?: number;
  gradient?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      className="relative"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} p-[1px]`}>
          <div className="w-full h-full rounded-xl bg-surface-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function TimelineItem({
  title,
  subtitle,
  date,
  location,
  description,
  isLast = false,
}: {
  title: string;
  subtitle?: string | undefined;
  date?: string | undefined;
  location?: string | undefined;
  description?: Record<string, unknown> | null | undefined;
  isLast?: boolean | undefined;
}) {
  return (
    <div className="relative pl-8 pb-6">
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-phoenix-500/50 to-transparent" />
      )}
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-phoenix-500/20 border-2 border-phoenix-500 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-phoenix-500" />
      </div>

      <div className="glass-card p-4 hover:border-white/15 transition-all">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        {subtitle && <p className="text-phoenix-400 text-sm mb-2">{subtitle}</p>}
        <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
          {date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
          )}
        </div>
        {description && (
          <div className="mt-3 text-zinc-400 text-sm">
            <RichTextRenderer content={description} />
          </div>
        )}
      </div>
    </div>
  );
}

export function MemorialPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading: pageLoading, error } = usePublicPage(slug);
  const { data: mediaData } = usePublicPageMedia(slug);
  const { data: contentData } = usePublicPageContent(slug);
  const { toast } = useToast();

  const isLoading = pageLoading;
  const media = mediaData?.items || [];
  const primaryPhoto = mediaData?.primary_photo || null;
  const content = contentData;

  const handleShare = async () => {
    const url = window.location.href;
    const title = page?.person.full_name || 'Мемориальная страница';

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {

      }
    } else {
      await navigator.clipboard.writeText(url);
      toast('Ссылка скопирована!', 'success');
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast('Ссылка скопирована!', 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-obsidian via-surface to-obsidian-deep">
        <div className="container-app py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Skeleton className="w-48 h-48 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const is404 = error.status === 404;

    return (
      <div className="min-h-screen bg-gradient-to-b from-obsidian via-surface to-obsidian-deep flex items-center justify-center">
        <Helmet>
          <title>{is404 ? 'Страница не найдена' : 'Доступ ограничен'} — Phoenix</title>
        </Helmet>
        <div className="container-app py-12">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10"
            >
              <div className="text-7xl mb-6">{is404 ? 'Search' : 'Lock'}</div>
              <h1 className="text-2xl font-bold text-white mb-3">
                {is404 ? 'Страница не найдена' : 'Доступ ограничен'}
              </h1>
              <p className="text-zinc-400 mb-8">
                {is404
                  ? 'Возможно, страница была удалена или ещё не опубликована.'
                  : 'Эта страница доступна только по приглашению.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/">
                  <Button variant="primary">На главную</Button>
                </Link>
                <Link to="/map">
                  <Button variant="secondary">Открыть карту</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!page) return null;

  const { person } = page;
  const title = page.title || person.full_name;
  const lifeDates = formatLifeDates(person.birth_date, person.death_date);
  const age = calculateAge(person.birth_date, person.death_date);
  const metaDescription = page.short_description || page.biography
    ? truncateText((page.short_description || page.biography || '').replace(/\n/g, ' '), 160)
    : `Мемориальная страница памяти ${person.full_name}`;

  const hasBurialLocation = person.life_status === 'deceased' &&
    person.burial_place_lat !== null &&
    person.burial_place_lng !== null;

  return (
    <div className="min-h-screen relative overflow-hidden">

      <CosmicBackground />

      <Helmet>
        <title>{title} — Phoenix</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${title} — Phoenix`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
        {primaryPhoto?.original_url && (
          <meta property="og:image" content={primaryPhoto.original_url} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} — Phoenix`} />
        <meta name="twitter:description" content={metaDescription} />
      </Helmet>


      <div className="relative z-10">

        <section className="relative py-12 md:py-20">
          <div className="container-app px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-5xl mx-auto"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-start">

                {primaryPhoto?.original_url ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative shrink-0"
                  >
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                      <img
                        src={primaryPhoto.original_url}
                        alt={person.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center shadow-glow-lg">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-40 h-40 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-phoenix-500/20 to-phoenix-600/20 border-2 border-white/10 flex items-center justify-center shrink-0"
                  >
                    <Heart className="w-16 h-16 text-phoenix-400" />
                  </motion.div>
                )}


                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex-1"
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    {title}
                  </h1>

                  {person.life_status !== 'unknown' && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/10 mb-4">
                      <span className="text-lg">{lifeStatusLabels[person.life_status]}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-zinc-400 mb-6">
                    {lifeDates && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-phoenix-400" />
                        <span>{lifeDates}</span>
                        {age !== null && (
                          <span className="text-zinc-500">({age} лет)</span>
                        )}
                      </div>
                    )}
                    {person.birth_place && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-phoenix-400" />
                        <span>{person.birth_place}</span>
                      </div>
                    )}
                  </div>

                  {page.short_description && (
                    <p className="text-lg text-zinc-300 mb-6 leading-relaxed">
                      {page.short_description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      onClick={() => void handleShare()}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Поделиться
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => void handleCopyLink()}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Копировать ссылку
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>


        <div className="container-app px-4 pb-20">
          <div className="max-w-5xl mx-auto space-y-16">

            {(page.biography_json || page.biography) && (
              <SectionWrapper title="Биография" icon={BookOpen} gradient="from-blue-500 to-indigo-500">
                <div className="glass-card p-6 md:p-8">
                  <RichTextRenderer content={page.biography_json || page.biography} />
                </div>
              </SectionWrapper>
            )}


            {media.length > 0 && (
              <SectionWrapper title="Фотографии" icon={Sparkles} gradient="from-amber-500 to-orange-500" delay={0.1}>
                <PhotoGallery
                  media={media}
                  primaryPhoto={primaryPhoto}
                />
              </SectionWrapper>
            )}


            {hasBurialLocation && (
              <SectionWrapper title="Место захоронения" icon={MapPin} gradient="from-emerald-500 to-teal-500" delay={0.15}>
                <BurialMap
                  lat={person.burial_place_lat!}
                  lng={person.burial_place_lng!}
                  burialPhotoUrl={person.burial_photo_url}
                />
              </SectionWrapper>
            )}


            {content && content.life_events.length > 0 && (
              <SectionWrapper title="Важные события" icon={Clock} gradient="from-purple-500 to-pink-500" delay={0.2}>
                <div className="space-y-0">
                  {content.life_events.map((event, index) => (
                    <TimelineItem
                      key={event.id}
                      title={event.title}
                      date={event.start_date ? formatDate(event.start_date) || undefined : undefined}
                      location={event.location || undefined}
                      description={event.description}
                      isLast={index === content.life_events.length - 1}
                    />
                  ))}
                </div>
              </SectionWrapper>
            )}


            {content && content.achievements.length > 0 && (
              <SectionWrapper title="Достижения" icon={Award} gradient="from-yellow-500 to-amber-500" delay={0.25}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {content.achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="glass-card p-5 hover:border-white/15 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-1">{achievement.title}</h3>
                          {achievement.date && (
                            <p className="text-zinc-500 text-sm">{formatDate(achievement.date)}</p>
                          )}
                          {achievement.description && (
                            <div className="mt-2 text-zinc-400 text-sm">
                              <RichTextRenderer content={achievement.description} />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SectionWrapper>
            )}


            {content && content.education.length > 0 && (
              <SectionWrapper title="Образование" icon={GraduationCap} gradient="from-cyan-500 to-blue-500" delay={0.3}>
                <div className="space-y-4">
                  {content.education.map((edu) => (
                    <motion.div
                      key={edu.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="glass-card p-5 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{edu.institution}</h3>
                          {edu.degree && (
                            <p className="text-phoenix-400">{edu.degree}</p>
                          )}
                          {edu.field_of_study && (
                            <p className="text-zinc-400">{edu.field_of_study}</p>
                          )}
                          {(edu.start_year || edu.end_year) && (
                            <p className="text-zinc-500 text-sm mt-1">
                              {edu.start_year || '?'} — {edu.end_year || 'н.в.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SectionWrapper>
            )}


            {content && content.career.length > 0 && (
              <SectionWrapper title="Карьера" icon={Briefcase} gradient="from-green-500 to-emerald-500" delay={0.35}>
                <div className="space-y-4">
                  {content.career.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="glass-card p-5 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                          <Briefcase className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{job.role}</h3>
                          <p className="text-phoenix-400">{job.organization}</p>
                          {(job.start_date || job.end_date) && (
                            <p className="text-zinc-500 text-sm mt-1">
                              {job.start_date ? formatDate(job.start_date) : '?'} — {job.end_date ? formatDate(job.end_date) : 'н.в.'}
                            </p>
                          )}
                          {job.description && (
                            <div className="mt-3 text-zinc-400 text-sm">
                              <RichTextRenderer content={job.description} />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SectionWrapper>
            )}


            {content && (content.values.values.length > 0 || content.values.beliefs.length > 0 || content.values.principles.length > 0) && (
              <SectionWrapper title="Ценности и убеждения" icon={Star} gradient="from-rose-500 to-pink-500" delay={0.4}>
                <div className="glass-card p-6 md:p-8">
                  {content.values.values.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-400" />
                        Ценности
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {content.values.values.map((v) => (
                          <span key={v.id} className="px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                            {v.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {content.values.beliefs.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Убеждения
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {content.values.beliefs.map((v) => (
                          <span key={v.id} className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
                            {v.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {content.values.principles.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        Принципы
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {content.values.principles.map((v) => (
                          <span key={v.id} className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                            {v.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionWrapper>
            )}


            {content && content.quotes.length > 0 && (
              <SectionWrapper title="Цитаты" icon={Quote} gradient="from-indigo-500 to-violet-500" delay={0.45}>
                <div className="space-y-4">
                  {content.quotes.map((quote) => (
                    <motion.blockquote
                      key={quote.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="glass-card p-6 border-l-4 border-phoenix-500"
                    >
                      <Quote className="w-8 h-8 text-phoenix-500/30 mb-2" />
                      <p className="text-xl text-white italic leading-relaxed mb-3">
                        «{quote.text}»
                      </p>
                      {quote.source && (
                        <footer className="text-zinc-500 text-sm">— {quote.source}</footer>
                      )}
                    </motion.blockquote>
                  ))}
                </div>
              </SectionWrapper>
            )}


            {content && content.memorial_messages.length > 0 && (
              <SectionWrapper title="Книга памяти" icon={MessageCircle} gradient="from-teal-500 to-cyan-500" delay={0.5}>
                <div className="space-y-4">
                  {content.memorial_messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="glass-card p-5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/30 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {message.author_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{message.author_name}</p>
                          <p className="text-zinc-500 text-xs">
                            {new Date(message.created_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-zinc-300">
                        <RichTextRenderer content={message.text} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SectionWrapper>
            )}


            <motion.footer
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center pt-12 border-t border-white/5"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-3 text-zinc-500 hover:text-zinc-300 transition-colors group"
              >
                <img
                  src="/logo-circle-white.svg"
                  alt="Phoenix"
                  className="w-5 h-5 opacity-50 group-hover:opacity-75 transition-opacity"
                />
                <span className="text-sm">Создано на Phoenix</span>
              </Link>
            </motion.footer>
          </div>
        </div>
      </div>
    </div>
  );
}
