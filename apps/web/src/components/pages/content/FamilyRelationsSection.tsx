

import { useState, useCallback } from 'react';
import { Users, Plus, Link2, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NativeSelect } from '@/components/ui/NativeSelect';
import { EmptyState } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import {
  usePersonRelationships,
  useCreateRelationship,
  useFamilyGraph,
} from '@/lib/hooks/useGenealogy';
import { genealogyApi } from '@/lib/api/genealogy';
import type { RelationType, RelationshipDTO, PersonSearchResult } from '@/lib/api/genealogy';
import { ApiClientError } from '@/lib/api';

interface FamilyRelationsSectionProps {
  personId: string;
}

const relationTypeOptions = [
  { value: 'mother', label: 'Мать' },
  { value: 'father', label: 'Отец' },
  { value: 'son', label: 'Сын' },
  { value: 'daughter', label: 'Дочь' },
  { value: 'brother', label: 'Брат' },
  { value: 'sister', label: 'Сестра' },
  { value: 'spouse', label: 'Супруг(а)' },
  { value: 'sibling', label: 'Брат/Сестра' },
  { value: 'child', label: 'Ребенок' },
  { value: 'parent', label: 'Родитель' },
];

const relationTypeLabels: Record<RelationType, string> = {
  mother: 'Мать',
  father: 'Отец',
  son: 'Сын',
  daughter: 'Дочь',
  brother: 'Брат',
  sister: 'Сестра',
  spouse: 'Супруг(а)',
  sibling: 'Брат/Сестра',
  child: 'Ребенок',
  parent: 'Родитель',
};

export function FamilyRelationsSection({ personId }: FamilyRelationsSectionProps) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PersonSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonSearchResult | null>(null);
  const [relationType, setRelationType] = useState<string>('parent');

  const { data: relationships, isLoading } = usePersonRelationships(personId, true);
  const { data: familyGraph } = useFamilyGraph(personId, 2);
  const createRelationship = useCreateRelationship(personId);

  const handleSearch = useCallback(async () => {
    if (searchQuery.length < 2) return;

    setIsSearching(true);
    try {
      const response = await genealogyApi.searchPersons(searchQuery, 10);

      setSearchResults(response.items.filter(p => p.id !== personId));
    } catch (error) {
      console.error('Search error:', error);
      toast('Ошибка поиска', 'error');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, personId, toast]);

  const handleSelectPerson = (person: PersonSearchResult) => {
    setSelectedPerson(person);
    setSearchResults([]);
    setSearchQuery(person.full_name);
  };

  const handleAddRelation = async () => {
    if (!selectedPerson) {
      toast('Выберите человека из результатов поиска', 'error');
      return;
    }

    try {
      await createRelationship.mutateAsync({
        target_person_id: selectedPerson.id,
        relation_type: relationType as RelationType,
      });
      toast('Родственная связь добавлена', 'success');
      setSelectedPerson(null);
      setSearchQuery('');
      setRelationType('parent');
      setShowAddForm(false);
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast(err.detail, 'error');
      } else {
        toast('Ошибка при добавлении связи', 'error');
      }
    }
  };

  const activeRelations = relationships?.items.filter(r => r.status === 'active') || [];
  const pendingRelations = relationships?.items.filter(r => r.status === 'pending') || [];

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-phoenix-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-phoenix-400" />
          Родственные связи
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="p-4 bg-surface-800 rounded-lg space-y-4">
            <div className="text-sm font-medium text-white mb-2">Добавить родственника</div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Поиск по имени</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Введите имя для поиска..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedPerson(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleSearch();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleSearch()}
                  disabled={isSearching || searchQuery.length < 2}
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-zinc-400">Введите минимум 2 символа и нажмите поиск</p>
            </div>

            {searchResults.length > 0 && !selectedPerson && (
              <div className="border border-white/10 rounded-lg max-h-48 overflow-auto">
                {searchResults.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => handleSelectPerson(person)}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0"
                  >
                    <div className="text-sm font-medium text-white">{person.full_name}</div>
                    <div className="text-xs text-zinc-400">
                      {person.life_status === 'deceased' ? 'Умер(ла)' : person.life_status === 'alive' ? 'Жив(а)' : ''}
                      {person.birth_date && ` - Род. ${person.birth_date}`}
                      {person.death_date && ` — ${person.death_date}`}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedPerson && (
              <div className="p-3 bg-phoenix-500/10 border border-phoenix-500/20 rounded-lg">
                <div className="text-sm font-medium text-white">{selectedPerson.full_name}</div>
                <div className="text-xs text-zinc-400">
                  {selectedPerson.life_status === 'deceased' ? 'Умер(ла)' : selectedPerson.life_status === 'alive' ? 'Жив(а)' : ''}
                  {selectedPerson.birth_date && ` - Род. ${selectedPerson.birth_date}`}
                </div>
              </div>
            )}

            <NativeSelect
              label="Тип связи"
              options={relationTypeOptions}
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
            />

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-200">
                <strong>Важно:</strong> У человека может быть только одна мать и один отец.
                Для братьев/сестёр используйте соответствующий тип связи.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => void handleAddRelation()}
                isLoading={createRelationship.isPending}
                disabled={!selectedPerson}
              >
                Добавить связь
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setSearchQuery('');
                  setSelectedPerson(null);
                  setSearchResults([]);
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        )}

        {activeRelations.length === 0 && pendingRelations.length === 0 ? (
          <EmptyState
            icon="PersonPerson"
            title="Нет родственных связей"
            description="Добавьте связи с другими страницами памяти для построения генеалогического дерева"
          />
        ) : (
          <div className="space-y-4">
            {activeRelations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Подтверждённые связи</h4>
                <div className="space-y-2">
                  {activeRelations.map((relation) => (
                    <RelationCard key={relation.id} relation={relation} />
                  ))}
                </div>
              </div>
            )}

            {pendingRelations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-amber-400 mb-2">Ожидают подтверждения</h4>
                <div className="space-y-2">
                  {pendingRelations.map((relation) => (
                    <RelationCard key={relation.id} relation={relation} isPending />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {familyGraph && familyGraph.nodes.length > 1 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-zinc-300 mb-3">Генеалогическое дерево</h4>
            <div className="bg-surface-800 rounded-lg p-4">
              <div className="text-xs text-zinc-400 mb-2">
                Найдено {familyGraph.nodes.length} человек в дереве
              </div>
              <div className="flex flex-wrap gap-2">
                {familyGraph.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      node.id === personId
                        ? 'bg-phoenix-500/20 text-phoenix-300 border border-phoenix-500/30'
                        : 'bg-surface-700 text-zinc-300'
                    }`}
                  >
                    {node.full_name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RelationCardProps {
  relation: RelationshipDTO;
  isPending?: boolean;
}

function RelationCard({ relation, isPending }: RelationCardProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      isPending ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-surface-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isPending ? 'bg-amber-500/20' : 'bg-phoenix-500/20'
        }`}>
          <Link2 className={`w-4 h-4 ${isPending ? 'text-amber-400' : 'text-phoenix-400'}`} />
        </div>
        <div>
          <div className="text-sm font-medium text-white">
            {relationTypeLabels[relation.relation_type]}
          </div>
          <div className="text-xs text-zinc-400">
            {relation.to_person_name || `ID: ${relation.to_person_id.slice(0, 8)}...`}
            {isPending && <span className="ml-2 text-amber-400">Ожидает подтверждения</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FamilyRelationsSection;
