import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, TextInput, Modal } from 'react-native';
import { Search, X, Filter, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, fontSize, space, radius } from '../../theme';
import { ScreenContainer, Header, Tag, Skeleton, EmptyState, Button } from '../../components/ui';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import { restaurantApi } from '../../services/api';

const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$'];
const SORT_OPTIONS = [
  { key: 'rating', label: 'Rating' },
  { key: 'name', label: 'Name' },
  { key: 'price-low', label: 'Price · low to high' },
  { key: 'price-high', label: 'Price · high to low' }
];

export default function SearchScreen({ navigation }) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cuisines, setCuisines] = useState([]);
  const [filters, setFilters] = useState({ cuisine: null, priceRange: null, minRating: 0, sort: 'rating' });

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { restaurantApi.cuisines().then(setCuisines).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (debounced) params.search = debounced;
    if (filters.cuisine) params.cuisine = filters.cuisine;
    if (filters.priceRange) params.priceRange = filters.priceRange;
    if (filters.minRating) params.minRating = filters.minRating;
    restaurantApi.list(params)
      .then((d) => setResults(d))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debounced, filters.cuisine, filters.priceRange, filters.minRating]);

  const sorted = useMemo(() => {
    const list = [...results];
    if (filters.sort === 'rating') list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    if (filters.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    if (filters.sort === 'price-low') list.sort((a, b) => (a.priceRange?.length || 0) - (b.priceRange?.length || 0));
    if (filters.sort === 'price-high') list.sort((a, b) => (b.priceRange?.length || 0) - (a.priceRange?.length || 0));
    return list;
  }, [results, filters.sort]);

  const activeFilterCount = (filters.cuisine ? 1 : 0) + (filters.priceRange ? 1 : 0) + (filters.minRating > 0 ? 1 : 0);

  return (
    <ScreenContainer>
      <View style={{
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.md
      }}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center',
          backgroundColor: theme.surface, borderRadius: radius.full, paddingHorizontal: 14, height: 44,
          borderWidth: 1, borderColor: theme.surfaceLine
        }}>
          <Search size={16} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search restaurants, cuisines, dishes…"
            placeholderTextColor={theme.textMuted}
            style={{ flex: 1, marginLeft: 10, color: theme.text, fontSize: fontSize.md }}
            autoFocus
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <X size={14} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setFiltersOpen(true); }}
          style={{
            marginLeft: 10, width: 44, height: 44, borderRadius: radius.full,
            backgroundColor: activeFilterCount > 0 ? theme.accent : theme.surface,
            borderWidth: 1, borderColor: activeFilterCount > 0 ? theme.accent : theme.surfaceLine,
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Filter size={16} color={activeFilterCount > 0 ? theme.textInverse : theme.text} />
          {activeFilterCount > 0 ? (
            <View style={{
              position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9,
              backgroundColor: theme.burgundy, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={{ padding: space.lg }}>
          <Skeleton height={140} br={radius.lg} style={{ marginBottom: space.md }} />
          <Skeleton height={140} br={radius.lg} style={{ marginBottom: space.md }} />
          <Skeleton height={140} br={radius.lg} style={{ marginBottom: space.md }} />
        </ScrollView>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<Search size={28} color={theme.textMuted} />}
          title="No matches"
          message="Try a different cuisine or remove a filter."
          action={activeFilterCount > 0 ? <Button label="Clear filters" variant="outline" onPress={() => setFilters({ cuisine: null, priceRange: null, minRating: 0, sort: 'rating' })} /> : null}
        />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(it) => it._id}
          contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 120 }}
          renderItem={({ item, index }) => (
            <RestaurantCard
              restaurant={item}
              index={index}
              onPress={() => navigation.navigate('RestaurantDetail', { id: item._id })}
            />
          )}
        />
      )}

      <Modal animationType="slide" presentationStyle="pageSheet" visible={filtersOpen} onRequestClose={() => setFiltersOpen(false)}>
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <Header title="Filters" onBack={() => setFiltersOpen(false)} right={
            <Pressable onPress={() => setFilters({ cuisine: null, priceRange: null, minRating: 0, sort: 'rating' })}>
              <Text style={{ color: theme.accent, fontWeight: '700' }}>Reset</Text>
            </Pressable>
          } />
          <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}>
            <Section title="Cuisine">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {cuisines.map((c) => (
                  <Tag key={c} label={c} active={filters.cuisine === c} onPress={() => setFilters((f) => ({ ...f, cuisine: f.cuisine === c ? null : c }))} />
                ))}
              </View>
            </Section>
            <Section title="Price range">
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {PRICE_OPTIONS.map((p) => (
                  <Tag key={p} label={p} active={filters.priceRange === p} onPress={() => setFilters((f) => ({ ...f, priceRange: f.priceRange === p ? null : p }))} />
                ))}
              </View>
            </Section>
            <Section title="Minimum rating">
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[0, 4.0, 4.5, 4.8].map((r) => (
                  <Tag
                    key={r}
                    label={r === 0 ? 'Any' : `${r}+`}
                    icon={r > 0 ? <Star size={10} color={filters.minRating === r ? '#fff' : theme.accent} fill={theme.accent} /> : null}
                    active={filters.minRating === r}
                    onPress={() => setFilters((f) => ({ ...f, minRating: r }))}
                  />
                ))}
              </View>
            </Section>
            <Section title="Sort by">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SORT_OPTIONS.map((s) => (
                  <Tag key={s.key} label={s.label} active={filters.sort === s.key} onPress={() => setFilters((f) => ({ ...f, sort: s.key }))} />
                ))}
              </View>
            </Section>
          </ScrollView>
          <View style={{ padding: space.lg, borderTopWidth: 1, borderTopColor: theme.surfaceLine }}>
            <Button label={`Show ${sorted.length} results`} onPress={() => setFiltersOpen(false)} variant="dark" size="lg" />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const Section = ({ title, children }) => {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: space.xl }}>
      <Text style={{ color: theme.text, fontSize: fontSize.md, fontWeight: '800', marginBottom: space.md }}>{title}</Text>
      {children}
    </View>
  );
};
