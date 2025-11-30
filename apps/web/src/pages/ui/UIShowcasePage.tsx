import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  Switch,
  Checkbox,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  Tooltip,
  Modal,
  useToast,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EmptyState,
  PasswordInput,
  Select,
  FileInput,
  LoadingState,
  ErrorState,
  SuccessState,
  DataTable,
  Pagination,
  FilterBar,
  SortSelect,
  ConfirmDialog,
  InlineAlert,
  Progress,
  CircularProgress,
  CopyButton,
  CopyField,
  PageHeader,
  SectionHeader,
  Breadcrumbs,
  type Column,
} from '@/components/ui';

interface SampleItem {
  id: string;
  name: string;
  email: string;
  status: string;
}

const sampleData: SampleItem[] = [
  { id: '1', name: 'Иван Петров', email: 'ivan@example.com', status: 'Активен' },
  { id: '2', name: 'Мария Сидорова', email: 'maria@example.com', status: 'Неактивен' },
  { id: '3', name: 'Алексей Козлов', email: 'alexey@example.com', status: 'Активен' },
];

const sampleColumns: Column<SampleItem>[] = [
  { key: 'name', header: 'Имя' },
  { key: 'email', header: 'Email' },
  { key: 'status', header: 'Статус' },
];

export function UIShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('name');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">UI Showcase</h1>
          <p className="text-zinc-400">
            Phoenix Design System — Deep Violet/Purple Theme
          </p>
          <Badge variant="primary" className="mt-3">Dev Only</Badge>
        </div>

        <div className="space-y-16">
          <Section title="Colors">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="text-center">
                  <div
                    className={`h-16 rounded-xl bg-phoenix-${shade} mb-2`}
                    style={{ backgroundColor: `var(--tw-colors-phoenix-${shade}, rgb(var(--color-phoenix-${shade})))` }}
                  />
                  <span className="text-xs text-zinc-400">phoenix-{shade}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
              <ColorSwatch name="surface" className="bg-surface" />
              <ColorSwatch name="surface-50" className="bg-surface-50" />
              <ColorSwatch name="surface-100" className="bg-surface-100" />
              <ColorSwatch name="surface-200" className="bg-surface-200" />
              <ColorSwatch name="surface-300" className="bg-surface-300" />
            </div>
          </Section>

          <Section title="Typography">
            <div className="space-y-4">
              <p className="text-4xl font-bold text-white">Heading 1 — 36px Bold</p>
              <p className="text-2xl font-bold text-white">Heading 2 — 24px Bold</p>
              <p className="text-xl font-semibold text-white">Heading 3 — 20px Semibold</p>
              <p className="text-lg font-medium text-white">Heading 4 — 18px Medium</p>
              <p className="text-base text-white">Body — 16px Regular</p>
              <p className="text-sm text-zinc-400">Secondary — 14px Zinc-400</p>
              <p className="text-xs text-zinc-500">Caption — 12px Zinc-500</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-phoenix-400 to-phoenix-600 bg-clip-text text-transparent">
                Gradient Text
              </p>
            </div>
          </Section>

          <Section title="Buttons">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Section>

          <Section title="Inputs">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Email"
                placeholder="email@example.com"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="--------"
              />
              <Input
                label="With Error"
                error="This field is required"
                placeholder="Enter value"
              />
              <Input
                label="With Hint"
                hint="We'll never share your email"
                placeholder="Enter value"
              />
              <Textarea
                label="Message"
                placeholder="Enter your message..."
                rows={4}
              />
              <Textarea
                label="With Error"
                error="Message is too short"
                placeholder="Enter your message..."
                rows={4}
              />
            </div>
          </Section>

          <Section title="Cards">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>Standard surface background</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm">Card content goes here.</p>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Glass Card</CardTitle>
                  <CardDescription>With blur and glow</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm">Card content goes here.</p>
                </CardContent>
              </Card>

              <Card variant="gradient">
                <CardHeader>
                  <CardTitle>Gradient Card</CardTitle>
                  <CardDescription>Phoenix gradient accent</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm">Card content goes here.</p>
                </CardContent>
              </Card>

              <Card interactive>
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>Hover to see effect</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm">Click me!</p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>With shadow</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm">Card content goes here.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
            </div>
          </Section>

          <Section title="Badges">
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </Section>

          <Section title="Avatars">
            <div className="flex flex-wrap items-end gap-4">
              <Avatar size="xs" fallback="John Doe" />
              <Avatar size="sm" fallback="John Doe" />
              <Avatar size="md" fallback="John Doe" />
              <Avatar size="lg" fallback="John Doe" />
              <Avatar size="xl" fallback="John Doe" />
            </div>
          </Section>

          <Section title="Form Controls">
            <div className="space-y-4">
              <Switch
                label="Enable notifications"
                checked={switchValue}
                onChange={(e) => setSwitchValue(e.target.checked)}
              />
              <Checkbox
                label="I agree to the terms"
                checked={checkboxValue}
                onChange={(e) => setCheckboxValue(e.target.checked)}
              />
            </div>
          </Section>

          <Section title="Tabs">
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Overview</TabsTrigger>
                <TabsTrigger value="tab2">Analytics</TabsTrigger>
                <TabsTrigger value="tab3">Settings</TabsTrigger>
              </TabsList>
              <div className="mt-4">
                <TabsContent value="tab1">
                  <Card>
                    <CardContent>
                      <p className="text-zinc-400">Overview content</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab2">
                  <Card>
                    <CardContent>
                      <p className="text-zinc-400">Analytics content</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab3">
                  <Card>
                    <CardContent>
                      <p className="text-zinc-400">Settings content</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </Section>

          <Section title="Tooltips">
            <div className="flex flex-wrap gap-4">
              <Tooltip content="Top tooltip" side="top">
                <Button variant="secondary">Hover (Top)</Button>
              </Tooltip>
              <Tooltip content="Bottom tooltip" side="bottom">
                <Button variant="secondary">Hover (Bottom)</Button>
              </Tooltip>
              <Tooltip content="Left tooltip" side="left">
                <Button variant="secondary">Hover (Left)</Button>
              </Tooltip>
              <Tooltip content="Right tooltip" side="right">
                <Button variant="secondary">Hover (Right)</Button>
              </Tooltip>
            </div>
          </Section>

          <Section title="Modal">
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Modal Title"
              description="This is a modal description"
            >
              <p className="text-zinc-400 mb-4">Modal content goes here.</p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </Modal>
          </Section>

          <Section title="Toasts">
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => toast('Info message', 'info')}>
                Info Toast
              </Button>
              <Button variant="secondary" onClick={() => toast('Success!', 'success')}>
                Success Toast
              </Button>
              <Button variant="secondary" onClick={() => toast('Warning!', 'warning')}>
                Warning Toast
              </Button>
              <Button variant="secondary" onClick={() => toast('Error!', 'error')}>
                Error Toast
              </Button>
            </div>
          </Section>

          <Section title="Skeletons">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <SkeletonText className="w-3/4" />
                <SkeletonText className="w-1/2" />
                <SkeletonText className="w-full" />
              </div>
              <SkeletonCard />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <SkeletonText className="w-1/2" />
                  <SkeletonText className="w-1/3" />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Empty State">
            <Card>
              <EmptyState
                icon={
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                }
                title="No items yet"
                description="Get started by creating your first item."
                action={<Button>Create Item</Button>}
              />
            </Card>
          </Section>

          <Section title="Extended Form Fields">
            <div className="grid md:grid-cols-2 gap-6">
              <PasswordInput label="Пароль" placeholder="Введите пароль" />
              <Select
                label="Выберите опцию"
                options={[
                  { value: '1', label: 'Опция 1' },
                  { value: '2', label: 'Опция 2' },
                  { value: '3', label: 'Опция 3', disabled: true },
                ]}
                placeholder="Выберите..."
              />
              <div className="md:col-span-2">
                <FileInput
                  label="Загрузить файл"
                  accept=".jpg,.png,.pdf"
                  maxSize={10 * 1024 * 1024}
                />
              </div>
            </div>
          </Section>

          <Section title="Data States">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loading State</CardTitle>
                </CardHeader>
                <CardContent>
                  <LoadingState rows={3} />
                </CardContent>
              </Card>
              <Card>
                <ErrorState
                  title="Ошибка загрузки"
                  message="Не удалось получить данные"
                  onRetry={() => toast('Повторная попытка...', 'info')}
                />
              </Card>
              <Card>
                <SuccessState
                  title="Успешно!"
                  message="Данные сохранены"
                />
              </Card>
            </div>
          </Section>

          <Section title="Data Table">
            <Card padding="none">
              <DataTable
                columns={sampleColumns}
                data={sampleData}
                keyExtractor={(item) => item.id}
                onRowClick={(item) => toast(`Clicked: ${item.name}`, 'info')}
              />
            </Card>
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
              />
            </div>
          </Section>

          <Section title="Filter Bar">
            <FilterBar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              searchPlaceholder="Поиск по имени..."
              filters={[
                { id: '1', label: 'Активные' },
                { id: '2', label: 'Новые' },
              ]}
              onRemoveFilter={(id) => toast(`Remove filter: ${id}`, 'info')}
              actions={
                <SortSelect
                  value={sortValue}
                  onChange={setSortValue}
                  options={[
                    { value: 'name', label: 'По имени' },
                    { value: 'date', label: 'По дате' },
                  ]}
                />
              }
            />
          </Section>

          <Section title="Confirm Dialog">
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                Open Confirm
              </Button>
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                Delete Item
              </Button>
            </div>
            <ConfirmDialog
              isOpen={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => {
                toast('Confirmed!', 'success');
                setConfirmOpen(false);
              }}
              title="Подтвердите действие"
              message="Вы уверены, что хотите продолжить?"
            />
            <ConfirmDialog
              isOpen={deleteOpen}
              onClose={() => setDeleteOpen(false)}
              onConfirm={() => {
                toast('Deleted!', 'success');
                setDeleteOpen(false);
              }}
              title="Удалить элемент?"
              message="Это действие нельзя отменить."
              variant="danger"
              confirmText="Удалить"
            />
          </Section>

          <Section title="Inline Alerts">
            <div className="space-y-3">
              <InlineAlert variant="info" title="Информация">
                Это информационное сообщение.
              </InlineAlert>
              <InlineAlert variant="success" title="Успех">
                Операция выполнена успешно.
              </InlineAlert>
              <InlineAlert variant="warning" title="Внимание">
                Требуется ваше внимание.
              </InlineAlert>
              <InlineAlert variant="error" title="Ошибка" onClose={() => {}}>
                Произошла ошибка при выполнении операции.
              </InlineAlert>
            </div>
          </Section>

          <Section title="Progress">
            <div className="space-y-6">
              <div className="space-y-3">
                <Progress value={25} showLabel />
                <Progress value={50} variant="success" showLabel />
                <Progress value={75} variant="warning" showLabel />
                <Progress value={100} variant="error" showLabel />
              </div>
              <div className="flex gap-6">
                <CircularProgress value={25} showLabel />
                <CircularProgress value={50} variant="success" showLabel />
                <CircularProgress value={75} variant="warning" showLabel />
                <CircularProgress value={100} variant="error" showLabel />
              </div>
            </div>
          </Section>

          <Section title="Copy to Clipboard">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Copy button:</span>
                <CopyButton text="Hello, World!" />
              </div>
              <CopyField
                label="Ссылка для приглашения"
                value="https://phoenix.app/invite/abc123"
              />
            </div>
          </Section>

          <Section title="Navigation Helpers">
            <div className="space-y-6">
              <Breadcrumbs
                items={[
                  { label: 'Главная', href: '/' },
                  { label: 'Настройки', href: '/settings' },
                  { label: 'Профиль' },
                ]}
              />
              <PageHeader
                title="Заголовок страницы"
                subtitle="Описание страницы или дополнительная информация"
                actions={<Button>Действие</Button>}
              />
              <Card>
                <SectionHeader
                  title="Заголовок секции"
                  subtitle="Подзаголовок"
                  actions={<Button size="sm" variant="ghost">Ещё</Button>}
                />
                <p className="text-zinc-400">Контент секции...</p>
              </Card>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-surface-200">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="text-center">
      <div className={`h-16 rounded-xl border border-surface-300 ${className}`} />
      <span className="text-xs text-zinc-400 mt-2 block">{name}</span>
    </div>
  );
}
