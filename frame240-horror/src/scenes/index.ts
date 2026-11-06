// Scene id (src/data/timeline.ts) -> component.
import type React from 'react';
import {ColdOpen} from './ColdOpen';

export const SCENE_COMPONENTS: Record<string, React.FC> = {
	coldOpen: ColdOpen,
};
