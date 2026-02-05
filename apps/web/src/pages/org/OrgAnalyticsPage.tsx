import { useState, useMemo } from 'react';
import { Download, TrendingUp, Users, QrCode, Map, Eye } from 'lucide-react';
import { Button, Card, Skeleton, EmptyState, Badge, useToast } from '@/components/ui';
import { useOrgContext } from '@/lib/org/OrgContext';
import { useOrgReportSummary } from '@/lib/hooks/useReports';
import { reportsApi } from '@/lib/api/reports';

type DateRange = '7d' | '30d' | '90d' | 'custom';

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

function getDateRange(range: DateRange): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  switch (range) {
    case '7d': from.setDate(from.getDate() - 7); break;
    case '30d': from.setDate(from.getDate() - 30); break;
    case '90d': from.setDate(from.getDate() - 90); break;
    default: from.setDate(from.getDate() - 30);
  }
  return { from: formatDate(from), to: formatDate(to) };
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function KPICard({ title, value, icon }: KPICardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-phoenix-500/20 flex items-center justify-center text-phoenix-400">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function SimpleChart({ data }: { data: { date: string; views: number; qr_scans: number }[] }) {
  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-zinc-500">Нет данных</div>;
  }
  const maxValue = Math.max(...data.map(d => Math.max(d.views, d.qr_scans)), 1);
  return (
    <div className="h-48 flex items-end gap-1">
      {data.map((point, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-0.5 items-end h-40">
            <div className="flex-1 bg-phoenix-500 rounded-t" style={{ height: `${(point.views / maxValue) * 100}%` }} title={`Просмотры: ${point.views}`} />
            <div className="flex-1 bg-emerald-500 rounded-t" style={{ height: `${(point.qr_scans / maxValue) * 100}%` }} title={`QR: ${point.qr_scans}`} />
          </div>
          <span className="text-xs text-zinc-500">{point.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export function OrgAnalyticsPage() {
  const { toast } = useToast();
  const { selectedOrg } = useOrgContext();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [exporting, setExporting] = useState(false);

  const { from, to } = useMemo(() => getDateRange(dateRange), [dateRange]);
  const { data, isLoading, isError, refetch } = useOrgReportSummary(selectedOrg?.id, { from_date: from, to_date: to });

  const handleExport = async (type: 'summary' | 'pages' | 'objects') => {
    if (!selectedOrg) return;
    setExporting(true);
    try {
      const blob = await reportsApi.exportCsv(selectedOrg.id, { from_date: from, to_date: to, report_type: type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${type}_${from}_${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Отчёт скачан', 'success');
    } catch {
      toast('Ошибка экспорта', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (!selectedOrg) {
    return <EmptyState icon="Org" title="Выберите организацию" description="Для просмотра отчётов выберите организацию" />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <EmptyState icon="Warning" title="Ошибка загрузки" description="Не удалось загрузить отчёты" action={<Button onClick={() => void refetch()}>Повторить</Button>} />;
  }

  const totals = data?.totals ?? { views: 0, unique_visitors: 0, qr_scans: 0, map_opens: 0, map_object_opens: 0 };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Аналитика</h1>
          <p className="text-zinc-400">{selectedOrg.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-100 rounded-lg p-1">
            {dateRangeOptions.map((opt) => (
              <button key={opt.value} onClick={() => setDateRange(opt.value)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${dateRange === opt.value ? 'bg-phoenix-500 text-white' : 'text-zinc-400 hover:text-white'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => void handleExport('summary')} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />Экспорт
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Просмотры" value={totals.views} icon={<Eye className="w-6 h-6" />} />
        <KPICard title="Уникальные" value={totals.unique_visitors} icon={<Users className="w-6 h-6" />} />
        <KPICard title="QR сканы" value={totals.qr_scans} icon={<QrCode className="w-6 h-6" />} />
        <KPICard title="Карта" value={totals.map_opens} icon={<Map className="w-6 h-6" />} />
        <KPICard title="Объекты" value={totals.map_object_opens} icon={<TrendingUp className="w-6 h-6" />} />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Динамика</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-phoenix-500" /><span className="text-zinc-400">Просмотры</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-zinc-400">QR</span></div>
          </div>
        </div>
        <SimpleChart data={data?.timeseries ?? []} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Топ страницы</h2>
            <Button variant="ghost" size="sm" onClick={() => void handleExport('pages')} disabled={exporting}><Download className="w-4 h-4" /></Button>
          </div>
          {data?.top_pages && data.top_pages.length > 0 ? (
            <div className="space-y-2">
              {data.top_pages.map((page, i) => (
                <div key={page.page_id} className="flex items-center justify-between py-2 border-b border-surface-200 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface-200 flex items-center justify-center text-xs text-zinc-400">{i + 1}</span>
                    <span className="text-white truncate max-w-[180px]">{page.title ?? page.slug ?? 'Без названия'}</span>
                  </div>
                  <Badge variant="default" size="sm">{page.views}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-zinc-500 text-center py-4">Нет данных</p>}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Топ объекты</h2>
            <Button variant="ghost" size="sm" onClick={() => void handleExport('objects')} disabled={exporting}><Download className="w-4 h-4" /></Button>
          </div>
          {data?.top_objects && data.top_objects.length > 0 ? (
            <div className="space-y-2">
              {data.top_objects.map((obj, i) => (
                <div key={obj.object_id} className="flex items-center justify-between py-2 border-b border-surface-200 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface-200 flex items-center justify-center text-xs text-zinc-400">{i + 1}</span>
                    <span className="text-white truncate max-w-[180px]">{obj.title ?? 'Без названия'}</span>
                  </div>
                  <Badge variant="default" size="sm">{obj.opens}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-zinc-500 text-center py-4">Нет данных</p>}
        </Card>
      </div>
    </div>
  );
}
