import { motion } from 'framer-motion';
import { ModelParameters, PresetType, PARAMETER_PRESETS } from '../../types';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface ParameterPanelProps {
  parameters: ModelParameters;
  onChange: (params: ModelParameters) => void;
  activePreset: PresetType | null;
  onPresetChange: (preset: PresetType) => void;
}

const presets: { id: PresetType; label: string; description: string }[] = [
  { id: 'creative', label: 'Creative', description: 'Higher randomness for creative outputs' },
  { id: 'balanced', label: 'Balanced', description: 'Good mix of creativity and coherence' },
  { id: 'precise', label: 'Precise', description: 'Focused and deterministic responses' },
];

export function ParameterPanel({
  parameters,
  onChange,
  activePreset,
  onPresetChange,
}: ParameterPanelProps) {
  const updateParameter = <K extends keyof ModelParameters>(
    key: K,
    value: ModelParameters[K]
  ) => {
    onChange({ ...parameters, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-900">Presets</h3>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <motion.button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium',
                'border transition-all duration-200',
                activePreset === preset.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              )}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
        {activePreset && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-slate-500"
          >
            {presets.find((p) => p.id === activePreset)?.description}
          </motion.p>
        )}
      </div>

      {/* Temperature */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-900">Parameters</h3>

        <Slider
          label="Temperature"
          value={parameters.temperature}
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => updateParameter('temperature', v)}
          displayValue={parameters.temperature.toFixed(1)}
        />

        <Slider
          label="Max Tokens"
          value={parameters.maxTokens}
          min={64}
          max={4096}
          step={64}
          onChange={(v) => updateParameter('maxTokens', v)}
          displayValue={parameters.maxTokens}
        />

        <Slider
          label="Top P"
          value={parameters.topP}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => updateParameter('topP', v)}
          displayValue={parameters.topP.toFixed(2)}
        />

        <Slider
          label="Top K"
          value={parameters.topK}
          min={1}
          max={100}
          step={1}
          onChange={(v) => updateParameter('topK', v)}
          displayValue={parameters.topK}
        />

        <Slider
          label="Repeat Penalty"
          value={parameters.repeatPenalty}
          min={1}
          max={2}
          step={0.05}
          onChange={(v) => updateParameter('repeatPenalty', v)}
          displayValue={parameters.repeatPenalty.toFixed(2)}
        />
      </div>

      {/* Parameter explanations */}
      <div className="p-3 bg-slate-50 rounded-lg space-y-2">
        <h4 className="text-xs font-medium text-slate-700">Parameter Guide</h4>
        <div className="space-y-1 text-xs text-slate-500">
          <p>
            <span className="font-medium">Temperature:</span> Controls randomness. Higher = more
            creative, lower = more focused.
          </p>
          <p>
            <span className="font-medium">Max Tokens:</span> Maximum length of the response.
          </p>
          <p>
            <span className="font-medium">Top P:</span> Nucleus sampling threshold for diversity.
          </p>
          <p>
            <span className="font-medium">Top K:</span> Limits vocabulary to top K tokens.
          </p>
          <p>
            <span className="font-medium">Repeat Penalty:</span> Discourages repetitive text.
          </p>
        </div>
      </div>
    </div>
  );
}
