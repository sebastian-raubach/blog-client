<template>
  <v-card class="hike-breakdown">
    <v-card-item>
      <v-card-title>Fortbewegungstypen</v-card-title>
      <v-card-subtitle v-if="totalLength">
        {{ totalLength }} {{ unit }} gesamt
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <!-- Legend: only shows movement types actually present in the data -->
      <div class="legend mb-6">
        <v-chip
          v-for="type in usedTypes"
          :key="type"
          size="small"
          class="mr-2 mb-2"
          :color="config(type).color"
          variant="flat"
        >
          <v-icon :icon="config(type).icon" start size="16" />
          {{ config(type).label }}
        </v-chip>
      </div>

      <div v-if="groups.length === 0" class="text-medium-emphasis text-body-2">
        No individual stats to display.
      </div>

      <div
        v-for="group in groups"
        :key="group.ids.join(',')"
        class="group-row"
      >
        <!-- Avatars for every id sharing this exact set of sections -->
        <div class="avatars">
          <v-avatar-group max="4" class="mr-2">
            <v-avatar
              v-for="id in group.ids"
              :key="id"
              size="55"
              :color="photos?.[id] ? undefined : 'primary'"
            >
              <v-img v-if="photos?.[id]" :src="photos[id]" :alt="id" cover />
              <span v-else class="text-caption font-weight-medium">{{ initials(id) }}</span>
            </v-avatar>
          </v-avatar-group>
          <!-- <span class="ids-caption text-caption text-medium-emphasis">
            {{ group.ids.join(', ') }}
          </span> -->
        </div>

        <!-- Stacked bar -->
        <div class="bar-wrapper">
          <div class="stacked-bar">
            <v-tooltip
              v-for="(seg, i) in buildSegments(group.sections)"
              :key="i"
              location="top"
            >
              <template #activator="{ props: tooltipProps }">
                <div
                  v-bind="tooltipProps"
                  class="segment"
                  :class="{ 'segment--empty': !seg.type }"
                  :style="segmentStyle(seg)"
                >
                  <v-icon
                    v-if="seg.type && segmentWidthPct(seg) > 7"
                    :icon="config(seg.type).icon"
                    size="16"
                    color="white"
                  />
                </div>
              </template>
              <span>
                <template v-if="seg.type">{{ config(seg.type).label }}</template>
                <template v-else>No data</template>
                 · {{ seg.from.toFixed(1) }}-{{ seg.to.toFixed(1) }} {{ unit }}
              </span>
            </v-tooltip>
          </div>
          <div class="bar-scale d-flex justify-space-between text-caption text-medium-emphasis mt-1">
            <span>0 {{ unit }}</span>
            <span>{{ totalLength.toFixed(1) }} {{ unit }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MovementType, type HikeStats, type Section } from '@/plugins/types/blog'
import { mdiBike, mdiRun, mdiSwim, mdiTruckTrailer, mdiWalk } from '@mdi/js';

interface MovementConfig {
  icon: string;
  color: string;
  label: string;
}

interface Group {
  ids: string[];
  sections: Section[];
}

const props = withDefaults(
  defineProps<{
    hikeStats: HikeStats;
    /** Map of individual id -> photo URL. Individuals without an entry fall back to initials. */
    photos?: Record<string, string>;
    /** Overrides the auto-detected total length (defaults to the max `to` across all sections). */
    length?: number;
    /** Distance unit label shown next to numbers. */
    unit?: string;
  }>(),
  {
    photos: () => ({}),
    unit: 'km',
  },
);

const MOVEMENT_CONFIG: Record<MovementType, MovementConfig> = {
  [MovementType.BIKE]: { icon: mdiBike, color: '#006266', label: 'Rad' },
  [MovementType.WALK]: { icon: mdiWalk, color: '#009432', label: 'Gehen' },
  [MovementType.RUN]: { icon: mdiRun, color: '#EE5A24', label: 'Laufen' },
  [MovementType.TRAILER]: { icon: mdiTruckTrailer, color: '#833471', label: 'Anhänger' },
  [MovementType.SWIM]: { icon: mdiSwim, color: '#0652DD', label: 'Schwimmen' },
};

function config(type: MovementType): MovementConfig {
  return MOVEMENT_CONFIG[type];
}

const totalLength = computed(() => {
  if (props.length !== undefined) return props.length;
  let max = 0;
  for (const sections of Object.values(props.hikeStats.individualStats)) {
    for (const s of sections) {
      if (s.to > max) max = s.to;
    }
  }
  return max;
});

/** Groups individuals whose sections are identical (same from/to/type, in the same order once sorted). */
const groups = computed<Group[]>(() => {
  const map = new Map<string, Group>();

  for (const [id, sections] of Object.entries(props.hikeStats.individualStats)) {
    const sorted = [...sections].sort((a, b) => a.from - b.from);
    const key = sorted.map((s) => `${s.from}-${s.to}-${s.type}`).join('|');

    const existing = map.get(key);
    if (existing) {
      existing.ids.push(id);
    } else {
      map.set(key, { ids: [id], sections: sorted });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.ids.length - a.ids.length);
});

const usedTypes = computed<MovementType[]>(() => {
  const set = new Set<MovementType>();
  for (const sections of Object.values(props.hikeStats.individualStats)) {
    for (const s of sections) set.add(s.type || MovementType.WALK);
  }
  return Array.from(set);
});

/** Fills any gaps between sections (or before/after) with null-type "no data" segments. */
function buildSegments(sections: Section[]): Section[] {
  const total = totalLength.value;
  const segments: Section[] = [];
  let cursor = 0;

  for (const s of sections) {
    if (s.from > cursor) segments.push({ from: cursor, to: s.from, type: undefined });
    segments.push({ from: s.from, to: s.to, type: s.type });
    cursor = Math.max(cursor, s.to);
  }
  if (cursor < total) segments.push({ from: cursor, to: total, type: undefined });

  return segments;
}

function segmentWidthPct(seg: Section): number {
  const total = totalLength.value;
  if (!total) return 0;
  return ((seg.to - seg.from) / total) * 100;
}

function segmentStyle(seg: Section) {
  return {
    width: `${segmentWidthPct(seg)}%`,
    backgroundColor: seg.type ? config(seg.type).color : '#E0E0E0',
  };
}

function initials(id: string): string {
  return id.slice(0, 2).toUpperCase();
}
</script>

<style scoped>
.hike-breakdown .legend {
  display: flex;
  flex-wrap: wrap;
}
 
.group-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
 
.group-row:last-child {
  margin-bottom: 0;
}
 
.avatars {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 220px;
  flex-shrink: 0;
  gap: 4px;
}
 
/* Stack avatars above the bar once there isn't room for both side by side */
@media (max-width: 600px) {
  .group-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
 
  .avatars {
    width: auto;
  }
}
 
.ids-caption {
  line-height: 1.2;
}
 
.bar-wrapper {
  flex: 1;
  min-width: 0;
}
 
.stacked-bar {
  display: flex;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}
 
.segment {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.15s ease;
}
 
.segment:hover {
  filter: brightness(1.12);
}
 
.segment--empty {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.06),
    rgba(0, 0, 0, 0.06) 4px,
    transparent 4px,
    transparent 8px
  );
}
</style>